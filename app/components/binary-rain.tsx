import type { CSSProperties } from "react"

const RAIN_COLUMN_COUNT = 42

const rainColumns = Array.from({ length: RAIN_COLUMN_COUNT }, (_, index) => {
  const duration = 12 + ((index * 19) % 60) / 10
  const phase = ((index * 17) % RAIN_COLUMN_COUNT) / RAIN_COLUMN_COUNT
  const digits = Array.from({ length: 30 }, (_, row) =>
    (index * 13 + row * 7 + (index * row) % 11) % 2 === 0 ? "0" : "1",
  ).join("\n")

  return {
    index,
    digits,
    style: {
      left: `${((index + 0.5) / RAIN_COLUMN_COUNT) * 100}%`,
      animationDelay: `${-(duration * phase).toFixed(2)}s`,
      animationDuration: `${duration.toFixed(2)}s`,
      opacity: 0.14 + ((index * 7) % 13) / 100,
    } satisfies CSSProperties,
  }
})

export function BinaryRain({ isDark }: { isDark: boolean }) {
  return (
    <div className="binary-rain" data-theme={isDark ? "dark" : "light"} aria-hidden="true">
      {rainColumns.map((column) => (
        <span key={column.index} className="binary-rain__column" style={column.style}>
          {column.digits}
        </span>
      ))}
    </div>
  )
}
