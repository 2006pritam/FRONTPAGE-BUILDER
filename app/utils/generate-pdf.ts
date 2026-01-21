import { jsPDF } from "jspdf"

/**
 * Generates a high-quality PDF with optimized file size
 * @param canvas The canvas element containing the document
 * @param orientation Page orientation ('portrait' or 'landscape')
 * @returns A promise that resolves to the PDF data URL
 */
export async function generateOptimizedPDF(
  canvas: HTMLCanvasElement,
  orientation: "portrait" | "landscape",
): Promise<{ dataUrl: string; pdf: jsPDF }> {
  // Create a new PDF with compression enabled
  const pdf = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
    floatPrecision: 16, // Use higher precision for better quality
  })

  // Get the PDF dimensions
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  // Get the canvas data as JPEG with high quality
  const imgData = canvas.toDataURL("image/jpeg", 0.92)

  // Get image properties
  const imgProps = pdf.getImageProperties(imgData)
  const imgWidth = imgProps.width
  const imgHeight = imgProps.height

  // Calculate the ratio to fit the image on the page
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

  // Calculate the centered position
  const imgX = (pdfWidth - imgWidth * ratio) / 2
  const imgY = (pdfHeight - imgHeight * ratio) / 2

  // Add the image to the PDF with high quality settings
  pdf.addImage(
    imgData,
    "JPEG",
    imgX,
    imgY,
    imgWidth * ratio,
    imgHeight * ratio,
    undefined,
    "FAST",
    0, // No rotation
  )

  // Get the PDF as data URL
  const dataUrl = pdf.output("datauristring")

  return { dataUrl, pdf }
}
