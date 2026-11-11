"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js"
import { Box, Eye, RotateCcw, Radio } from "lucide-react"

export interface MesaMapa3D {
  id: number
  numero: string
  capacidad: number
  estado: string
  cliente_nombre?: string
  numero_personas?: number
  rp_asignado?: string
}

interface MapaMesas3DProps {
  mesas: MesaMapa3D[]
  onSelectMesa?: (mesa: MesaMapa3D) => void
  enVivo?: boolean
  onSinWebGL?: () => void
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

const COLORES_ESTADO: Record<string, string> = {
  disponible: '#10b981',
  ocupada: '#ef4444',
  reservada: '#f59e0b',
  cuenta: '#a855f7',
}
const COLOR_INACTIVA = '#475569'
const ORO = '#fbbf24'
const FONDO = '#0c0a06'

const ESCALA = 20
const aMundo = (x: number, y: number) => ({ x: (x - 320) / ESCALA, z: (y - 500) / ESCALA })

const MESA_ANCHO = 1.9
const MESA_FONDO = 2.4
const MESA_ALTO = 0.6

interface Actividad {
  id: number
  numero: string
  estado: string
  hora: string
}

interface MesaEscena {
  grupo: THREE.Group
  cuerpo: THREE.Mesh
  cubierta: THREE.Mesh
  cubiertaMat: THREE.MeshStandardMaterial
  halo: THREE.Mesh
  haloMat: THREE.MeshBasicMaterial
  onda: THREE.Mesh
  ondaMat: THREE.MeshBasicMaterial
  sillas: THREE.Group
  sillaOnMat: THREE.MeshStandardMaterial
  etiqueta: HTMLDivElement
  colorObjetivo: THREE.Color
  estado: string
  fase: number
  pulso: number
  hover: boolean
  firmaSillas: string
}

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

function texturaHalo() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function texturaLetrero(texto: string, ancho: number, fondo: number) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = Math.round(1024 * (fondo / ancho))
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, c.height)
  g.addColorStop(0, '#fcd34d')
  g.addColorStop(1, '#d4a00a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#0c0a06'
  ctx.font = `900 ${Math.round(c.height * 0.55)}px "Arial Black", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(texto, c.width / 2, c.height / 2 + c.height * 0.03)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function claseEtiqueta(estado: string) {
  const base = 'pointer-events-auto select-none cursor-pointer flex flex-col items-center leading-none transition-transform duration-200'
  return estado === 'inactiva' ? `${base} opacity-40 cursor-default` : base
}

function pintarEtiqueta(el: HTMLDivElement, mesa: MesaMapa3D | null, numero: string) {
  const estado = mesa?.estado ?? 'inactiva'
  const color = COLORES_ESTADO[estado] ?? COLOR_INACTIVA
  el.className = claseEtiqueta(estado)
  el.replaceChildren()

  const num = document.createElement('span')
  num.textContent = numero
  num.className = 'min-w-[30px] px-1.5 py-1 rounded-lg text-[13px] font-extrabold text-center text-white'
  num.style.background = `${color}e6`
  num.style.boxShadow = `0 0 14px ${color}aa, inset 0 1px 0 rgba(255,255,255,.25)`
  el.appendChild(num)

  if (mesa && estado === 'ocupada' && mesa.cliente_nombre) {
    const sub = document.createElement('span')
    const nombre = mesa.cliente_nombre.split(' ')[0]
    sub.textContent = `${nombre}${mesa.numero_personas ? ` · ${mesa.numero_personas}p` : ''}`
    sub.className = 'hidden sm:block mt-1 max-w-[92px] truncate px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-100 bg-black/70 border border-white/10'
    el.appendChild(sub)
  } else if (estado === 'reservada') {
    const sub = document.createElement('span')
    sub.textContent = 'RES'
    sub.className = 'hidden sm:block mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider text-amber-300 bg-black/70 border border-amber-500/30'
    el.appendChild(sub)
  }
}

export default function MapaMesas3D({ mesas, onSelectMesa, enVivo, onSinWebGL }: MapaMesas3DProps) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const mesasEscenaRef = useRef<Map<string, MesaEscena>>(new Map())
  const mesasRef = useRef<MesaMapa3D[]>(mesas)
  const onSelectRef = useRef(onSelectMesa)
  const vistaRef = useRef<((v: '3d' | 'aerea') => void) | null>(null)
  const construirSillasRef = useRef<((m: MesaEscena, total: number, ocupadas: number) => void) | null>(null)
  const estadosPreviosRef = useRef<Map<string, string> | null>(null)
  const [sinWebGL, setSinWebGL] = useState(false)
  const [actividad, setActividad] = useState<Actividad[]>([])
  const [vista, setVista] = useState<'3d' | 'aerea'>('3d')

  onSelectRef.current = onSelectMesa
  mesasRef.current = mesas

  // Construcción de la escena (una sola vez)
  useEffect(() => {
    const contenedor = contenedorRef.current
    if (!contenedor) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    } catch {
      setSinWebGL(true)
      onSinWebGL?.()
      return
    }

    const ancho = () => contenedor.clientWidth
    const alto = () => contenedor.clientHeight

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(ancho(), alto())
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.touchAction = 'none'
    contenedor.appendChild(renderer.domElement)

    const etiquetas = new CSS2DRenderer()
    etiquetas.setSize(ancho(), alto())
    etiquetas.domElement.style.position = 'absolute'
    etiquetas.domElement.style.inset = '0'
    etiquetas.domElement.style.pointerEvents = 'none'
    contenedor.appendChild(etiquetas.domElement)

    const escena = new THREE.Scene()
    escena.background = new THREE.Color(FONDO)
    escena.fog = new THREE.Fog(FONDO, 70, 140)

    const camara = new THREE.PerspectiveCamera(40, ancho() / alto(), 0.5, 300)

    const controles = new OrbitControls(camara, renderer.domElement)
    controles.enableDamping = true
    controles.dampingFactor = 0.08
    controles.maxPolarAngle = Math.PI / 2.25
    controles.minDistance = 12
    controles.maxDistance = 120
    controles.target.set(0, 0, 1)

    // ---------- Luces ----------
    escena.add(new THREE.HemisphereLight('#fff1d0', '#0b0905', 0.55))
    const sol = new THREE.DirectionalLight('#ffe6b0', 1.6)
    sol.position.set(14, 32, 20)
    sol.castShadow = true
    sol.shadow.mapSize.set(2048, 2048)
    sol.shadow.camera.left = -22
    sol.shadow.camera.right = 22
    sol.shadow.camera.top = 30
    sol.shadow.camera.bottom = -30
    sol.shadow.camera.far = 90
    sol.shadow.bias = -0.0005
    escena.add(sol)
    const luzCabina = new THREE.PointLight(ORO, 60, 32, 1.6)
    luzCabina.position.set(0, 5, -18)
    escena.add(luzCabina)
    const luzBarra = new THREE.PointLight(ORO, 50, 30, 1.6)
    luzBarra.position.set(2.5, 5, 20)
    escena.add(luzBarra)

    // ---------- Piso ----------
    const piso = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 52),
      new THREE.MeshStandardMaterial({ color: '#16110a', roughness: 0.85, metalness: 0.15 })
    )
    piso.rotation.x = -Math.PI / 2
    piso.receiveShadow = true
    escena.add(piso)

    const rejilla = new THREE.GridHelper(52, 52, ORO, ORO)
    const rejillaMat = rejilla.material as THREE.LineBasicMaterial
    rejillaMat.transparent = true
    rejillaMat.opacity = 0.06
    rejilla.position.y = 0.005
    rejilla.scale.set(34 / 52, 1, 1)
    escena.add(rejilla)

    const borde = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(34, 0.01, 52)),
      new THREE.LineBasicMaterial({ color: ORO, transparent: true, opacity: 0.45 })
    )
    borde.position.y = 0.01
    escena.add(borde)

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
      new THREE.MeshBasicMaterial({ color: '#fef3c7', transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })
    )
    pasilloMesh.position.y = 0.012
    escena.add(pasilloMesh)

    const contornoPuntos = pasillo.getPoints(12).map((v) => new THREE.Vector3(v.x, 0.02, v.y))
    const contorno = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(contornoPuntos),
      new THREE.LineDashedMaterial({ color: ORO, dashSize: 0.4, gapSize: 0.2, transparent: true, opacity: 0.7 })
    )
    contorno.computeLineDistances()
    escena.add(contorno)

    // ---------- CABINA y BARRA ----------
    const crearBloque = (texto: string, x: number, y: number, w: number, h: number, altura: number) => {
      const centro = aMundo(x + w / 2, y + h / 2)
      const anchoM = w / ESCALA
      const fondoM = h / ESCALA
      const tex = texturaLetrero(texto, anchoM, fondoM)
      const lado = new THREE.MeshStandardMaterial({ color: '#d4a00a', metalness: 0.65, roughness: 0.3, emissive: '#3d2a00', emissiveIntensity: 0.6 })
      const tapa = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.4 })
      const bloque = new THREE.Mesh(new THREE.BoxGeometry(anchoM, altura, fondoM), [lado, lado, tapa, lado, lado, lado])
      bloque.position.set(centro.x, altura / 2, centro.z)
      bloque.castShadow = true
      bloque.receiveShadow = true
      escena.add(bloque)

      const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(anchoM + 4, fondoM + 4),
        new THREE.MeshBasicMaterial({ map: haloTex, color: ORO, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })
      )
      halo.rotation.x = -Math.PI / 2
      halo.position.set(centro.x, 0.015, centro.z)
      escena.add(halo)
    }

    const haloTex = texturaHalo()
    crearBloque('CABINA', 105, 30, 420, 110, 1.6)
    crearBloque('BARRA', 105, 920, 530, 70, 1.3)

    // ---------- Periqueras decorativas laterales ----------
    const periqueraGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.5, 32)
    const periqueraMat = new THREE.MeshStandardMaterial({ color: '#1e1a14', metalness: 0.4, roughness: 0.5 })
    const aroMat = new THREE.MeshBasicMaterial({ color: '#64748b', transparent: true, opacity: 0.6 })
    const aroGeo = new THREE.TorusGeometry(1.1, 0.04, 8, 48)
    const periqueras: [number, number][] = [
      [30, 90], [30, 200], [30, 310], [30, 420], [30, 530],
      [610, 90], [610, 200], [610, 310], [610, 420], [610, 600], [610, 710], [610, 820],
    ]
    periqueras.forEach(([x, y]) => {
      const pos = aMundo(x, y)
      const g = new THREE.Mesh(periqueraGeo, periqueraMat)
      g.scale.z = 1.4
      g.position.set(pos.x, 0.25, pos.z)
      g.castShadow = true
      g.receiveShadow = true
      escena.add(g)
      const aro = new THREE.Mesh(aroGeo, aroMat)
      aro.rotation.x = Math.PI / 2
      aro.scale.y = 1.4
      aro.position.set(pos.x, 0.51, pos.z)
      escena.add(aro)
    })

    // Marco vacío (zona junto a mesa 26)
    const marcoPos = aMundo(175, 190)
    const marco = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.5, 0.3, 3)),
      new THREE.LineBasicMaterial({ color: '#64748b', transparent: true, opacity: 0.6 })
    )
    marco.position.set(marcoPos.x, 0.15, marcoPos.z)
    escena.add(marco)

    // ---------- Mesas ----------
    const cuerpoGeo = new THREE.ExtrudeGeometry(rectRedondeado(MESA_ANCHO, MESA_FONDO, 0.28), {
      depth: MESA_ALTO, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3, curveSegments: 8,
    })
    cuerpoGeo.rotateX(-Math.PI / 2)
    const cubiertaGeo = new THREE.ShapeGeometry(rectRedondeado(MESA_ANCHO - 0.35, MESA_FONDO - 0.35, 0.2), 8)
    cubiertaGeo.rotateX(-Math.PI / 2)
    const cuerpoMat = new THREE.MeshStandardMaterial({ color: '#1f1b15', metalness: 0.55, roughness: 0.35 })
    const sillaGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.42, 18)
    const sillaOffMat = new THREE.MeshStandardMaterial({ color: '#2a2620', metalness: 0.3, roughness: 0.6 })
    const ondaGeo = new THREE.RingGeometry(1.3, 1.5, 48)
    ondaGeo.rotateX(-Math.PI / 2)

    const interactivos: THREE.Object3D[] = []

    const construirSillas = (m: MesaEscena, total: number, ocupadas: number) => {
      const firma = `${total}-${ocupadas}`
      if (m.firmaSillas === firma) return
      m.firmaSillas = firma
      m.sillas.clear()
      const n = Math.max(2, Math.min(total, 10))
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + Math.PI / n
        const silla = new THREE.Mesh(sillaGeo, i < ocupadas ? m.sillaOnMat : sillaOffMat)
        silla.position.set(Math.cos(ang) * 1.4, 0.21, Math.sin(ang) * 1.72)
        silla.castShadow = true
        m.sillas.add(silla)
      }
    }
    construirSillasRef.current = construirSillas

    const crearMesa = (numero: string, x: number, y: number, inactiva: boolean) => {
      const pos = aMundo(x, y)
      const grupo = new THREE.Group()
      grupo.position.set(pos.x, 0, pos.z)

      const cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat)
      cuerpo.castShadow = true
      cuerpo.receiveShadow = true
      cuerpo.userData.numero = numero
      grupo.add(cuerpo)

      const colorInicial = new THREE.Color(inactiva ? COLOR_INACTIVA : COLORES_ESTADO.disponible)
      const cubiertaMat = new THREE.MeshStandardMaterial({
        color: colorInicial.clone(), emissive: colorInicial.clone(), emissiveIntensity: inactiva ? 0.1 : 1.1, metalness: 0.2, roughness: 0.25,
      })
      const cubierta = new THREE.Mesh(cubiertaGeo, cubiertaMat)
      cubierta.position.y = MESA_ALTO + 0.07
      cubierta.userData.numero = numero
      grupo.add(cubierta)

      const haloMat = new THREE.MeshBasicMaterial({
        map: haloTex, color: colorInicial.clone(), transparent: true, opacity: inactiva ? 0 : 0.6, blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.8), haloMat)
      halo.rotation.x = -Math.PI / 2
      halo.position.y = 0.02
      grupo.add(halo)

      const ondaMat = new THREE.MeshBasicMaterial({ color: colorInicial.clone(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
      const onda = new THREE.Mesh(ondaGeo, ondaMat)
      onda.position.y = 0.04
      grupo.add(onda)

      const sillaOnMat = new THREE.MeshStandardMaterial({ color: colorInicial.clone(), emissive: colorInicial.clone(), emissiveIntensity: 0.9, roughness: 0.4 })
      const sillas = new THREE.Group()
      grupo.add(sillas)

      const etiqueta = document.createElement('div')
      etiqueta.addEventListener('click', (e) => {
        e.stopPropagation()
        seleccionar(numero)
      })
      etiqueta.addEventListener('pointerenter', () => marcarHover(numero))
      etiqueta.addEventListener('pointerleave', () => marcarHover(null))
      const etiquetaObj = new CSS2DObject(etiqueta)
      etiquetaObj.position.set(0, 1.55, 0)
      grupo.add(etiquetaObj)

      escena.add(grupo)
      if (!inactiva) interactivos.push(cuerpo, cubierta)

      const entrada: MesaEscena = {
        grupo, cuerpo, cubierta, cubiertaMat, halo, haloMat, onda, ondaMat, sillas, sillaOnMat, etiqueta,
        colorObjetivo: colorInicial.clone(),
        estado: inactiva ? 'inactiva' : '',
        fase: Math.random() * Math.PI * 2,
        pulso: 0,
        hover: false,
        firmaSillas: '',
      }
      construirSillas(entrada, 4, 0)
      pintarEtiqueta(etiqueta, null, numero)
      if (!inactiva) etiqueta.className = claseEtiqueta('disponible')
      mesasEscenaRef.current.set(numero, entrada)
    }

    Object.entries(POSICIONES_MESAS).forEach(([n, v]) => crearMesa(n, v.x, v.y, false))
    Object.entries(MESAS_INACTIVAS).forEach(([n, v]) => crearMesa(n, v.x, v.y, true))

    // ---------- Interacción ----------
    const raycaster = new THREE.Raycaster()
    const puntero = new THREE.Vector2()
    let inicioToque: { x: number; y: number } | null = null

    const seleccionar = (numero: string) => {
      const mesa = mesasRef.current.find((m) => m.numero === numero)
      if (mesa && POSICIONES_MESAS[numero]) onSelectRef.current?.(mesa)
    }

    const marcarHover = (numero: string | null) => {
      mesasEscenaRef.current.forEach((m, n) => {
        m.hover = n === numero && m.estado !== 'inactiva'
      })
      renderer.domElement.style.cursor = numero && POSICIONES_MESAS[numero] ? 'pointer' : 'grab'
    }

    const mesaBajoPuntero = (ev: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect()
      puntero.x = ((ev.clientX - r.left) / r.width) * 2 - 1
      puntero.y = -((ev.clientY - r.top) / r.height) * 2 + 1
      raycaster.setFromCamera(puntero, camara)
      const hit = raycaster.intersectObjects(interactivos, false)[0]
      return (hit?.object.userData.numero as string | undefined) ?? null
    }

    const alBajar = (ev: PointerEvent) => { inicioToque = { x: ev.clientX, y: ev.clientY } }
    const alSubir = (ev: PointerEvent) => {
      if (!inicioToque) return
      const movido = Math.hypot(ev.clientX - inicioToque.x, ev.clientY - inicioToque.y)
      inicioToque = null
      if (movido > 6) return
      const numero = mesaBajoPuntero(ev)
      if (numero) seleccionar(numero)
    }
    const alMover = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse' || inicioToque) return
      marcarHover(mesaBajoPuntero(ev))
    }
    renderer.domElement.addEventListener('pointerdown', alBajar)
    renderer.domElement.addEventListener('pointerup', alSubir)
    renderer.domElement.addEventListener('pointermove', alMover)

    // ---------- Cámara ----------
    let transicion: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null
    const calcularVista = (tipo: '3d' | 'aerea') => {
      const aspecto = ancho() / Math.max(alto(), 1)
      const vfov = THREE.MathUtils.degToRad(camara.fov)
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspecto)
      const vertical = aspecto < 0.8
      const dist = Math.max(17.5 / Math.tan(hfov / 2), 27 / Math.tan(vfov / 2)) * (tipo === '3d' ? (vertical ? 0.98 : 0.82) : 1.02)
      const dir = tipo === '3d'
        ? new THREE.Vector3(0, vertical ? 0.9 : 0.78, vertical ? 0.42 : 0.62).normalize()
        : new THREE.Vector3(0, 1, 0.001)
      return { pos: dir.multiplyScalar(dist).add(new THREE.Vector3(0, 0, 1)), target: new THREE.Vector3(0, 0, tipo === '3d' ? 2 : 1) }
    }
    const inicial = calcularVista('3d')
    camara.position.copy(inicial.pos).add(new THREE.Vector3(14, 10, 18))
    transicion = inicial
    vistaRef.current = (tipo) => { transicion = calcularVista(tipo) }
    controles.addEventListener('start', () => { transicion = null })

    // ---------- Redimensionado ----------
    const ro = new ResizeObserver(() => {
      const w = ancho()
      const h = alto()
      if (!w || !h) return
      camara.aspect = w / h
      camara.updateProjectionMatrix()
      renderer.setSize(w, h)
      etiquetas.setSize(w, h)
    })
    ro.observe(contenedor)

    // ---------- Animación ----------
    const reloj = new THREE.Clock()
    renderer.setAnimationLoop(() => {
      const dt = Math.min(reloj.getDelta(), 0.05)
      const t = reloj.elapsedTime

      if (transicion) {
        camara.position.lerp(transicion.pos, 0.06)
        controles.target.lerp(transicion.target, 0.06)
        if (camara.position.distanceTo(transicion.pos) < 0.05) transicion = null
      }
      controles.update()

      mesasEscenaRef.current.forEach((m) => {
        if (m.estado === 'inactiva') return
        m.cubiertaMat.color.lerp(m.colorObjetivo, 0.08)
        m.cubiertaMat.emissive.lerp(m.colorObjetivo, 0.08)
        m.haloMat.color.lerp(m.colorObjetivo, 0.08)
        m.sillaOnMat.color.lerp(m.colorObjetivo, 0.08)
        m.sillaOnMat.emissive.lerp(m.colorObjetivo, 0.08)

        let intensidad = 0.6
        if (m.estado === 'disponible') intensidad = 0.5 + 0.18 * Math.sin(t * 2 + m.fase)
        else if (m.estado === 'reservada') intensidad = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * 4 + m.fase))
        else if (m.estado === 'ocupada') intensidad = 0.72
        m.haloMat.opacity = intensidad + (m.hover ? 0.3 : 0)
        m.cubiertaMat.emissiveIntensity = 0.8 + intensidad * 0.8

        const yObjetivo = m.hover ? 0.22 : 0
        m.grupo.position.y += (yObjetivo - m.grupo.position.y) * 0.18

        if (m.pulso > 0) {
          m.pulso = Math.max(0, m.pulso - dt * 0.7)
          const k = 1 - m.pulso
          m.onda.scale.setScalar(1 + k * 2.8)
          m.ondaMat.color.copy(m.colorObjetivo)
          m.ondaMat.opacity = m.pulso * 0.9
          m.cuerpo.scale.y = 1 + Math.sin(k * Math.PI) * 0.35 * m.pulso
        } else if (m.ondaMat.opacity !== 0) {
          m.ondaMat.opacity = 0
          m.cuerpo.scale.y = 1
        }
      })

      renderer.render(escena, camara)
      etiquetas.render(escena, camara)
    })

    return () => {
      renderer.setAnimationLoop(null)
      ro.disconnect()
      controles.dispose()
      renderer.domElement.removeEventListener('pointerdown', alBajar)
      renderer.domElement.removeEventListener('pointerup', alSubir)
      renderer.domElement.removeEventListener('pointermove', alMover)
      escena.traverse((obj) => {
        const malla = obj as THREE.Mesh
        if (malla.geometry) malla.geometry.dispose()
        const mats = Array.isArray(malla.material) ? malla.material : malla.material ? [malla.material] : []
        mats.forEach((mat) => {
          const conMapa = mat as THREE.MeshStandardMaterial
          conMapa.map?.dispose()
          conMapa.emissiveMap?.dispose()
          mat.dispose()
        })
      })
      haloTex.dispose()
      sillaOffMat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      etiquetas.domElement.remove()
      mesasEscenaRef.current.clear()
      vistaRef.current = null
      construirSillasRef.current = null
      estadosPreviosRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sincronizar estados de la operación con la escena
  useEffect(() => {
    const escena = mesasEscenaRef.current
    if (escena.size === 0) return
    const previos = estadosPreviosRef.current
    const nuevos = new Map<string, string>()
    const cambios: Actividad[] = []

    mesas.forEach((mesa) => {
      const m = escena.get(mesa.numero)
      if (!m || m.estado === 'inactiva') return
      nuevos.set(mesa.numero, mesa.estado)

      const color = COLORES_ESTADO[mesa.estado] ?? COLOR_INACTIVA
      m.colorObjetivo.set(color)
      if (m.estado && m.estado !== mesa.estado) m.pulso = 1
      m.estado = mesa.estado

      const ocupadas = mesa.estado === 'ocupada' ? (mesa.numero_personas ?? mesa.capacidad) : 0
      construirSillasRef.current?.(m, Math.max(mesa.capacidad || 4, ocupadas), ocupadas)
      pintarEtiqueta(m.etiqueta, mesa, mesa.numero)

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

  const cambiarVista = (v: '3d' | 'aerea') => {
    setVista(v)
    vistaRef.current?.(v)
  }

  const enPlano = mesas.filter((m) => POSICIONES_MESAS[m.numero])
  const conteo = (estado: string) => enPlano.filter((m) => m.estado === estado).length

  if (sinWebGL) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-400">
        Este dispositivo no soporta la vista 3D. Usa el plano 2D.
      </div>
    )
  }

  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-xl border border-amber-500/20 shadow-2xl shadow-black/60" style={{ maxWidth: 1100 }}>
      <div ref={contenedorRef} className="relative h-[68vh] min-h-[440px] max-h-[820px] w-full" />

      {/* Leyenda */}
      <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5 md:left-3 md:top-3">
        {[
          { estado: 'disponible', texto: 'Disponibles' },
          { estado: 'ocupada', texto: 'Ocupadas' },
          { estado: 'reservada', texto: 'Reservadas' },
        ].map(({ estado, texto }) => (
          <div key={estado} className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-200 md:text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: COLORES_ESTADO[estado], boxShadow: `0 0 8px ${COLORES_ESTADO[estado]}` }} />
            {conteo(estado)}<span className="hidden sm:inline">{texto}</span>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5 md:right-3 md:top-3">
        {enVivo && (
          <div className="glass flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider text-red-400">
            <Radio className="h-3 w-3 animate-pulse" />
            EN VIVO
          </div>
        )}
        <div className="glass flex overflow-hidden rounded-full p-0.5">
          <button
            onClick={() => cambiarVista('3d')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${vista === '3d' ? 'bg-amber-500 text-black' : 'text-slate-300 hover:text-amber-400'}`}
          >
            <Box className="h-3 w-3" /> 3D
          </button>
          <button
            onClick={() => cambiarVista('aerea')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${vista === 'aerea' ? 'bg-amber-500 text-black' : 'text-slate-300 hover:text-amber-400'}`}
          >
            <Eye className="h-3 w-3" /> Aérea
          </button>
          <button
            onClick={() => cambiarVista(vista)}
            className="flex items-center rounded-full px-2 py-1 text-slate-300 hover:text-amber-400"
            aria-label="Centrar vista"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Actividad en tiempo real */}
      {actividad.length > 0 && (
        <div className="pointer-events-none absolute bottom-2 left-2 flex flex-col gap-1 md:bottom-3 md:left-3">
          {actividad.map((a, i) => (
            <div
              key={a.id}
              className="glass flex items-center gap-2 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 animate-in fade-in slide-in-from-left-2"
              style={{ opacity: 1 - i * 0.2 }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: COLORES_ESTADO[a.estado] ?? COLOR_INACTIVA }} />
              <span className="font-bold">Mesa {a.numero}</span>
              <span className="text-slate-400">→ {a.estado}</span>
              <span className="text-slate-500">{a.hora}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-2 right-2 hidden text-[10px] text-slate-500 md:block md:bottom-3 md:right-3">
        Arrastra para girar · Rueda/pellizco para zoom · Toca una mesa
      </div>
    </div>
  )
}
