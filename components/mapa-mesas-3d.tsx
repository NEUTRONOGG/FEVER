"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { Box, Eye, Crosshair } from "lucide-react"

export interface MesaMapa3D {
  id: number
  numero: string
  capacidad: number
  estado: string
  cliente_nombre?: string
  numero_personas?: number
  rp_asignado?: string
}

export interface MargenesMapa {
  arriba?: number
  abajo?: number
  izquierda?: number
  derecha?: number
}

interface MapaMesas3DProps {
  mesas: MesaMapa3D[]
  onSelectMesa?: (mesa: MesaMapa3D) => void
  onSinWebGL?: () => void
  /** Espacio ocupado por paneles encima del mapa; la cámara centra el plano en el área libre */
  margenes?: MargenesMapa
  /** Mesa iluminada desde fuera (p. ej. al pasar sobre un registro del panel) */
  mesaResaltada?: string | null
  /** Cambiar `t` hace que la cámara vuele hacia la mesa indicada */
  enfoque?: { numero: string; t: number } | null
  /** Detiene el render mientras un diálogo tapa el mapa (ahorra GPU y batería) */
  pausado?: boolean
  /** Controles extra para la barra de vista (p. ej. cambio a plano 2D) */
  accesorios?: ReactNode
}

// Posiciones del plano (mismas coordenadas que el SVG 640x1000 del panel hostess)
export const POSICIONES_MESAS: Record<string, { x: number; y: number }> = {
  '36': { x: 88, y: 215 }, '35': { x: 88, y: 325 }, '34': { x: 88, y: 435 }, '33': { x: 88, y: 545 },
  '26': { x: 227, y: 205 }, '25': { x: 227, y: 295 }, '24': { x: 227, y: 385 }, '23': { x: 227, y: 475 },
  '16': { x: 307, y: 205 }, '15': { x: 307, y: 295 }, '14': { x: 307, y: 385 }, '13': { x: 307, y: 475 },
  '7': { x: 552, y: 105 }, '6': { x: 552, y: 215 }, '5': { x: 552, y: 325 }, '4': { x: 552, y: 435 },
  '32': { x: 167, y: 615 }, '31': { x: 167, y: 705 }, '30': { x: 167, y: 795 },
  '22': { x: 307, y: 615 }, '21': { x: 307, y: 705 }, '20': { x: 307, y: 795 },
  '12': { x: 413, y: 615 }, '11': { x: 413, y: 705 }, '10': { x: 413, y: 795 },
  '2': { x: 552, y: 725 }, '1': { x: 552, y: 835 },
}

// Mesas dibujadas en el plano pero fuera de operación
const MESAS_INACTIVAS: Record<string, { x: number; y: number }> = {
  '37': { x: 88, y: 105 },
  '3': { x: 552, y: 615 },
}

export const COLORES_ESTADO: Record<string, string> = {
  disponible: '#10b981',
  ocupada: '#ef4444',
  reservada: '#f59e0b',
  cuenta: '#a855f7',
}
const COLOR_INACTIVA = '#475569'
const ORO = '#fbbf24'
const FONDO = '#070503'

const ESCALA = 20
const aMundo = (x: number, y: number) => ({ x: (x - 320) / ESCALA, z: (y - 500) / ESCALA })

const PISO_ANCHO = 34
const PISO_FONDO = 52
const MESA_ANCHO = 1.9
const MESA_FONDO = 2.4
const MESA_ALTO = 0.62
const MAX_BANCOS = 10
const EJE_Y = new THREE.Vector3(0, 1, 0)

interface Actividad {
  id: number
  numero: string
  estado: string
  hora: string
}

// Estado por mesa; la geometría vive en InstancedMesh compartidos (1 draw call por tipo de pieza)
interface Tabla {
  numero: string
  idx: number
  x: number
  z: number
  inactiva: boolean
  estado: string
  colorObjetivo: THREE.Color
  color: THREE.Color
  fase: number
  pulso: number
  hover: boolean
  resaltada: boolean
  elevacion: number
  escalaY: number
  columna: number
  anillo: number
  bancosTotal: number
  bancosOcupados: number
  firma: string
  sucia: boolean
  ancla: THREE.Object3D
  etiqueta: HTMLDivElement
  onda: THREE.Mesh
  ondaMat: THREE.MeshBasicMaterial
}

// ---------- Utilidades de geometría y texturas ----------
function rectRedondeado(ancho: number, fondo: number, radio: number) {
  const s = new THREE.Shape()
  const x = -ancho / 2
  const y = -fondo / 2
  s.moveTo(x + radio, y)
  s.lineTo(x + ancho - radio, y)
  s.quadraticCurveTo(x + ancho, y, x + ancho, y + radio)
  s.lineTo(x + ancho, y + fondo - radio)
  s.quadraticCurveTo(x + ancho, y + fondo, x + ancho - radio, y + fondo)
  s.lineTo(x + radio, y + fondo)
  s.quadraticCurveTo(x, y + fondo, x, y + fondo - radio)
  s.lineTo(x, y + radio)
  s.quadraticCurveTo(x, y, x + radio, y)
  return s
}

function lienzo(ancho: number, alto: number) {
  const c = document.createElement('canvas')
  c.width = ancho
  c.height = alto
  return { c, ctx: c.getContext('2d')! }
}

