import Image from 'next/image'

interface FeverLogoProps {
  width?: number
  height?: number
  className?: string
}

export default function FeverLogo({ width = 200, height = 80, className = '' }: FeverLogoProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Image
        src="/fever-logo.png"
        alt="FEVER Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  )
}
