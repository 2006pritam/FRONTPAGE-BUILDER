import Image from "next/image"

export function CollegeLogo({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <Image
        src="https://i.ibb.co/SwHN4Zx6/skfgi-logo.png"
        alt="College Logo"
        width={128}
        height={128}
        className="object-contain"
        priority
        crossOrigin="anonymous"
      />
    </div>
  )
}
