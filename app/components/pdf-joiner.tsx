"use client"

import type React from "react"

import { useState, useRef } from "react"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Download, X } from "lucide-react"
import { LoaderGroup } from "./custom-loader"

export function PdfJoiner() {
  const [isLoading, setIsLoading] = useState(false)
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)
  const [customFilename, setCustomFilename] = useState<string>("")
  const [activeFileInput, setActiveFileInput] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileNumber: 1 | 2) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // Check if the file is a PDF
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
        return
      }

      // Set the file based on which input was used
      if (fileNumber === 1) {
        setFile1(file)
      } else {
        setFile2(file)
      }
    }
  }

  const clearFile = (fileNumber: 1 | 2) => {
    if (fileNumber === 1) {
      setFile1(null)
      if (fileInput1Ref.current) fileInput1Ref.current.value = ""
    } else {
      setFile2(null)
      if (fileInput2Ref.current) fileInput2Ref.current.value = ""
    }

    // If we clear a file, also clear the merged PDF
    setMergedPdfUrl(null)
    setPreviewUrl(null)
  }

  const mergePdfs = async () => {
    if (!file1 || !file2) {
      toast({
        title: "Missing files",
        description: "Please upload two PDF files to merge",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create()

      // Load the first PDF
      const pdf1Bytes = await file1.arrayBuffer()
      const pdf1 = await PDFDocument.load(pdf1Bytes)

      // Load the second PDF
      const pdf2Bytes = await file2.arrayBuffer()
      const pdf2 = await PDFDocument.load(pdf2Bytes)

      // Copy pages from the first PDF
      const pdf1Pages = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices())
      pdf1Pages.forEach((page) => mergedPdf.addPage(page))

      // Copy pages from the second PDF
      const pdf2Pages = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices())
      pdf2Pages.forEach((page) => mergedPdf.addPage(page))

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save()

      // Create a blob URL for the merged PDF
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      setMergedPdfUrl(url)
      setPreviewUrl(url)

      toast({
        title: "PDFs merged successfully",
        description: "You can now preview and download the merged PDF",
      })
    } catch (error) {
      console.error("Error merging PDFs:", error)
      toast({
        title: "Error merging PDFs",
        description: "An error occurred while merging the PDFs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadMergedPdf = () => {
    if (!mergedPdfUrl) return

    // Use custom filename if provided, otherwise use default
    const filename = customFilename.trim() ? `${customFilename.trim()}.pdf` : "merged_document.pdf"

    const link = document.createElement("a")
    link.href = mergedPdfUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">PDF Joiner</CardTitle>
        <CardDescription>Upload two PDF files to merge them into one document</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* First PDF upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf1">First PDF</Label>
            <div
              className={`file-input-container relative ${activeFileInput === "pdf1" ? "active" : ""} ${file1 ? "has-file" : ""}`}
              onFocus={() => setActiveFileInput("pdf1")}
              onBlur={() => setActiveFileInput(null)}
            >
              <Input
                ref={fileInput1Ref}
                id="pdf1"
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, 1)}
                className="cursor-pointer"
                onFocus={() => setActiveFileInput("pdf1")}
                onBlur={() => setActiveFileInput(null)}
              />
              {file1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => clearFile(1)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {file1 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" />
                <span className="truncate max-w-[200px]">{file1.name}</span>
                <span className="ml-2">({formatFileSize(file1.size)})</span>
              </div>
            )}
          </div>

          {/* Second PDF upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf2">Second PDF</Label>
            <div
              className={`file-input-container relative ${activeFileInput === "pdf2" ? "active" : ""} ${file2 ? "has-file" : ""}`}
              onFocus={() => setActiveFileInput("pdf2")}
              onBlur={() => setActiveFileInput(null)}
            >
              <Input
                ref={fileInput2Ref}
                id="pdf2"
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, 2)}
                className="cursor-pointer"
                onFocus={() => setActiveFileInput("pdf2")}
                onBlur={() => setActiveFileInput(null)}
              />
              {file2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => clearFile(2)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {file2 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" />
                <span className="truncate max-w-[200px]">{file2.name}</span>
                <span className="ml-2">({formatFileSize(file2.size)})</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={mergePdfs} disabled={!file1 || !file2 || isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <div className="flex items-center">
                <LoaderGroup />
                <span className="ml-2">Merging PDFs...</span>
              </div>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Merge PDFs
              </>
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-foreground mb-2">Processing your files...</p>
            <p className="text-xs text-muted-foreground">This may take a moment depending on file size</p>
          </div>
        )}

        {/* Filename Input */}
        {mergedPdfUrl && (
          <div className="space-y-2">
            <Label htmlFor="filename">Save As</Label>
            <div className="flex items-center gap-2">
              <Input
                id="filename"
                placeholder="Enter filename (without extension)"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">.pdf</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a name for your merged PDF file. If left blank, the default name "merged_document.pdf" will be used.
            </p>
          </div>
        )}

        {/* PDF Preview */}
        {previewUrl && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Preview</h3>
              <Button onClick={downloadMergedPdf} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download as {customFilename.trim() ? `"${customFilename.trim()}.pdf"` : "merged_document.pdf"}
              </Button>
            </div>
            <div className="border rounded-md overflow-hidden" style={{ height: "500px" }}>
              <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full" title="PDF Preview" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
