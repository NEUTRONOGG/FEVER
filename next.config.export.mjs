/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out-menus',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    // Ignorar errores de TypeScript en el build (solo para exportar menús)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignorar errores de ESLint en el build
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
