import "./custom-loader.css"

type LoaderType = "circle" | "triangle" | "rectangle"

interface CustomLoaderProps {
  type?: LoaderType
  className?: string
}

export function CustomLoader({ type = "circle", className = "" }: CustomLoaderProps) {
  return (
    <div className={`loader ${type === "triangle" ? "triangle" : ""} ${className}`}>
      {type === "circle" && (
        <svg viewBox="0 0 80 80">
          <circle r="32" cy="40" cx="40" id="loader-circle"></circle>
        </svg>
      )}

      {type === "triangle" && (
        <svg viewBox="0 0 86 80">
          <polygon points="43 8 79 72 7 72"></polygon>
        </svg>
      )}

      {type === "rectangle" && (
        <svg viewBox="0 0 80 80">
          <rect height="64" width="64" y="8" x="8"></rect>
        </svg>
      )}
    </div>
  )
}

export function LoaderGroup() {
  return (
    <div className="flex items-center justify-center">
      <CustomLoader type="circle" />
      <CustomLoader type="triangle" />
      <CustomLoader type="rectangle" />
    </div>
  )
}
