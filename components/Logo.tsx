import Image from 'next/image'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export default function Logo({ width = 180, height = 43, className = '' }: LogoProps) {
  return (
    <Image
      src="/planilha.svg"
      alt="planILHA"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
