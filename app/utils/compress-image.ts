/**
 * Compresses an image to reduce file size while preserving quality
 * @param dataUrl The data URL of the image
 * @param maxSizeKB The maximum size in KB
 * @returns A promise that resolves to a compressed data URL
 */
export async function compressImage(dataUrl: string, maxSizeKB = 300): Promise<string> {
  // Create an image element
  const img = new Image()
  img.src = dataUrl

  // Wait for the image to load
  await new Promise((resolve) => {
    img.onload = resolve
  })

  // Create a canvas element
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return dataUrl // Return original if context not available
  }

  // Set canvas dimensions to match the image
  canvas.width = img.width
  canvas.height = img.height

  // Draw the image on the canvas with high quality settings
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(img, 0, 0)

  // Calculate size in KB
  const calculateSizeKB = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1]
    const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0
    const sizeInBytes = (base64.length * 3) / 4 - padding
    return sizeInBytes / 1024
  }

  // Try different quality levels for JPEG, starting high
  const qualityLevels = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7]

  for (const quality of qualityLevels) {
    const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
    const currentSizeKB = calculateSizeKB(compressedDataUrl)

    if (currentSizeKB <= maxSizeKB) {
      return compressedDataUrl
    }
  }

  // If we couldn't get small enough with quality adjustments alone,
  // try reducing dimensions slightly while keeping high quality
  const scaleFactors = [0.95, 0.9, 0.85, 0.8]

  for (const scale of scaleFactors) {
    // Create a new canvas with reduced dimensions
    const scaledCanvas = document.createElement("canvas")
    const scaledCtx = scaledCanvas.getContext("2d")

    if (!scaledCtx) continue

    // Set new dimensions
    scaledCanvas.width = Math.floor(img.width * scale)
    scaledCanvas.height = Math.floor(img.height * scale)

    // Use high quality settings
    scaledCtx.imageSmoothingEnabled = true
    scaledCtx.imageSmoothingQuality = "high"

    // Draw the image at the new size
    scaledCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height)

    // Try with high quality first
    const compressedDataUrl = scaledCanvas.toDataURL("image/jpeg", 0.9)
    const currentSizeKB = calculateSizeKB(compressedDataUrl)

    if (currentSizeKB <= maxSizeKB) {
      return compressedDataUrl
    }
  }

  // If we still can't get it small enough, use the smallest acceptable quality
  // but with minimal dimension reduction to preserve quality
  const finalCanvas = document.createElement("canvas")
  const finalCtx = finalCanvas.getContext("2d")

  if (!finalCtx) {
    return canvas.toDataURL("image/jpeg", 0.7) // Fallback
  }

  // Reduce dimensions by 25% maximum
  finalCanvas.width = Math.floor(img.width * 0.75)
  finalCanvas.height = Math.floor(img.height * 0.75)

  finalCtx.imageSmoothingEnabled = true
  finalCtx.imageSmoothingQuality = "high"
  finalCtx.drawImage(img, 0, 0, finalCanvas.width, finalCanvas.height)

  return finalCanvas.toDataURL("image/jpeg", 0.8)
}