function texturaHalo() {
  const { c, ctx } = lienzo(128, 128)
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(255,255,255,0.5)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

// Opaco arriba y transparente abajo (con flipY, v=1 es arriba); invertido para columnas
function texturaDegradado(invertido = false) {
  const { c, ctx } = lienzo(4, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(invertido ? 1 : 0, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.25)')
  g.addColorStop(invertido ? 0 : 1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 256)
  return new THREE.CanvasTexture(c)
}

function texturaAnilloPunteado() {
  const { c, ctx } = lienzo(256, 256)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 7
  ctx.setLineDash([18, 14])
  ctx.beginPath()
  ctx.arc(128, 128, 112, 0, Math.PI * 2)
  ctx.stroke()
  return new THREE.CanvasTexture(c)
}

function texturaPiso() {
  const px = 24
  const { c, ctx } = lienzo(PISO_ANCHO * px, PISO_FONDO * px)
  const losa = 2 * px
  for (let y = 0; y < c.height; y += losa) {
    for (let x = 0; x < c.width; x += losa) {
      const v = 12 + Math.floor(Math.random() * 6)
      ctx.fillStyle = `rgb(${v + 3},${v + 1},${v - 2})`
      ctx.fillRect(x, y, losa, losa)
      ctx.strokeStyle = 'rgba(255,220,150,0.035)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + Math.random() * losa, y)
      ctx.bezierCurveTo(x + Math.random() * losa, y + losa * 0.3, x + Math.random() * losa, y + losa * 0.7, x + Math.random() * losa, y + losa)
      ctx.stroke()
    }
  }
  ctx.strokeStyle = 'rgba(251,191,36,0.16)'
  ctx.lineWidth = 1.2
  for (let x = 0; x <= c.width; x += losa) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke() }
  for (let y = 0; y <= c.height; y += losa) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke() }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function texturaLetrero(texto: string, ancho: number, fondo: number) {
  const { c, ctx } = lienzo(1024, Math.round(1024 * (fondo / ancho)))
  ctx.fillStyle = '#0a0806'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.strokeStyle = 'rgba(251,191,36,0.55)'
  ctx.lineWidth = 6
  ctx.strokeRect(14, 14, c.width - 28, c.height - 28)
  ctx.font = `900 ${Math.round(c.height * 0.5)}px "Arial Black", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#fbbf24'
  ctx.shadowBlur = 30
  ctx.fillStyle = '#fcd34d'
  ctx.fillText(texto, c.width / 2, c.height / 2 + c.height * 0.03)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

// Colores > 1 para que el bloom los haga brillar como neón
function neon(color: THREE.ColorRepresentation, intensidad: number) {
  return new THREE.Color(color).multiplyScalar(intensidad)
}

// Ecualizador procedural en GPU (sin subir texturas cada cuadro)
function materialEcualizador() {
  return new THREE.ShaderMaterial({
    uniforms: { uTiempo: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTiempo;
      varying vec2 vUv;
      void main() {
        float n = 40.0;
        float i = floor(vUv.x * n);
        float fx = fract(vUv.x * n);
        float h = (0.25 + 0.75 * abs(sin(uTiempo * (2.2 + mod(i, 7.0) * 0.35) + i * 0.7)) * (0.6 + 0.4 * sin(uTiempo * 1.3 + i))) * 0.85;
        float barra = step(0.1, fx) * step(fx, 0.9) * step(vUv.y, h);
        vec3 col = mix(vec3(0.95, 0.55, 0.03), vec3(1.0, 0.88, 0.5), vUv.y / max(h, 0.01)) * 1.25;
        gl_FragColor = vec4(mix(vec3(0.012, 0.009, 0.006), col, barra), 1.0);
      }
    `,
  })
}

