"use client"

import { useEffect, useRef, useState } from "react"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as z from "zod"
import { CollegeLogo } from "@/app/components/college-logo"
import { useToast } from "@/hooks/use-toast"
import { compressImage } from "@/app/utils/compress-image"
import { generateOptimizedPDF } from "@/app/utils/generate-pdf"
import { CustomLoader } from "./components/custom-loader"

// Update the formSchema to remove the logoLayout field
const formSchema = z.object({
  collegeName: z.string(),
  customCollegeName: z.string().nullable().default(""),
  department: z.string(),
  customDepartment: z.string().nullable().default(""),
  fullName: z.string(),
  rollNumber: z.string(),
  registrationNumber: z.string(),
  year: z.string(),
  semester: z.string(),
  subjectName: z.string(),
  subjectCode: z.string(),
  assignmentType: z.string(),
  customAssignmentType: z.string().nullable().default(""),
  fontStyle: z.string(),
  fontSize: z.object({
    collegeName: z.string(),
    department: z.string(),
    assignment: z.string(),
    subject: z.string(),
    details: z.string(),
  }),
  orientation: z.enum(["portrait", "landscape"]),
  textColor: z.string(),
  pageColor: z.string().default("#ffffff"),
  showBorder: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

const TELECLOUD_API_URL = (process.env.NEXT_PUBLIC_TELECLOUD_API_URL || "https://telecloud-xkas.onrender.com").replace(/\/$/, "")
const TELECLOUD_WEB_URL = (process.env.NEXT_PUBLIC_TELECLOUD_WEB_URL || "https://telecloud-9qu.pages.dev").replace(/\/$/, "")

interface PreviewProps {
  data: FormData
  onClose: () => void
  onSave?: (data: FormData) => Promise<void>
  savedRefNumber?: string | null
}

export default function Preview({ data, onClose, onSave, savedRefNumber }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingType, setProcessingType] = useState<"pdf" | "png" | "jpg" | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [telecloudActive, setTelecloudActive] = useState(false)
  const [telecloudChecked, setTelecloudChecked] = useState(false)
  const [telecloudToken, setTelecloudToken] = useState<string | null>(null)
  const [telecloudSaving, setTelecloudSaving] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const incomingToken = params.get("telecloud_token")
    const incomingState = params.get("state")
    const savedState = window.localStorage.getItem("telecloud-frontpage-state")
    if (incomingToken && incomingState && incomingState === savedState) {
      window.localStorage.setItem("telecloud-frontpage-token", incomingToken)
      window.localStorage.removeItem("telecloud-frontpage-state")
      window.history.replaceState({}, "", window.location.pathname)
    }
    const token = window.localStorage.getItem("telecloud-frontpage-token")
    setTelecloudToken(token)
    setTelecloudActive(!!token)
    setTelecloudChecked(true)
  }, [])

  // Helper function to format filename
  const formatFilename = (extension: string) => {
    // Format the student name, roll number, assignment type, and subject name by removing spaces and special characters
    const name = data.fullName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "")
    const rollNumber = data.rollNumber
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "")
    const assignmentType = data.assignmentType
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "")
    const subjectName = data.subjectName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "")

    return `${name}_${rollNumber}_${assignmentType}_${subjectName}.${extension}`
  }

  // Helper function to calculate file size in KB
  const calculateFileSizeKB = (dataUrl: string) => {
    // Remove the data URL prefix to get just the base64 data
    const base64 = dataUrl.split(",")[1]
    // Calculate size in bytes: (base64 length * 3/4) - number of padding characters
    const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0
    const sizeInBytes = (base64.length * 3) / 4 - padding
    // Convert to KB
    return Math.round(sizeInBytes / 1024)
  }

  const downloadAsPDF = async () => {
    if (!previewRef.current || isProcessing) return

    setIsProcessing(true)
    setProcessingType("pdf")

    try {
      // Show loading toast
      toast({
        title: "Processing PDF",
        description: "Optimizing file size while preserving quality...",
      })

      const element = previewRef.current

      // Use higher scale for better quality
      const canvas = await html2canvas(element, {
        scale: 1.8, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: null,
        imageTimeout: 0, // No timeout
        allowTaint: false,
        foreignObjectRendering: false, // More compatible rendering
      })

      // Generate optimized PDF
      const { dataUrl: pdfDataUrl, pdf } = await generateOptimizedPDF(
        canvas,
        data.orientation as "portrait" | "landscape",
      )

      // Calculate file size
      const fileSizeKB = calculateFileSizeKB(pdfDataUrl)

      // Use the formatted filename
      const filename = formatFilename("pdf")
      pdf.save(filename)

      // Show success toast notification with file size
      toast({
        title: "PDF Downloaded",
        description: `Saved as ${filename} (${fileSizeKB} KB)`,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingType(null)
    }
  }

  const downloadAsImage = async (format: "png" | "jpg") => {
    if (!previewRef.current || isProcessing) return

    setIsProcessing(true)
    setProcessingType(format)

    try {
      // Show loading toast
      toast({
        title: `Processing ${format.toUpperCase()}`,
        description: "Optimizing file size while preserving quality...",
      })

      // Use higher scale for better quality
      const canvas = await html2canvas(previewRef.current, {
        scale: 1.8, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: null,
        imageTimeout: 0, // No timeout
        allowTaint: false,
        foreignObjectRendering: false, // More compatible rendering
      })

      // Use the formatted filename
      const filename = formatFilename(format)

      // Get image data with high quality
      let dataUrl = canvas.toDataURL(`image/${format}`, format === "jpg" ? 0.92 : 0.95)

      // Compress the image to target size while preserving quality
      if (format === "jpg") {
        const currentSizeKB = calculateFileSizeKB(dataUrl)

        // Only compress if it's too large
        if (currentSizeKB > 300) {
          dataUrl = await compressImage(dataUrl, 300)
        }
      }

      // Calculate file size
      const fileSizeKB = calculateFileSizeKB(dataUrl)

      const link = document.createElement("a")
      link.download = filename
      link.href = dataUrl
      link.click()

      // Show success toast notification with file size
      toast({
        title: `${format.toUpperCase()} Downloaded`,
        description: `Saved as ${filename} (${fileSizeKB} KB)`,
      })
    } catch (error) {
      console.error(`Error generating ${format}:`, error)
      toast({
        title: "Error",
        description: `Failed to generate ${format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingType(null)
    }
  }

  const handleSaveAssignment = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(data)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateAssignment = async () => {
    if (!onSave || !savedRefNumber) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/assignments/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: savedRefNumber,
          data: data,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("Assignment updated successfully!")
      } else {
        alert("Failed to update assignment")
      }
    } catch (error) {
      console.error("Error updating assignment:", error)
      alert("Error updating assignment")
    } finally {
      setIsSaving(false)
    }
  }

  const connectTelecloud = () => {
    const state = crypto.randomUUID()
    window.localStorage.setItem("telecloud-frontpage-state", state)
    window.localStorage.setItem("telecloud-frontpage-pending", JSON.stringify({ data }))
    const returnTo = `${window.location.origin}${window.location.pathname}`
    const target = new URL(TELECLOUD_WEB_URL)
    target.searchParams.set("frontpage_return", returnTo)
    target.searchParams.set("state", state)
    window.location.assign(target.toString())
  }

  const handleSaveToTelecloud = async () => {
    if (!previewRef.current || !telecloudToken || telecloudSaving || isProcessing) return

    setTelecloudSaving(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 1.8,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        imageTimeout: 0,
        allowTaint: false,
        foreignObjectRendering: false,
      })
      const { pdf } = await generateOptimizedPDF(canvas, data.orientation as "portrait" | "landscape")
      const file = new File([pdf.output("arraybuffer")], formatFilename("pdf"), { type: "application/pdf" })
      const form = new FormData()
      form.append("file", file)
      form.append("telecloudToken", telecloudToken)
      const response = await fetch(`${TELECLOUD_API_URL}/api/integrations/frontpage/upload`, {
        method: "POST",
        body: form,
      })
      const result = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(result.error || "Telecloud could not save the file.")
      window.localStorage.removeItem("telecloud-frontpage-token")
      setTelecloudToken(null)
      setTelecloudActive(false)
      toast({ title: "Saved to Telecloud", description: `${file.name} was added to your Telegram drive.` })
    } catch (error) {
      console.error("Error saving to Telecloud:", error)
      toast({
        title: "Telecloud save failed",
        description: error instanceof Error ? error.message : "Please sign in to Telecloud and try again.",
        variant: "destructive",
      })
    } finally {
      setTelecloudSaving(false)
    }
  }

  const pageStyle = {
    width: data.orientation === "portrait" ? "210mm" : "297mm",
    height: data.orientation === "portrait" ? "297mm" : "210mm",
    margin: "0 auto",
    padding: "20mm",
    boxSizing: "border-box" as const,
    position: "relative" as const,
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center p-4 overflow-auto">
      <div className="bg-background p-4 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold">Preview</h2>
            {savedRefNumber && (
              <p className="text-sm text-muted-foreground mt-1">
                Reference #: <span className="font-mono font-semibold text-foreground">{savedRefNumber}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {onSave && !savedRefNumber && (
              <Button onClick={handleSaveAssignment} disabled={isSaving} variant="default">
                {isSaving ? "Saving..." : "Save for Later"}
              </Button>
            )}
            {onSave && savedRefNumber && (
              <Button onClick={handleUpdateAssignment} disabled={isSaving} variant="default" className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? "Updating..." : "Update Assignment"}
              </Button>
            )}
            {telecloudChecked && (
              <>
                {!telecloudActive && (
                  <Button onClick={connectTelecloud} disabled={telecloudSaving || isProcessing} variant="outline">
                    Connect Telecloud
                  </Button>
                )}
                <Button onClick={handleSaveToTelecloud} disabled={!telecloudActive || telecloudSaving || isProcessing} className="bg-green-600 hover:bg-green-700">
                  {telecloudSaving ? "Saving to Telecloud..." : "Save to Telecloud"}
                </Button>
                <Button onClick={handleSaveToTelecloud} disabled={!telecloudActive || telecloudSaving || isProcessing} className="bg-emerald-600 hover:bg-emerald-700">
                  {telecloudSaving ? "Saving in Cloud..." : "Save in Cloud"}
                </Button>
              </>
            )}
            <Select onValueChange={(value) => downloadAsImage(value as "png" | "jpg")} disabled={isProcessing}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Image" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={downloadAsPDF} disabled={isProcessing}>
              {isProcessing && processingType === "pdf" ? (
                <div className="flex items-center">
                  <CustomLoader type="circle" className="mr-2" />
                  <span>Processing...</span>
                </div>
              ) : (
                "PDF"
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Close
            </Button>
          </div>
        </div>

        {isProcessing && (
          <div className="mb-4 p-3 bg-primary/10 rounded-md text-sm flex items-center">
            <CustomLoader
              type={processingType === "pdf" ? "circle" : processingType === "png" ? "rectangle" : "triangle"}
              className="mr-3"
            />
            <div>
              <p className="font-medium">Generating {processingType?.toUpperCase()}</p>
              <p>Please wait while we optimize your document...</p>
            </div>
          </div>
        )}

        {!isProcessing && (
          <div className="mb-4 p-3 bg-muted rounded-md text-sm">
            <p>
              Files will be automatically named using the format:{" "}
              <strong>student_name_roll_number_assignment_type_subject_name</strong>
            </p>
            <p className="mt-1">Files are optimized for smaller size (KB range) while preserving document quality</p>
          </div>
        )}

        <div className="bg-white rounded-lg overflow-auto">
          <div ref={previewRef} style={pageStyle} className="bg-white">
            <div
              className={`${data.showBorder ? "border-2 border-black" : ""} p-8 h-full flex flex-col items-center`}
              style={{ backgroundColor: data.pageColor || "#ffffff" }}
            >
              {/* College Name */}
              {data.collegeName && data.collegeName !== "CUSTOM" && (
                <div
                  style={{
                    fontFamily: data.fontStyle || "Arial",
                    fontSize: `${data.fontSize?.collegeName || "28"}px`,
                    color: data.textColor || "#000000",
                  }}
                  className="text-center font-bold underline mb-8"
                >
                  {data.collegeName}
                </div>
              )}

              {/* Custom College Name */}
              {data.collegeName === "CUSTOM" && data.customCollegeName && (
                <div
                  style={{
                    fontFamily: data.fontStyle || "Arial",
                    fontSize: `${data.fontSize?.collegeName || "28"}px`,
                    color: data.textColor || "#000000",
                  }}
                  className="text-center font-bold underline mb-8"
                >
                  {data.customCollegeName}
                </div>
              )}

              {/* CollegeLogo component */}
              <CollegeLogo className="w-32 h-32 mb-8" />

              {/* Assignment Type */}
              {data.assignmentType && (
                <div
                  style={{
                    fontFamily: data.fontStyle || "Arial",
                    fontSize: `${data.fontSize?.assignment || "24"}px`,
                    color: data.textColor || "#000000",
                  }}
                  className="font-bold mb-12 underline"
                >
                  {data.assignmentType === "CUSTOM" ? data.customAssignmentType : data.assignmentType} ASSIGNMENT
                </div>
              )}

              {/* Student Details */}
              <div
                className="space-y-4 text-center"
                style={{
                  fontFamily: data.fontStyle || "Arial",
                  fontSize: `${data.fontSize?.details || "22"}px`,
                  color: data.textColor || "#000000",
                }}
              >
                <p>
                  <strong>Name:</strong> {data.fullName || ""}
                </p>
                <p>
                  <strong>University registration no:</strong> {data.registrationNumber || ""}
                </p>
                <p>
                  <strong>University Roll no:</strong> {data.rollNumber || ""}
                </p>
                <p>
                  <strong>Stream:</strong> {data.customDepartment && data.department === "CUSTOM" ? data.customDepartment : data.department || ""}
                </p>
                <p>
                  <strong>Year:</strong> {data.year || ""}
                </p>
                <p>
                  <strong>Semester:</strong> {data.semester || ""}
                </p>
                <p>
                  <strong>Subject:</strong> {data.subjectName || ""}
                </p>
                <p>
                  <strong>Subject Code:</strong> {data.subjectCode || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
