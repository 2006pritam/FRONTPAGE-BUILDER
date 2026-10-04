"use client"

import { useEffect, useRef, useState } from "react"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type AssignmentFormData = z.infer<typeof formSchema>

interface PreviewProps {
  data: AssignmentFormData
  onClose: () => void
  onSave?: (data: AssignmentFormData) => Promise<void>
  savedRefNumber?: string | null
  teleCloudConfig?: {
    apiUrl: string
    authToken: string
  } | null
  isTeleCloudConnected?: boolean
  onTeleCloudSessionChange?: (session: {
    config: {
      apiUrl: string
      authToken: string
    } | null
    isConnected: boolean
  }) => void
}

const normalizeApiUrl = (url: string) => url.trim().replace(/\/+$/, "")

export default function Preview({
  data,
  onClose,
  onSave,
  savedRefNumber,
  teleCloudConfig,
  isTeleCloudConnected,
  onTeleCloudSessionChange,
}: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingType, setProcessingType] = useState<"pdf" | "png" | "jpg" | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingToTeleCloud, setIsUploadingToTeleCloud] = useState(false)
  const [teleCloudUploadProgress, setTeleCloudUploadProgress] = useState<number | null>(null)
  const [showTeleCloudDialog, setShowTeleCloudDialog] = useState(false)
  const [teleCloudUrl, setTeleCloudUrl] = useState(teleCloudConfig?.apiUrl ?? "")
  const [teleCloudAuthToken, setTeleCloudAuthToken] = useState(teleCloudConfig?.authToken ?? "")
  const [checkingTeleCloud, setCheckingTeleCloud] = useState(false)
  const [isTeleCloudConnectedLocally, setIsTeleCloudConnectedLocally] = useState(Boolean(isTeleCloudConnected))

  useEffect(() => {
    setTeleCloudUrl(teleCloudConfig?.apiUrl ?? "")
    setTeleCloudAuthToken(teleCloudConfig?.authToken ?? "")
  }, [teleCloudConfig])

  useEffect(() => {
    setIsTeleCloudConnectedLocally(Boolean(isTeleCloudConnected))
  }, [isTeleCloudConnected])

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

  const updateTeleCloudSession = (isConnected: boolean, configOverride?: { apiUrl: string; authToken: string } | null) => {
    const config = configOverride ?? (teleCloudUrl ? { apiUrl: normalizeApiUrl(teleCloudUrl), authToken: teleCloudAuthToken.trim() } : null)

    setIsTeleCloudConnectedLocally(isConnected)
    onTeleCloudSessionChange?.({
      config,
      isConnected,
    })
  }

  const checkTeleCloudConnection = async (apiUrl: string, authToken: string) => {
    const normalizedUrl = normalizeApiUrl(apiUrl)
    const headers: Record<string, string> = {}

    if (authToken.trim()) {
      headers.Authorization = "Bearer " + authToken.trim()
    }

    const sessionEndpoints = ["/api/session", "/api/auth/session"]

    for (const endpoint of sessionEndpoints) {
      try {
        const response = await fetch(`${normalizedUrl}${endpoint}`, {
          method: "GET",
          headers,
          credentials: "include",
        })

        if (response.ok) {
          return true
        }
      } catch (error) {
        console.error(`TeleCloud session check failed for ${endpoint}:`, error)
      }
    }

    return false
  }

  useEffect(() => {
    const verifySavedSession = async () => {
      if (!teleCloudConfig?.apiUrl || isTeleCloudConnectedLocally) return

      const isConnected = await checkTeleCloudConnection(teleCloudConfig.apiUrl, teleCloudConfig.authToken)
      updateTeleCloudSession(isConnected, teleCloudConfig)
    }

    verifySavedSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teleCloudConfig?.apiUrl, teleCloudConfig?.authToken])

  const createPdfFromPreview = async () => {
    if (!previewRef.current) {
      throw new Error("Preview not available")
    }

    const element = previewRef.current
    const canvas = await html2canvas(element, {
      scale: 1.8,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      imageTimeout: 0,
      allowTaint: false,
      foreignObjectRendering: false,
    })

    const { dataUrl: pdfDataUrl, pdf } = await generateOptimizedPDF(canvas, data.orientation as "portrait" | "landscape")
    const fileSizeKB = calculateFileSizeKB(pdfDataUrl)

    return {
      pdfDataUrl,
      pdf,
      fileSizeKB,
      filename: formatFilename("pdf"),
    }
  }

  const uploadFileToTeleCloud = async (uploadUrl: string, formData: FormData, authToken: string) => {
    return new Promise<{ status: number; responseText: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", uploadUrl)
      xhr.withCredentials = true

      if (authToken.trim()) {
        xhr.setRequestHeader("Authorization", "Bearer " + authToken.trim())
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setTeleCloudUploadProgress(Math.round((event.loaded / event.total) * 100))
        }
      }

      xhr.onload = () => {
        resolve({
          status: xhr.status,
          responseText: xhr.responseText,
        })
      }

      xhr.onerror = () => reject(new Error("Unable to reach TeleCloud upload endpoint"))
      xhr.send(formData)
    })
  }

  const getUploadedFileUrl = (baseUrl: string, response: Record<string, unknown>, fallbackName: string) => {
    const candidates = [response.url, response.fileUrl, response.openUrl, response.link]

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        if (candidate.startsWith("http")) return candidate
        if (candidate.startsWith("/")) return `${baseUrl}${candidate}`
      }
    }

    if (typeof response.id === "string" && response.id.trim()) {
      return `${baseUrl}/files/${encodeURIComponent(response.id)}`
    }

    return `${baseUrl}/files/${encodeURIComponent(fallbackName)}`
  }

  const connectTeleCloud = async () => {
    if (!teleCloudUrl.trim()) {
      toast({
        title: "TeleCloud URL required",
        description: "Please enter your TeleCloud instance URL.",
        variant: "destructive",
      })
      return
    }

    setCheckingTeleCloud(true)

    const normalizedUrl = normalizeApiUrl(teleCloudUrl)
    const normalizedConfig = {
      apiUrl: normalizedUrl,
      authToken: teleCloudAuthToken.trim(),
    }

    try {
      const isConnected = await checkTeleCloudConnection(normalizedUrl, teleCloudAuthToken)

      if (!isConnected) {
        toast({
          title: "TeleCloud connection failed",
          description: "Could not detect an active TeleCloud session. Please authenticate and try again.",
          variant: "destructive",
        })
        updateTeleCloudSession(false, normalizedConfig)
        return
      }

      setTeleCloudUrl(normalizedUrl)
      updateTeleCloudSession(true, normalizedConfig)
      setShowTeleCloudDialog(false)
      toast({
        title: "TeleCloud connected",
        description: "Your TeleCloud session is active.",
      })
    } catch (error) {
      console.error("Error connecting TeleCloud:", error)
      toast({
        title: "TeleCloud connection failed",
        description: "Unable to connect to TeleCloud. Please check URL and authentication.",
        variant: "destructive",
      })
      updateTeleCloudSession(false, normalizedConfig)
    } finally {
      setCheckingTeleCloud(false)
    }
  }

  const saveDirectlyToTeleCloud = async () => {
    if (!teleCloudUrl.trim() || !isTeleCloudConnectedLocally) {
      setShowTeleCloudDialog(true)
      return
    }

    if (isUploadingToTeleCloud || isProcessing) return

    setIsUploadingToTeleCloud(true)
    setTeleCloudUploadProgress(0)

    try {
      toast({
        title: "Preparing upload",
        description: "Generating PDF for TeleCloud...",
      })

      const { pdf, filename, fileSizeKB } = await createPdfFromPreview()
      const formData = new FormData()
      const pdfBlob = pdf.output("blob")
      formData.append("file", pdfBlob, filename)
      formData.append("filename", filename)

      const uploadUrl = `${normalizeApiUrl(teleCloudUrl)}/api/upload`
      const uploadResponse = await uploadFileToTeleCloud(uploadUrl, formData, teleCloudAuthToken)

      if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
        updateTeleCloudSession(false)
        throw new Error(`Upload failed with status ${uploadResponse.status}`)
      }

      let parsedResponse: Record<string, unknown> = {}
      if (uploadResponse.responseText) {
        try {
          parsedResponse = JSON.parse(uploadResponse.responseText) as Record<string, unknown>
        } catch (error) {
          console.error("Unable to parse TeleCloud upload response:", error)
        }
      }
      const openUrl = getUploadedFileUrl(normalizeApiUrl(teleCloudUrl), parsedResponse, filename)

      toast({
        title: "Uploaded to TeleCloud",
        description: (
          <span>
            {filename} ({fileSizeKB} KB) uploaded.{" "}
            <a className="underline font-medium" href={openUrl} target="_blank" rel="noreferrer">
              Open in TeleCloud
            </a>
          </span>
        ),
      })
    } catch (error) {
      console.error("Error uploading to TeleCloud:", error)
      toast({
        title: "TeleCloud upload failed",
        description: "Failed to upload PDF to TeleCloud. Please reconnect and try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingToTeleCloud(false)
      setTeleCloudUploadProgress(null)
    }
  }

  const downloadAsPDF = async () => {
    if (!previewRef.current || isProcessing || isUploadingToTeleCloud) return

    setIsProcessing(true)
    setProcessingType("pdf")

    try {
      // Show loading toast
      toast({
        title: "Processing PDF",
        description: "Optimizing file size while preserving quality...",
      })

      const { pdf, fileSizeKB, filename } = await createPdfFromPreview()
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
    if (!previewRef.current || isProcessing || isUploadingToTeleCloud) return

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
            <Select onValueChange={(value) => downloadAsImage(value as "png" | "jpg")} disabled={isProcessing || isUploadingToTeleCloud}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Image" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={downloadAsPDF} disabled={isProcessing || isUploadingToTeleCloud}>
              {isProcessing && processingType === "pdf" ? (
                <div className="flex items-center">
                  <CustomLoader type="circle" className="mr-2" />
                  <span>Processing...</span>
                </div>
              ) : (
                "PDF"
              )}
            </Button>
            <Button
              onClick={saveDirectlyToTeleCloud}
              variant={isTeleCloudConnectedLocally ? "default" : "outline"}
              disabled={isProcessing || isUploadingToTeleCloud}
            >
              {isUploadingToTeleCloud ? (
                <div className="flex items-center">
                  <CustomLoader type="circle" className="mr-2" />
                  <span>{teleCloudUploadProgress !== null ? `Uploading ${teleCloudUploadProgress}%` : "Uploading..."}</span>
                </div>
              ) : (
                "Directly Save to TeleCloud"
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowTeleCloudDialog(true)} disabled={isProcessing || isUploadingToTeleCloud}>
              {isTeleCloudConnectedLocally ? "TeleCloud Connected" : "Connect TeleCloud"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isProcessing || isUploadingToTeleCloud}>
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

        {isUploadingToTeleCloud && (
          <div className="mb-4 p-3 bg-primary/10 rounded-md text-sm flex items-center">
            <CustomLoader type="circle" className="mr-3" />
            <div>
              <p className="font-medium">Uploading to TeleCloud</p>
              <p>{teleCloudUploadProgress !== null ? `${teleCloudUploadProgress}% completed` : "Starting upload..."}</p>
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

        {showTeleCloudDialog && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg border bg-background p-4 shadow-xl">
              <h3 className="text-lg font-semibold">Connect TeleCloud</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your TeleCloud instance API URL and authentication token (if required).
              </p>

              <div className="space-y-3 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="telecloud-url">TeleCloud URL</Label>
                  <Input
                    id="telecloud-url"
                    placeholder="https://your-telecloud-instance.com"
                    value={teleCloudUrl}
                    onChange={(event) => setTeleCloudUrl(event.target.value)}
                    disabled={checkingTeleCloud}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telecloud-token">API Token / Auth Key</Label>
                  <Input
                    id="telecloud-token"
                    type="password"
                    placeholder="Optional, if your TeleCloud requires it"
                    value={teleCloudAuthToken}
                    onChange={(event) => setTeleCloudAuthToken(event.target.value)}
                    disabled={checkingTeleCloud}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <Button
                  variant="outline"
                  onClick={() => setShowTeleCloudDialog(false)}
                  disabled={checkingTeleCloud}
                >
                  Cancel
                </Button>
                <Button onClick={connectTeleCloud} disabled={checkingTeleCloud}>
                  {checkingTeleCloud ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