// Partículas animadas en el vertex shader (cero trabajo de CPU por cuadro)
function materialParticulas(mapa: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTiempo: { value: 0 },
      uEscala: { value: 400 },
      uMapa: { value: mapa },
      uColor: { value: new THREE.Color('#ffd27a') },
    },
    vertexShader: /* glsl */ `
      attribute float aVel;
      attribute float aFase;
      uniform float uTiempo;
      uniform float uEscala;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + uTiempo * aVel, 7.0);
        p.x += sin(uTiempo * 0.3 + aFase) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = 0.12 * uEscala / -mv.z;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMapa;
      uniform vec3 uColor;
      void main() {
        float a = texture2D(uMapa, gl_PointCoord).a * 0.55;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

// ---------- Etiquetas HTML ----------
function pintarEtiqueta(el: HTMLDivElement, mesa: MesaMapa3D | null, numero: string, resaltada = false) {
  const estado = mesa?.estado ?? 'inactiva'
  const color = COLORES_ESTADO[estado] ?? COLOR_INACTIVA
  el.className = `select-none flex flex-col items-center leading-none ${estado === 'inactiva' ? 'pointer-events-none opacity-40' : 'pointer-events-auto cursor-pointer'}`
  el.replaceChildren()

  const num = document.createElement('span')
  num.dataset.rol = 'numero'
  num.textContent = numero
  num.className = 'flex items-center justify-center min-w-[30px] h-[30px] px-1.5 rounded-full text-[13px] font-black text-white transition-transform duration-200'
  num.style.background = 'rgba(10,8,5,0.82)'
  num.style.border = `2px solid ${color}`
  num.style.boxShadow = `0 0 14px ${color}99, inset 0 0 10px ${color}55`
  num.style.textShadow = `0 0 8px ${color}`
  if (resaltada) num.style.transform = 'scale(1.25)'
  el.appendChild(num)

  if (mesa && estado === 'ocupada' && mesa.cliente_nombre) {
    const sub = document.createElement('span')
    sub.textContent = `${mesa.cliente_nombre.split(' ')[0]}${mesa.numero_personas ? ` · ${mesa.numero_personas}p` : ''}`
    sub.className = 'hidden sm:block mt-1 max-w-[96px] truncate px-2 py-0.5 rounded-full text-[10px] font-semibold text-white/90 bg-black/80 border border-red-500/40'
    el.appendChild(sub)
  } else if (estado === 'reservada') {
    const sub = document.createElement('span')
    sub.textContent = 'RES'
    sub.className = 'hidden sm:block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest text-amber-300 bg-black/80 border border-amber-500/40'
    el.appendChild(sub)
  }
}

export default function MapaMesas3D({ mesas, onSelectMesa, onSinWebGL, margenes, mesaResaltada, enfoque, pausado, accesorios }: MapaMesas3DProps) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const tablasRef = useRef<Map<string, Tabla>>(new Map())
  const mesasRef = useRef<MesaMapa3D[]>(mesas)
  const onSelectRef = useRef(onSelectMesa)
  const resaltadaRef = useRef<string | null>(mesaResaltada ?? null)
  const pausadoRef = useRef(!!pausado)
  const margenesRef = useRef<Required<MargenesMapa>>({ arriba: 0, abajo: 0, izquierda: 0, derecha: 0 })
  const apiRef = useRef<{
    vista: (v: '3d' | 'aerea') => void
    enfocar: (numero: string) => void
    reencuadrar: () => void
    marcarEtiquetas: () => void
  } | null>(null)
  const estadosPreviosRef = useRef<Map<string, string> | null>(null)
  const [sinWebGL, setSinWebGL] = useState(false)
  const [actividad, setActividad] = useState<Actividad[]>([])
  const [vista, setVista] = useState<'3d' | 'aerea'>('3d')
  const [listo, setListo] = useState(false)

  onSelectRef.current = onSelectMesa
  mesasRef.current = mesas
  resaltadaRef.current = mesaResaltada ?? null
  pausadoRef.current = !!pausado
  margenesRef.current = {
    arriba: margenes?.arriba ?? 0,
    abajo: margenes?.abajo ?? 0,
    izquierda: margenes?.izquierda ?? 0,
    derecha: margenes?.derecha ?? 0,
  }

  // ---------- Construcción de la escena (una sola vez) ----------
  useEffect(() => {
    const contenedor = contenedorRef.current
    if (!contenedor) return
    let vivo = true

    let renderer: THREE.WebGLRenderer
    try {
      // Sin antialias en el canvas: el MSAA se hace en el render target del composer
      renderer = new THREE.WebGLRenderer({ antialias: false, stencil: false, powerPreference: 'high-performance' })
    } catch {
      setSinWebGL(true)
      onSinWebGL?.()
      return
    }

    const W = () => Math.max(contenedor.clientWidth, 1)
    const H = () => Math.max(contenedor.clientHeight, 1)
    const tactil = window.matchMedia('(pointer: coarse)').matches
    const prMax = Math.min(window.devicePixelRatio || 1, tactil ? 1.5 : 1.75)
    const prMin = Math.min(0.85, prMax)
    let pr = prMax

    renderer.setPixelRatio(pr)
    renderer.setSize(W(), H())
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // Las sombras solo se recalculan cuando algo se mueve
    renderer.shadowMap.autoUpdate = false
    renderer.shadowMap.needsUpdate = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.touchAction = 'none'
    contenedor.appendChild(renderer.domElement)

    const etiquetas = new CSS2DRenderer()
    etiquetas.setSize(W(), H())
    etiquetas.domElement.style.position = 'absolute'
    etiquetas.domElement.style.inset = '0'
    etiquetas.domElement.style.pointerEvents = 'none'
    contenedor.appendChild(etiquetas.domElement)

    const escena = new THREE.Scene()
    escena.background = new THREE.Color(FONDO)
    escena.fog = new THREE.FogExp2(FONDO, 0.009)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    escena.environment = entorno
    escena.environmentIntensity = 0.35

    const camara = new THREE.PerspectiveCamera(38, W() / H(), 0.5, 400)

    // Composer HDR con MSAA; el bloom trabaja a media resolución
    const objetivo = new THREE.WebGLRenderTarget(W() * pr, H() * pr, { type: THREE.HalfFloatType, samples: 4 })
    const composer = new EffectComposer(renderer, objetivo)
    composer.setPixelRatio(pr)
    composer.setSize(W(), H())
    composer.addPass(new RenderPass(escena, camara))
    const bloom = new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.55, 0.5, 0.9)
    const ajustarBloom = bloom.setSize.bind(bloom)
    bloom.setSize = (w: number, h: number) => ajustarBloom(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)))
    bloom.setSize(W() * pr, H() * pr)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    const controles = new OrbitControls(camara, renderer.domElement)
    controles.enableDamping = true
    controles.dampingFactor = 0.08
    controles.maxPolarAngle = Math.PI / 2.3
    controles.minDistance = 8
    controles.maxDistance = 140
    controles.target.set(0, 0, 1)

    let etiquetasSucias = true
    controles.addEventListener('change', () => { etiquetasSucias = true })

    const haloTex = texturaHalo()
    const hazTex = texturaDegradado()
    const columnaTex = texturaDegradado(true)
    const punteadoTex = texturaAnilloPunteado()

    // ---------- Luces ----------
    escena.add(new THREE.HemisphereLight('#ffe9c4', '#050403', 0.35))
    const sol = new THREE.DirectionalLight('#ffe2b0', 1.25)
    sol.position.set(12, 34, 22)
    sol.castShadow = true
    const sombra = tactil ? 1024 : 2048
    sol.shadow.mapSize.set(sombra, sombra)
    Object.assign(sol.shadow.camera, { left: -22, right: 22, top: 30, bottom: -30, far: 100 })
    sol.shadow.bias = -0.0005
    sol.shadow.radius = 4
    escena.add(sol)
    const luzCabina = new THREE.PointLight(ORO, 40, 30, 1.6)
    luzCabina.position.set(0, 4.5, -18)
    escena.add(luzCabina)
    const luzBarra = new THREE.PointLight('#ffb347', 28, 24, 1.6)
    luzBarra.position.set(2.5, 4, 19.5)
    escena.add(luzBarra)

    // ---------- Piso y muros ----------
    const pisoTex = texturaPiso()
    const piso = new THREE.Mesh(
      new THREE.PlaneGeometry(PISO_ANCHO, PISO_FONDO),
      new THREE.MeshStandardMaterial({ map: pisoTex, roughness: 0.32, metalness: 0.55, envMapIntensity: 0.8 })
    )
    piso.rotation.x = -Math.PI / 2
    piso.receiveShadow = true
    escena.add(piso)

    const exterior = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: '#050403' }))
    exterior.rotation.x = -Math.PI / 2
    exterior.position.y = -0.02
    escena.add(exterior)

    const muroMat = new THREE.MeshStandardMaterial({ color: '#0d0a07', roughness: 0.55, metalness: 0.4 })
    const ledMat = new THREE.MeshBasicMaterial({ color: neon(ORO, 1.5) })
    const muros: [number, number, number, number, number][] = [
      // x, z, ancho, fondo, alto
      [0, -PISO_FONDO / 2 - 0.2, PISO_ANCHO + 0.8, 0.4, 2.4],
      [-PISO_ANCHO / 2 - 0.2, 0, 0.4, PISO_FONDO + 0.4, 1.1],
      [PISO_ANCHO / 2 + 0.2, 0, 0.4, PISO_FONDO + 0.4, 1.1],
    ]
    muros.forEach(([x, z, w, d, h]) => {
      const muro = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), muroMat)
      muro.position.set(x, h / 2, z)
      muro.receiveShadow = true
      escena.add(muro)
      const led = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.06, d + 0.02), ledMat)
      led.position.set(x, h + 0.03, z)
      escena.add(led)
    })
    const ledFrente = new THREE.Mesh(new THREE.BoxGeometry(PISO_ANCHO, 0.04, 0.08), ledMat)
    ledFrente.position.set(0, 0.02, PISO_FONDO / 2)
    escena.add(ledFrente)

    // ---------- Pasillo central ----------
    const p = (x: number, y: number) => aMundo(x, y)
    const pasillo = new THREE.Shape()
    const m0 = p(260, 170); pasillo.moveTo(m0.x, m0.z)
    let q = p(260, 540); pasillo.lineTo(q.x, q.z)
    let c1 = p(260, 560); q = p(280, 560); pasillo.quadraticCurveTo(c1.x, c1.z, q.x, q.z)
    q = p(360, 560); pasillo.lineTo(q.x, q.z)
    c1 = p(380, 560); q = p(380, 580); pasillo.quadraticCurveTo(c1.x, c1.z, q.x, q.z)
    q = p(380, 870); pasillo.lineTo(q.x, q.z)
    c1 = p(380, 880); q = p(370, 880); pasillo.quadraticCurveTo(c1.x, c1.z, q.x, q.z)
    q = p(260, 880); pasillo.lineTo(q.x, q.z)
    c1 = p(250, 880); q = p(250, 870); pasillo.quadraticCurveTo(c1.x, c1.z, q.x, q.z)
    q = p(250, 180); pasillo.lineTo(q.x, q.z)
    c1 = p(250, 170); pasillo.quadraticCurveTo(c1.x, c1.z, m0.x, m0.z)

    const pasilloGeo = new THREE.ShapeGeometry(pasillo, 12)
    pasilloGeo.rotateX(Math.PI / 2)
    const pasilloMesh = new THREE.Mesh(
      pasilloGeo,
      new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.045, side: THREE.DoubleSide, depthWrite: false })
    )
    pasilloMesh.position.y = 0.012
    escena.add(pasilloMesh)
    const contorno = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pasillo.getPoints(12).map((v) => new THREE.Vector3(v.x, 0.02, v.y))),
      new THREE.LineDashedMaterial({ color: neon(ORO, 1.6), dashSize: 0.35, gapSize: 0.25 })
    )
    contorno.computeLineDistances()
    escena.add(contorno)

    // ---------- CABINA (DJ) y BARRA ----------
    const eqMat = materialEcualizador()
    const crearBloque = (texto: string, x: number, y: number, w: number, h: number, altura: number, frenteEq: boolean) => {
      const centro = aMundo(x + w / 2, y + h / 2)
      const anchoM = w / ESCALA
      const fondoM = h / ESCALA
      const tapaTex = texturaLetrero(texto, anchoM, fondoM)
      const lado = new THREE.MeshStandardMaterial({ color: '#0b0907', metalness: 0.85, roughness: 0.22, envMapIntensity: 1.2 })
      const tapa = new THREE.MeshStandardMaterial({ map: tapaTex, emissiveMap: tapaTex, emissive: '#ffffff', emissiveIntensity: 0.75, roughness: 0.3, metalness: 0.4 })
      const bloque = new THREE.Mesh(new THREE.BoxGeometry(anchoM, altura, fondoM), [lado, lado, tapa, lado, frenteEq ? eqMat : lado, lado])
      bloque.position.set(centro.x, altura / 2, centro.z)
      bloque.castShadow = true
      bloque.receiveShadow = true
      escena.add(bloque)

      const filo = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(anchoM, altura, fondoM)),
        new THREE.LineBasicMaterial({ color: neon(ORO, 1.3) })
      )
      filo.position.copy(bloque.position)
      escena.add(filo)

      const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(anchoM + 6, fondoM + 6),
        new THREE.MeshBasicMaterial({ map: haloTex, color: ORO, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
      )
      halo.rotation.x = -Math.PI / 2
      halo.position.set(centro.x, 0.015, centro.z)
      escena.add(halo)
      return { centro }
    }

    const cabina = crearBloque('CABINA', 105, 30, 420, 110, 1.7, true)
    crearBloque('BARRA', 105, 920, 530, 70, 1.25, false)

    // Haces de luz que barren la pista desde la cabina
    const hazGeo = new THREE.ConeGeometry(3.2, 20, 24, 1, true)
    hazGeo.translate(0, -10, 0)
    const haces: THREE.Mesh[] = []
    ;['#fbbf24', '#ff8a3d', '#fde68a', '#f59e0b'].forEach((color, i) => {
      const haz = new THREE.Mesh(hazGeo, new THREE.MeshBasicMaterial({
        color, map: hazTex, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
      }))
      haz.position.set(cabina.centro.x - 7.5 + i * 5, 4.2, cabina.centro.z + 1.2)
      haz.userData.fase = i * 1.7
      haces.push(haz)
      escena.add(haz)
    })

    // ---------- Instancing: helpers ----------
    const m4 = new THREE.Matrix4()
    const vPos = new THREE.Vector3()
    const vEsc = new THREE.Vector3()
    const qRot = new THREE.Quaternion()
    const fijar = (im: THREE.InstancedMesh, i: number, x: number, y: number, z: number, rotY = 0, sx = 1, sy = 1, sz = 1) => {
      vPos.set(x, y, z)
      qRot.setFromAxisAngle(EJE_Y, rotY)
      vEsc.set(sx, sy, sz)
      im.setMatrixAt(i, m4.compose(vPos, qRot, vEsc))
    }
    const instanciado = (geo: THREE.BufferGeometry, mat: THREE.Material, n: number, sombras = false) => {
      const im = new THREE.InstancedMesh(geo, mat, n)
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      im.frustumCulled = false
      im.castShadow = sombras
      im.receiveShadow = sombras
      escena.add(im)
      return im
    }

    // ---------- Periqueras laterales (instanciadas) ----------
    const periqueras: [number, number][] = [
      [30, 90], [30, 200], [30, 310], [30, 420], [30, 530],
      [610, 90], [610, 200], [610, 310], [610, 420], [610, 600], [610, 710], [610, 820],
    ]
    const periquerasIM = instanciado(
      new THREE.CylinderGeometry(1.05, 1.05, 0.55, 40),
      new THREE.MeshStandardMaterial({ color: '#15110c', metalness: 0.7, roughness: 0.3 }),
      periqueras.length, true
    )
    const arosGeo = new THREE.TorusGeometry(1.05, 0.035, 8, 64)
    arosGeo.rotateX(Math.PI / 2)
    const arosIM = instanciado(arosGeo, new THREE.MeshBasicMaterial({ color: '#8a6a30' }), periqueras.length)
    periqueras.forEach(([x, y], i) => {
      const pos = aMundo(x, y)
      fijar(periquerasIM, i, pos.x, 0.275, pos.z, 0, 1, 1, 1.4)
      fijar(arosIM, i, pos.x, 0.56, pos.z, 0, 1, 1, 1.4)
    })

    const marcoPos = aMundo(175, 190)
    const marco = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.5, 0.3, 3)),
      new THREE.LineBasicMaterial({ color: '#7c6a4a', transparent: true, opacity: 0.6 })
    )
    marco.position.set(marcoPos.x, 0.15, marcoPos.z)
    escena.add(marco)

    // ---------- Partículas ambientales (GPU) ----------
    const nParticulas = tactil ? 220 : 380
    const posParticulas = new Float32Array(nParticulas * 3)
    const velParticulas = new Float32Array(nParticulas)
    const faseParticulas = new Float32Array(nParticulas)
    for (let i = 0; i < nParticulas; i++) {
      posParticulas[i * 3] = (Math.random() - 0.5) * PISO_ANCHO
      posParticulas[i * 3 + 1] = Math.random() * 7
      posParticulas[i * 3 + 2] = (Math.random() - 0.5) * PISO_FONDO
      velParticulas[i] = 0.12 + (i % 5) * 0.03
      faseParticulas[i] = Math.random() * 6.28
    }
    const particulasGeo = new THREE.BufferGeometry()
    particulasGeo.setAttribute('position', new THREE.BufferAttribute(posParticulas, 3))
    particulasGeo.setAttribute('aVel', new THREE.BufferAttribute(velParticulas, 1))
    particulasGeo.setAttribute('aFase', new THREE.BufferAttribute(faseParticulas, 1))
    const particulasMat = materialParticulas(haloTex)
    const particulas = new THREE.Points(particulasGeo, particulasMat)
    particulas.frustumCulled = false
    escena.add(particulas)
    const ajustarParticulas = () => { particulasMat.uniforms.uEscala.value = H() * pr * 0.5 }
    ajustarParticulas()

    // ---------- Mesas (instanciadas) ----------
    const listaMesas = [
      ...Object.entries(POSICIONES_MESAS).map(([n, v]) => ({ numero: n, ...v, inactiva: false })),
      ...Object.entries(MESAS_INACTIVAS).map(([n, v]) => ({ numero: n, ...v, inactiva: true })),
    ]
    const N = listaMesas.length

    const cuerpoGeo = new THREE.ExtrudeGeometry(rectRedondeado(MESA_ANCHO, MESA_FONDO, 0.3), {
      depth: MESA_ALTO, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3, curveSegments: 10,
    })
    cuerpoGeo.rotateX(-Math.PI / 2)
    const marcoNeon = rectRedondeado(MESA_ANCHO + 0.08, MESA_FONDO + 0.08, 0.34)
    marcoNeon.holes.push(new THREE.Path(rectRedondeado(MESA_ANCHO - 0.1, MESA_FONDO - 0.1, 0.26).getPoints(24)))
    const neonGeo = new THREE.ExtrudeGeometry(marcoNeon, { depth: 0.05, bevelEnabled: false, curveSegments: 10 })
    neonGeo.rotateX(-Math.PI / 2)
    const cristalGeo = new THREE.ShapeGeometry(rectRedondeado(MESA_ANCHO - 0.4, MESA_FONDO - 0.4, 0.2), 8)
    cristalGeo.rotateX(-Math.PI / 2)
    const haloGeo = new THREE.PlaneGeometry(5.4, 6)
    haloGeo.rotateX(-Math.PI / 2)
    const columnaGeo = new THREE.CylinderGeometry(1.35, 1.35, 3.6, 32, 1, true)
    columnaGeo.translate(0, 1.8, 0)
    const anilloGeo = new THREE.PlaneGeometry(4.2, 4.2)
    anilloGeo.rotateX(-Math.PI / 2)
    const ondaGeo = new THREE.RingGeometry(1.45, 1.6, 64)
    ondaGeo.rotateX(-Math.PI / 2)

    // Cristal negro brillante cuyo resplandor sale del color de la instancia
    const cristalMat = new THREE.MeshStandardMaterial({ color: '#000000', metalness: 0, roughness: 0.08, envMapIntensity: 2 })
    cristalMat.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n  totalEmissiveRadiance += vColor.rgb;'
      )
    }
    const aditivo = (mapa: THREE.Texture, lados: THREE.Side = THREE.FrontSide) =>
      new THREE.MeshBasicMaterial({ map: mapa, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: lados })

    const cuerpoIM = instanciado(cuerpoGeo, new THREE.MeshStandardMaterial({ color: '#0c0a08', metalness: 0.9, roughness: 0.18, envMapIntensity: 1.4 }), N, true)
    const neonIM = instanciado(neonGeo, new THREE.MeshBasicMaterial({ color: '#ffffff' }), N)
    const cristalIM = instanciado(cristalGeo, cristalMat, N)
    const haloIM = instanciado(haloGeo, aditivo(haloTex), N)
    const columnaIM = instanciado(columnaGeo, aditivo(columnaTex, THREE.DoubleSide), N)
    const anilloIM = instanciado(anilloGeo, aditivo(punteadoTex), N)

    // Bancos: cojín encendido / apagado + poste cromado (3 draw calls para todos)
    const cojinGeo = new THREE.CylinderGeometry(0.25, 0.23, 0.13, 20)
    cojinGeo.translate(0, 0.5, 0)
    const posteGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.44, 8)
    posteGeo.translate(0, 0.22, 0)
    const baseGeo = new THREE.CylinderGeometry(0.17, 0.19, 0.03, 20)
    baseGeo.translate(0, 0.015, 0)
    const cromoGeo = mergeGeometries([posteGeo, baseGeo])!
    const cojinOnIM = instanciado(cojinGeo, new THREE.MeshBasicMaterial({ color: '#ffffff' }), N * MAX_BANCOS)
    const cojinOffIM = instanciado(cojinGeo, new THREE.MeshStandardMaterial({ color: '#2b231a', roughness: 0.65, metalness: 0.1 }), N * MAX_BANCOS, true)
    const cromoIM = instanciado(cromoGeo, new THREE.MeshStandardMaterial({ color: '#c9c2b3', metalness: 1, roughness: 0.25 }), N * MAX_BANCOS, true)
    cojinOnIM.castShadow = true

    const tmp = new THREE.Color()
    const negro = new THREE.Color(0, 0, 0)

    const seleccionar = (numero: string) => {
      const mesa = mesasRef.current.find((m) => m.numero === numero)
      if (mesa && POSICIONES_MESAS[numero]) onSelectRef.current?.(mesa)
    }

    const marcarHover = (numero: string | null) => {
      tablasRef.current.forEach((t, n) => { t.hover = n === numero && !t.inactiva })
      renderer.domElement.style.cursor = numero && POSICIONES_MESAS[numero] ? 'pointer' : 'grab'
    }

    const actualizarMatrices = (t: Tabla) => {
      const y = t.elevacion
      fijar(cuerpoIM, t.idx, t.x, y, t.z, 0, 1, t.escalaY, 1)
      fijar(neonIM, t.idx, t.x, y + (MESA_ALTO + 0.02) * t.escalaY, t.z)
      fijar(cristalIM, t.idx, t.x, y + (MESA_ALTO + 0.075) * t.escalaY, t.z)
      const visibleCol = t.columna > 0.005 ? 1 : 0
      fijar(columnaIM, t.idx, t.x, 0, t.z, 0, visibleCol, visibleCol, visibleCol)
      const n = Math.max(2, Math.min(t.bancosTotal, MAX_BANCOS))
      for (let i = 0; i < MAX_BANCOS; i++) {
        const slot = t.idx * MAX_BANCOS + i
        if (i >= n) {
          fijar(cojinOnIM, slot, t.x, 0, t.z, 0, 0, 0, 0)
          fijar(cojinOffIM, slot, t.x, 0, t.z, 0, 0, 0, 0)
          fijar(cromoIM, slot, t.x, 0, t.z, 0, 0, 0, 0)
          continue
        }
        const ang = (i / n) * Math.PI * 2 + Math.PI / n
        const bx = t.x + Math.cos(ang) * 1.42
        const bz = t.z + Math.sin(ang) * 1.74
        const encendido = i < t.bancosOcupados ? 1 : 0
        fijar(cojinOnIM, slot, bx, y, bz, 0, encendido, encendido, encendido)
        fijar(cojinOffIM, slot, bx, y, bz, 0, 1 - encendido, 1 - encendido, 1 - encendido)
        fijar(cromoIM, slot, bx, y, bz)
      }
      t.ancla.position.y = 1.7 + y
    }

    listaMesas.forEach(({ numero, x, y, inactiva }, idx) => {
      const pos = aMundo(x, y)
      const colorBase = new THREE.Color(inactiva ? COLOR_INACTIVA : COLORES_ESTADO.disponible)

      const ondaMat = new THREE.MeshBasicMaterial({ color: colorBase.clone(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
      const onda = new THREE.Mesh(ondaGeo, ondaMat)
      onda.position.set(pos.x, 0.04, pos.z)
      escena.add(onda)

      const etiqueta = document.createElement('div')
      etiqueta.style.willChange = 'transform'
      etiqueta.addEventListener('click', (e) => { e.stopPropagation(); seleccionar(numero) })
      etiqueta.addEventListener('pointerenter', () => marcarHover(numero))
      etiqueta.addEventListener('pointerleave', () => marcarHover(null))
      const ancla = new THREE.Object3D()
      ancla.position.set(pos.x, 1.7, pos.z)
      ancla.add(new CSS2DObject(etiqueta))
      escena.add(ancla)

      const t: Tabla = {
        numero, idx, x: pos.x, z: pos.z, inactiva,
        estado: inactiva ? 'inactiva' : '',
        colorObjetivo: colorBase.clone(),
        color: colorBase.clone(),
        fase: Math.random() * Math.PI * 2,
        pulso: 0, hover: false, resaltada: false,
        elevacion: 0, escalaY: 1, columna: 0, anillo: 0,
        bancosTotal: 4, bancosOcupados: 0,
        firma: '', sucia: false,
        ancla, etiqueta, onda, ondaMat,
      }
      tablasRef.current.set(numero, t)

      fijar(haloIM, idx, t.x, 0.02, t.z)
      fijar(anilloIM, idx, t.x, 0.035, t.z, 0, 0, 0, 0)
      actualizarMatrices(t)
      if (inactiva) {
        neonIM.setColorAt(idx, colorBase.clone().multiplyScalar(0.4))
        cristalIM.setColorAt(idx, colorBase.clone().multiplyScalar(0.05))
        haloIM.setColorAt(idx, negro)
      } else {
        neonIM.setColorAt(idx, neon(colorBase, 2))
        cristalIM.setColorAt(idx, colorBase.clone().multiplyScalar(0.35))
        haloIM.setColorAt(idx, colorBase.clone().multiplyScalar(0.45))
      }
      columnaIM.setColorAt(idx, negro)
      anilloIM.setColorAt(idx, negro)
      for (let i = 0; i < MAX_BANCOS; i++) cojinOnIM.setColorAt(idx * MAX_BANCOS + i, colorBase)
      pintarEtiqueta(etiqueta, inactiva ? null : { id: 0, numero, capacidad: 4, estado: 'disponible' }, numero)
    })

    const tablasPorIndice = Array.from(tablasRef.current.values()).sort((a, b) => a.idx - b.idx)

    // ---------- Interacción ----------
    const raycaster = new THREE.Raycaster()
    const puntero = new THREE.Vector2()
    const objetivosRayo = [cuerpoIM, cristalIM]
    let inicioToque: { x: number; y: number } | null = null
    let hoverPendiente: { x: number; y: number } | null = null

    const mesaEn = (clientX: number, clientY: number) => {
      const r = renderer.domElement.getBoundingClientRect()
      puntero.x = ((clientX - r.left) / r.width) * 2 - 1
      puntero.y = -((clientY - r.top) / r.height) * 2 + 1
      raycaster.setFromCamera(puntero, camara)
      const hit = raycaster.intersectObjects(objetivosRayo, false)[0]
      if (hit?.instanceId === undefined) return null
      const t = tablasPorIndice[hit.instanceId]
      return t && !t.inactiva ? t.numero : null
    }
    const alBajar = (ev: PointerEvent) => { inicioToque = { x: ev.clientX, y: ev.clientY } }
    const alSubir = (ev: PointerEvent) => {
      if (!inicioToque) return
      const movido = Math.hypot(ev.clientX - inicioToque.x, ev.clientY - inicioToque.y)
      inicioToque = null
      if (movido > 8) return
      const numero = mesaEn(ev.clientX, ev.clientY)
      if (numero) seleccionar(numero)
    }
    // El hover se resuelve una vez por cuadro, no en cada evento del mouse
    const alMover = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse' || inicioToque) return
      hoverPendiente = { x: ev.clientX, y: ev.clientY }
    }
    renderer.domElement.addEventListener('pointerdown', alBajar)
    renderer.domElement.addEventListener('pointerup', alSubir)
    renderer.domElement.addEventListener('pointermove', alMover)

    // ---------- Cámara ----------
    let vistaActual: '3d' | 'aerea' = '3d'
    let transicion: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null

    // Desplaza el centro de proyección al área que no tapan los paneles
    const aplicarMargenes = () => {
      const m = margenesRef.current
      const w = W()
      const h = H()
      camara.aspect = w / h
      camara.setViewOffset(w, h, (m.derecha - m.izquierda) / 2, (m.abajo - m.arriba) / 2, w, h)
      camara.updateProjectionMatrix()
      etiquetasSucias = true
    }

    const calcularVista = (tipo: '3d' | 'aerea') => {
      const m = margenesRef.current
      const libreW = Math.max(W() - m.izquierda - m.derecha, 200)
      const libreH = Math.max(H() - m.arriba - m.abajo, 200)
      const tanV = Math.tan(THREE.MathUtils.degToRad(camara.fov) / 2)
      const vertical = libreW / libreH < 0.8
      const distH = (PISO_ANCHO / 2 + 0.5) / (tanV * (libreW / H()))
      const distV = (PISO_FONDO / 2 + 1) / (tanV * (libreH / H()))
      const factor = tipo === '3d' ? (vertical ? 0.98 : 0.8) : 1.02
      const dist = Math.max(distH, distV) * factor
      const dir = tipo === '3d'
        ? new THREE.Vector3(0, vertical ? 0.9 : 0.76, vertical ? 0.42 : 0.64).normalize()
        : new THREE.Vector3(0, 1, 0.001)
      const target = new THREE.Vector3(0, 0, tipo === '3d' ? 2 : 0.5)
      return { pos: dir.multiplyScalar(dist).add(target), target }
    }

    aplicarMargenes()
    const inicial = calcularVista('3d')
    camara.position.copy(inicial.pos).add(new THREE.Vector3(26, 14, 30))
    controles.target.copy(inicial.target)
    transicion = inicial
    controles.addEventListener('start', () => { transicion = null })

    apiRef.current = {
      vista: (tipo) => { vistaActual = tipo; transicion = calcularVista(tipo) },
      reencuadrar: () => { aplicarMargenes(); transicion = calcularVista(vistaActual) },
      enfocar: (numero) => {
        const t = tablasRef.current.get(numero)
        if (!t) return
        const target = new THREE.Vector3(t.x, 0, t.z)
        const dir = vistaActual === '3d' ? new THREE.Vector3(0, 0.82, 0.57) : new THREE.Vector3(0, 1, 0.001)
        transicion = { pos: dir.normalize().multiplyScalar(W() < 700 ? 30 : 26).add(target), target }
        t.pulso = 1
      },
      marcarEtiquetas: () => { etiquetasSucias = true },
    }

    // ---------- Calidad adaptativa ----------
    // Mantiene los FPS al ritmo de la pantalla bajando/subiendo la resolución interna
    const aplicarResolucion = () => {
      renderer.setPixelRatio(pr)
      renderer.setSize(W(), H())
      composer.setPixelRatio(pr)
      composer.setSize(W(), H())
      ajustarParticulas()
    }
    let refresco = 1 / 60
    let sumaDt = 0
    let cuadros = 0
    let ultimoCambio = 0
    let techo = prMax

    const ro = new ResizeObserver(() => {
      aplicarResolucion()
      etiquetas.setSize(W(), H())
      aplicarMargenes()
    })
    ro.observe(contenedor)

    // ---------- Animación ----------
    const reloj = new THREE.Clock(false)
    const suavizado = (base: number, dt: number) => 1 - Math.pow(1 - base, dt * 60)

    const cuadro = () => {
      const dtReal = reloj.getDelta()
      if (pausadoRef.current || document.hidden) return
      const dt = Math.min(dtReal, 0.05)
      const t = reloj.elapsedTime

      // Gobernador de calidad (ignora el arranque y pausas largas)
      if (t > 2.5 && dtReal < 0.25) {
        if (dtReal > 0.004) refresco = Math.min(refresco, dtReal)
        sumaDt += dtReal
        cuadros++
        if (cuadros >= 45) {
          const promedio = sumaDt / cuadros
          sumaDt = 0
          cuadros = 0
          if (promedio > refresco * 1.3 && pr > prMin) {
            techo = Math.max(prMin, pr - 0.05)
            pr = Math.max(prMin, +(pr - 0.2).toFixed(2))
            ultimoCambio = t
            aplicarResolucion()
          } else if (promedio < refresco * 1.08 && pr < techo && t - ultimoCambio > 4) {
            pr = Math.min(techo, +(pr + 0.1).toFixed(2))
            ultimoCambio = t
            aplicarResolucion()
          } else if (t - ultimoCambio > 30 && techo < prMax) {
            techo = Math.min(prMax, techo + 0.1)
          }
        }
      }

      if (transicion) {
        const k = suavizado(0.07, dt)
        camara.position.lerp(transicion.pos, k)
        controles.target.lerp(transicion.target, k)
        if (camara.position.distanceTo(transicion.pos) < 0.05) transicion = null
        etiquetasSucias = true
      }
      controles.update()

      if (hoverPendiente) {
        marcarHover(mesaEn(hoverPendiente.x, hoverPendiente.y))
        hoverPendiente = null
      }

      eqMat.uniforms.uTiempo.value = t
      particulasMat.uniforms.uTiempo.value = t
      for (const haz of haces) {
        const f = haz.userData.fase as number
        haz.rotation.x = -(0.95 + Math.sin(t * 0.45 + f) * 0.25)
        haz.rotation.z = Math.sin(t * 0.6 + f * 1.3) * 0.55
        ;(haz.material as THREE.MeshBasicMaterial).opacity = 0.06 + 0.04 * (0.5 + 0.5 * Math.sin(t * 1.7 + f))
      }

      const kColor = suavizado(0.08, dt)
      const kElev = suavizado(0.18, dt)
      let matricesSucias = false
      let anillosSucios = false

      for (const m of tablasPorIndice) {
        if (m.inactiva) continue
        m.color.lerp(m.colorObjetivo, kColor)

        const activo = m.hover || m.resaltada
        let respiro = 0.5
        if (m.estado === 'disponible') respiro = 0.45 + 0.2 * Math.sin(t * 2 + m.fase)
        else if (m.estado === 'reservada') respiro = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3.5 + m.fase))
        else if (m.estado === 'ocupada') respiro = 0.6 + 0.08 * Math.sin(t * 5 + m.fase)

        neonIM.setColorAt(m.idx, tmp.copy(m.color).multiplyScalar(1.3 + respiro * 1.4 + (activo ? 1.4 : 0)))
        cristalIM.setColorAt(m.idx, tmp.copy(m.color).multiplyScalar(0.25 + respiro * 0.35))
        haloIM.setColorAt(m.idx, tmp.copy(m.color).multiplyScalar(respiro * 0.6 + (activo ? 0.35 : 0)))
        if (m.bancosOcupados > 0) {
          tmp.copy(m.color).multiplyScalar(1.25)
          for (let i = 0; i < m.bancosOcupados && i < MAX_BANCOS; i++) cojinOnIM.setColorAt(m.idx * MAX_BANCOS + i, tmp)
        }

        // Columna de luz sobre mesas ocupadas
        const colObjetivo = m.estado === 'ocupada' ? 0.16 + 0.04 * Math.sin(t * 2 + m.fase) : 0
        const colAntes = m.columna > 0.005
        m.columna += (colObjetivo - m.columna) * kColor
        if ((m.columna > 0.005) !== colAntes) m.sucia = true
        columnaIM.setColorAt(m.idx, tmp.copy(m.color).multiplyScalar(m.columna))

        // Anillo punteado giratorio en reservadas
        const anilloObjetivo = m.estado === 'reservada' ? 0.85 : 0
        const anilloAntes = m.anillo > 0.01
        m.anillo += (anilloObjetivo - m.anillo) * kColor
        if (m.anillo > 0.01) {
          fijar(anilloIM, m.idx, m.x, 0.035, m.z, t * 0.6)
          anilloIM.setColorAt(m.idx, tmp.set(COLORES_ESTADO.reservada).multiplyScalar(2 * m.anillo))
          anillosSucios = true
        } else if (anilloAntes) {
          fijar(anilloIM, m.idx, m.x, 0.035, m.z, 0, 0, 0, 0)
          anillosSucios = true
        }

        // Elevación al pasar el cursor / resaltar desde el panel
        const yObjetivo = activo ? 0.25 : 0
        if (Math.abs(yObjetivo - m.elevacion) > 0.001) {
          m.elevacion += (yObjetivo - m.elevacion) * kElev
          m.sucia = true
        } else if (m.elevacion !== yObjetivo) {
          m.elevacion = yObjetivo
          m.sucia = true
        }

        // Onda + rebote al cambiar de estado
        if (m.pulso > 0) {
          m.pulso = Math.max(0, m.pulso - dt * 0.65)
          const k = 1 - m.pulso
          m.onda.visible = true
          m.onda.scale.setScalar(1 + k * 3)
          m.ondaMat.color.copy(m.colorObjetivo).multiplyScalar(2.5)
          m.ondaMat.opacity = m.pulso
          m.escalaY = 1 + Math.sin(k * Math.PI) * 0.3 * m.pulso
          m.sucia = true
        } else if (m.onda.visible) {
          m.onda.visible = false
          m.escalaY = 1
          m.sucia = true
        }

        if (m.sucia) {
          actualizarMatrices(m)
          m.sucia = false
          matricesSucias = true
        }
      }

      neonIM.instanceColor!.needsUpdate = true
      cristalIM.instanceColor!.needsUpdate = true
      haloIM.instanceColor!.needsUpdate = true
      columnaIM.instanceColor!.needsUpdate = true
      cojinOnIM.instanceColor!.needsUpdate = true
      if (anillosSucios) {
        anilloIM.instanceMatrix.needsUpdate = true
        anilloIM.instanceColor!.needsUpdate = true
      }
      if (matricesSucias) {
        for (const im of [cuerpoIM, neonIM, cristalIM, columnaIM, cojinOnIM, cojinOffIM, cromoIM]) im.instanceMatrix.needsUpdate = true
        renderer.shadowMap.needsUpdate = true
        etiquetasSucias = true
      }

      composer.render()
      // Las etiquetas HTML solo se reposicionan cuando la cámara o una mesa se mueven
      if (etiquetasSucias) {
        etiquetas.render(escena, camara)
        etiquetasSucias = false
      }
    }

    // Precompilar shaders antes del primer cuadro para evitar tirones al arrancar
    tablasPorIndice.forEach((m) => { m.onda.visible = true })
    renderer.compile(escena, camara)
    tablasPorIndice.forEach((m) => { m.onda.visible = false })
    const arranque = requestAnimationFrame(() => {
      if (!vivo) return
      reloj.start()
      renderer.setAnimationLoop(cuadro)
      setListo(true)
    })

    return () => {
      vivo = false
      cancelAnimationFrame(arranque)
      renderer.setAnimationLoop(null)
      ro.disconnect()
      controles.dispose()
      renderer.domElement.removeEventListener('pointerdown', alBajar)
      renderer.domElement.removeEventListener('pointerup', alSubir)
      renderer.domElement.removeEventListener('pointermove', alMover)
      escena.traverse((obj) => {
        const malla = obj as THREE.Mesh
        malla.geometry?.dispose()
        const mats = Array.isArray(malla.material) ? malla.material : malla.material ? [malla.material] : []
        mats.forEach((mat) => {
          const conMapa = mat as THREE.MeshStandardMaterial
          conMapa.map?.dispose()
          conMapa.emissiveMap?.dispose()
          mat.dispose()
        })
        if ((obj as THREE.InstancedMesh).isInstancedMesh) (obj as THREE.InstancedMesh).dispose()
      })
      ;[haloTex, hazTex, columnaTex, punteadoTex, pisoTex, entorno].forEach((tx) => tx.dispose())
      pmrem.dispose()
      composer.dispose()
      objetivo.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      etiquetas.domElement.remove()
      tablasRef.current.clear()
      apiRef.current = null
      estadosPreviosRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Sincronizar estados de la operación con la escena ----------
  // Solo toca lo que cambió: sin cambios en los datos no hay trabajo en el DOM ni en la escena
  useEffect(() => {
    const tablas = tablasRef.current
    if (tablas.size === 0) return
    const previos = estadosPreviosRef.current
    const nuevos = new Map<string, string>()
    const cambios: Actividad[] = []

    mesas.forEach((mesa) => {
      const t = tablas.get(mesa.numero)
      if (!t || t.inactiva) return
      nuevos.set(mesa.numero, mesa.estado)

      const firma = `${mesa.estado}|${mesa.cliente_nombre ?? ''}|${mesa.numero_personas ?? ''}|${mesa.capacidad}`
      if (firma === t.firma) return
      t.firma = firma

      t.colorObjetivo.set(COLORES_ESTADO[mesa.estado] ?? COLOR_INACTIVA)
      if (t.estado && t.estado !== mesa.estado) t.pulso = 1
      t.estado = mesa.estado

      const ocupadas = mesa.estado === 'ocupada' ? (mesa.numero_personas ?? mesa.capacidad) : 0
      t.bancosTotal = Math.max(mesa.capacidad || 4, ocupadas)
      t.bancosOcupados = ocupadas
      t.sucia = true
      pintarEtiqueta(t.etiqueta, mesa, mesa.numero, resaltadaRef.current === mesa.numero)

      if (previos && previos.has(mesa.numero) && previos.get(mesa.numero) !== mesa.estado) {
        cambios.push({
          id: Date.now() + Math.random(),
          numero: mesa.numero,
          estado: mesa.estado,
          hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        })
      }
    })

    if (nuevos.size > 0) estadosPreviosRef.current = nuevos
    if (cambios.length > 0) setActividad((a) => [...cambios, ...a].slice(0, 4))
  }, [mesas])

  // Resaltado desde el panel
  useEffect(() => {
    tablasRef.current.forEach((t, n) => {
      t.resaltada = n === mesaResaltada
      const num = t.etiqueta.querySelector<HTMLElement>('[data-rol="numero"]')
      if (num) num.style.transform = t.resaltada ? 'scale(1.25)' : ''
    })
  }, [mesaResaltada])

  // Vuelo de cámara hacia una mesa
  useEffect(() => {
    if (enfoque) apiRef.current?.enfocar(enfoque.numero)
  }, [enfoque])

  // Al reanudar tras un diálogo, reposicionar etiquetas
  useEffect(() => {
    if (!pausado) apiRef.current?.marcarEtiquetas()
  }, [pausado])

  // Reencuadrar cuando se abren/cierran paneles
  const firmaMargenes = `${margenes?.arriba}-${margenes?.abajo}-${margenes?.izquierda}-${margenes?.derecha}`
  useEffect(() => {
    apiRef.current?.reencuadrar()
  }, [firmaMargenes])

  const cambiarVista = (v: '3d' | 'aerea') => {
    setVista(v)
    apiRef.current?.vista(v)
  }

  if (sinWebGL) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#070503] p-6 text-center text-sm text-slate-400">
        Este dispositivo no soporta la vista 3D. Usa el plano 2D.
      </div>
    )
  }

  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-[#070503]">
      <div ref={contenedorRef} className={`absolute inset-0 transition-opacity duration-700 ${listo ? 'opacity-100' : 'opacity-0'}`} />

      {/* Viñeta para integrar los paneles */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />

      {/* Barra de vista + actividad en vivo (sin backdrop-blur: es muy caro sobre un canvas animado) */}
      <div
        className="pointer-events-none absolute flex flex-col items-start gap-2 transition-transform duration-300"
        style={{ left: (margenes?.izquierda ?? 0) + 12, bottom: 12, transform: `translateY(${-(margenes?.abajo ?? 0)}px)` }}
      >
        {actividad.length > 0 && (
          <div className="hidden flex-col gap-1 sm:flex">
            {actividad.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d0a07]/90 px-3 py-1.5 text-[11px] text-slate-200 animate-in fade-in slide-in-from-left-2"
                style={{ opacity: 1 - i * 0.2 }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: COLORES_ESTADO[a.estado] ?? COLOR_INACTIVA, boxShadow: `0 0 8px ${COLORES_ESTADO[a.estado] ?? COLOR_INACTIVA}` }} />
                <span className="font-bold">Mesa {a.numero}</span>
                <span className="text-slate-400">→ {a.estado}</span>
                <span className="text-slate-500">{a.hora}</span>
              </div>
            ))}
          </div>
        )}
        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-amber-500/20 bg-[#0d0a07]/92 p-1 shadow-2xl shadow-black/60">
          {([['3d', '3D', Box], ['aerea', 'Aérea', Eye]] as const).map(([v, texto, Icono]) => (
            <button
              key={v}
              onClick={() => cambiarVista(v)}
              className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-colors ${vista === v ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30' : 'text-slate-300 active:bg-white/10 hover:bg-white/5 hover:text-amber-300'}`}
            >
              <Icono className="h-3.5 w-3.5" /> {texto}
            </button>
          ))}
          <button
            onClick={() => cambiarVista(vista)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors active:bg-white/10 hover:bg-white/5 hover:text-amber-300"
            aria-label="Centrar vista"
            title="Centrar vista"
          >
            <Crosshair className="h-4 w-4" />
          </button>
          {accesorios}
        </div>
      </div>
    </div>
  )
}
