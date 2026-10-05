"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, BookOpen, FileText, Download, ArrowRight, ChevronRight, FilePlus2, FileOutput } from "lucide-react"
import { Button } from "@/components/ui/button"
import Preview from "./preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Footer } from "./components/footer"
import { Background } from "./components/background"
import { CollegeLogo } from "./components/college-logo"
import { PdfJoiner } from "./components/pdf-joiner"
import { PdfConverter } from "./components/pdf-converter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NeonLogoButton } from "./components/neon-logo-button"
import "./components/custom-tabs.css"
import "./components/color-picker.css"
import "./components/custom-loader.css"
import "./components/neon-logo.css"
import "./components/glowing-inputs.css"
import "./components/turnstile.css"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { LoaderGroup } from "./components/custom-loader"

const colleges = [
  "SUPREME KNOWLEDGE FOUNDATION GROUP OF INSTITUTIONS",
  "SUPREME INSTITUTE OF MANAGEMENT AND TECHNOLOGY",
  "CUSTOM",
]

const departments = ["BCA", "CYS", "CSE", "BBA", "MBA", "MCA", "MTECH", "CUSTOM"]

const years = Array.from({ length: 76 }, (_, i) => (2024 + i).toString())

const semesters = Array.from({ length: 8 }, (_, i) => `${i + 1}${["st", "nd", "rd", "th"][i < 3 ? i : 3]} Semester`)

const assignmentTypes = ["CA1", "CA2", "PRACTICAL", "PROJECT", "CUSTOM"]

const fonts = ["Arial", "Times New Roman", "Helvetica", "Georgia", "Verdana", "Roboto"]

// Update the formSchema to remove the logoLayout option
const formSchema = z.object({
  collegeName: z.string().min(1, "Please select a college"),
  customCollegeName: z.string().nullable().default(""),
  department: z.string().min(1, "Please select a department"),
  customDepartment: z.string().nullable().default(""),
  fullName: z.string().min(1, "Full name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  year: z.string().min(1, "Please select a year"),
  semester: z.string().min(1, "Please select a semester"),
  subjectName: z.string().min(1, "Subject name is required"),
  subjectCode: z.string().min(1, "Subject code is required"),
  assignmentType: z.string().min(1, "Please select assignment type"),
  customAssignmentType: z.string().nullable().default(""),
  fontStyle: z.string().min(1, "Please select a font style"),
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

// Update the defaultValues in the useForm hook to remove logoLayout
const defaultValues: z.infer<typeof formSchema> = {
  collegeName: "",
  customCollegeName: "",
  department: "",
  customDepartment: "",
  fullName: "",
  rollNumber: "",
  registrationNumber: "",
  year: "",
  semester: "",
  subjectName: "",
  subjectCode: "",
  assignmentType: "",
  customAssignmentType: "",
  fontStyle: "Arial",
  fontSize: {
    collegeName: "28",
    department: "20",
    assignment: "24",
    subject: "20",
    details: "22",
  },
  orientation: "portrait",
  textColor: "#000000",
  pageColor: "#ffffff",
  showBorder: true,
}

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export default function AssignmentMaker() {
  const [showForm, setShowForm] = useState(false)
  const [showPdfJoiner, setShowPdfJoiner] = useState(false)
  const [showPdfConverter, setShowPdfConverter] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null)
  const [activeTab, setActiveTab] = useState("student-info")
  const [isLoading, setIsLoading] = useState(true)
  const [activeFileInput, setActiveFileInput] = useState<string | null>(null)
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null)
  const [retrieveRefInput, setRetrieveRefInput] = useState("")
  const [retrieveLoading, setRetrieveLoading] = useState(false)
  const [retrieveError, setRetrieveError] = useState("")
  const [saveLoading, setSaveLoading] = useState(false)

  // Add effect to simulate initial loading
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const incomingToken = params.get("telecloud_token")
    const incomingState = params.get("state")
    const savedState = window.localStorage.getItem("telecloud-frontpage-state")
    const pending = window.localStorage.getItem("telecloud-frontpage-pending")
    if (!incomingToken || !incomingState || incomingState !== savedState || !pending) return
    try {
      const parsed = formSchema.safeParse(JSON.parse(pending).data)
      if (parsed.success) {
        window.localStorage.setItem("telecloud-frontpage-token", incomingToken)
        window.localStorage.removeItem("telecloud-frontpage-state")
        window.localStorage.removeItem("telecloud-frontpage-pending")
        form.reset(parsed.data)
        setFormData(parsed.data)
        setShowPreview(true)
        window.history.replaceState({}, "", window.location.pathname)
      }
    } catch {
      // Leave the builder on its normal landing page if the pending draft is invalid.
    }
  }, [form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    setFormData(values)
    setShowPreview(true)
  }

  // Save assignment to database
  const saveAssignment = async (values: z.infer<typeof formSchema>) => {
    setSaveLoading(true)
    try {
      const response = await fetch("/api/assignments/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        setReferenceNumber(data.referenceNumber)
      } else {
        alert("Failed to save assignment")
      }
    } catch (error) {
      console.error("Error saving assignment:", error)
      alert("Error saving assignment")
    } finally {
      setSaveLoading(false)
    }
  }

  // Retrieve assignment from database
  const retrieveAssignment = async () => {
    if (!retrieveRefInput.trim()) {
      setRetrieveError("Please enter a reference number")
      return
    }

    setRetrieveLoading(true)
    setRetrieveError("")

    try {
      const response = await fetch(`/api/assignments/retrieve?ref=${retrieveRefInput}`)
      const data = await response.json()

      if (data.success) {
        // Populate form with retrieved data
        form.reset(data.data)
        // Set form data and show preview
        setFormData(data.data)
        setShowPreview(true)
        setRetrieveRefInput("")
        setRetrieveError("")
        // Set the reference number so save button won't appear
        setReferenceNumber(retrieveRefInput)
      } else {
        setRetrieveError(data.error || "Assignment not found")
      }
    } catch (error) {
      console.error("Error retrieving assignment:", error)
      setRetrieveError("Error retrieving assignment")
    } finally {
      setRetrieveLoading(false)
    }
  }

  // Helper function to go back to home
  const goToHome = () => {
    setShowForm(false)
    setShowPdfJoiner(false)
    setShowPdfConverter(false)
  }

  // Function to handle file input focus
  const handleFileInputFocus = (inputId: string) => {
    setActiveFileInput(inputId)
  }

  // Function to handle file input blur
  const handleFileInputBlur = () => {
    setActiveFileInput(null)
  }

  // Show loading screen during initial load
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <div className="mb-8">
          <LoaderGroup />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 text-foreground mb-4">
          <NeonLogoButton />
        </h1>
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    )
  }

  return (
    <Background isDark={isDark}>
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={goToHome}
              className="cursor-pointer"
            >
              <NeonLogoButton onClick={goToHome} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
                {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </Button>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!showForm && !showPdfJoiner && !showPdfConverter ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="text-center mb-12 mt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                  >
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground drop-shadow-sm">
                      Assignment Front Page Creator
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                  >
                    <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto drop-shadow-sm">
                      Create professional assignment cover pages in seconds with our easy-to-use tool
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mb-12"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-30"></div>
                    <div className="relative bg-background/95 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-border/40">
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-shrink-0">
                          <CollegeLogo className="w-32 h-32 md:w-40 md:h-40" />
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-foreground">Why use our tool?</h2>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">
                                Professional and consistent assignment front pages
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Download className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">
                                Download as PDF, PNG, or JPG with optimized file sizes
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">Customizable fonts, colors, and layouts</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Button
                      size="lg"
                      onClick={() => setShowForm(true)}
                      className="text-lg group px-6 py-6 h-auto relative overflow-hidden"
                    >
                      <span className="relative z-10">Create Your Front Page</span>
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-primary/10 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setShowPdfJoiner(true)}
                      className="text-lg group px-6 py-6 h-auto relative overflow-hidden"
                    >
                      <span className="relative z-10">Join PDF Files</span>
                      <FilePlus2 className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-primary/10 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    </Button>

                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => setShowPdfConverter(true)}
                      className="text-lg group px-6 py-6 h-auto relative overflow-hidden"
                    >
                      <span className="relative z-10">Convert Documents</span>
                      <FileOutput className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-primary/10 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    </Button>
                  </div>
                  <p className="text-sm text-foreground mt-2 drop-shadow-sm">No registration required. Free to use.</p>
                </motion.div>
              </motion.div>
            ) : showPdfJoiner ? (
              <motion.div
                key="pdf-joiner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-background/95 shadow-lg border-t-4 border-t-primary">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl">PDF Joiner</CardTitle>
                        <CardDescription>Merge two PDF files into one document</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={goToHome} className="group bg-transparent">
                        <span>Back to Home</span>
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:-rotate-45 transition-transform" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PdfJoiner />
                  </CardContent>
                </Card>
              </motion.div>
            ) : showPdfConverter ? (
              <motion.div
                key="pdf-converter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-background/95 shadow-lg border-t-4 border-t-primary">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl">Document Converter</CardTitle>
                        <CardDescription>Convert between PDF, Word, PowerPoint, and Excel formats</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={goToHome} className="group bg-transparent">
                        <span>Back to Home</span>
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:-rotate-45 transition-transform" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PdfConverter />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-background/95 shadow-lg border-t-4 border-t-primary">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl">Create Assignment Front Page</CardTitle>
                        <CardDescription>Fill in the details for your assignment front page</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={goToHome} className="group bg-transparent">
                        <span>Back to Home</span>
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:-rotate-45 transition-transform" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs
                          defaultValue="student-info"
                          value={activeTab}
                          onValueChange={setActiveTab}
                          className="w-full tabs-container"
                        >
                          <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8 tabs-list">
                            <TabsTrigger value="student-info" className="text-sm md:text-base py-2 px-4 tab-trigger">
                              Student Info
                            </TabsTrigger>

                            <TabsTrigger value="assignment-info" className="text-sm md:text-base py-2 px-4 tab-trigger">
                              Assignment Details
                            </TabsTrigger>

                            <TabsTrigger value="appearance" className="text-sm md:text-base py-2 px-4 tab-trigger">
                              Appearance
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="student-info">
                            {/* Retrieve Assignment Section */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                            >
                              <h3 className="text-lg font-semibold text-foreground mb-4">Update Previous Assignment</h3>
                              <div className="flex gap-2 flex-col sm:flex-row">
                                <Input
                                  placeholder="Enter reference number (e.g., ABC12345)"
                                  value={retrieveRefInput}
                                  onChange={(e) => setRetrieveRefInput(e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  onClick={retrieveAssignment}
                                  disabled={retrieveLoading}
                                  className="w-full sm:w-auto"
                                >
                                  {retrieveLoading ? "Loading..." : "Load Assignment"}
                                </Button>
                              </div>
                              {retrieveError && <p className="text-red-500 text-sm mt-2">{retrieveError}</p>}
                              <p className="text-sm text-muted-foreground mt-2">
                                Don't have a reference number? Create a new assignment and save it to get one.
                              </p>
                            </motion.div>

                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="show"
                              className="grid gap-4 md:grid-cols-2"
                            >
                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="collegeName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>College Name</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Select college" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {colleges.map((college) => (
                                            <SelectItem key={college} value={college}>
                                              {college}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              {form.watch("collegeName") === "CUSTOM" && (
                                <motion.div variants={itemVariants}>
                                  <FormField
                                    control={form.control}
                                    name="customCollegeName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Enter College Name</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter your college name"
                                            {...field}
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </motion.div>
                              )}

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="department"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Department</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Select department" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                              {dept}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              {form.watch("department") === "CUSTOM" && (
                                <motion.div variants={itemVariants}>
                                  <FormField
                                    control={form.control}
                                    name="customDepartment"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Enter Department</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter your department"
                                            {...field}
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </motion.div>
                              )}

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="fullName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Full Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter your full name"
                                          {...field}
                                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="rollNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Roll Number</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter your roll number"
                                          {...field}
                                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="registrationNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Registration Number</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter your registration number"
                                          {...field}
                                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="year"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Year</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Select year" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {years.map((year) => (
                                            <SelectItem key={year} value={year}>
                                              {year}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="semester"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Semester</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Select semester" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {semesters.map((semester) => (
                                            <SelectItem key={semester} value={semester}>
                                              {semester}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8 }}
                              className="flex justify-end mt-6"
                            >
                              <Button type="button" onClick={() => setActiveTab("assignment-info")} className="group">
                                Next Step
                                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </motion.div>
                          </TabsContent>

                          <TabsContent value="assignment-info">
                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="show"
                              className="grid gap-4 md:grid-cols-2"
                            >
                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="subjectName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Subject Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter subject name"
                                          {...field}
                                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="subjectCode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Subject Code</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter subject code"
                                          {...field}
                                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="assignmentType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Assignment Type</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {assignmentTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              {form.watch("assignmentType") === "CUSTOM" && (
                                <motion.div variants={itemVariants}>
                                  <FormField
                                    control={form.control}
                                    name="customAssignmentType"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Enter Assignment Type</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter assignment type (e.g., Quiz, Test)"
                                            {...field}
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </motion.div>
                              )}

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="orientation"
                                  render={({ field }) => (
                                    <FormItem className="space-y-3">
                                      <FormLabel>Page Orientation</FormLabel>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          className="flex space-x-4"
                                        >
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="portrait" id="portrait" />
                                            <label htmlFor="portrait">Portrait</label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="landscape" id="landscape" />
                                            <label htmlFor="landscape">Landscape</label>
                                          </div>
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants} className="md:col-span-2">
                                <FormField
                                  control={form.control}
                                  name="showBorder"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>Show Page Border</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                          Toggle to show or hide the border around the assignment page
                                        </p>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </motion.div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.6 }}
                              className="flex justify-between mt-6"
                            >
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab("student-info")}
                                className="group"
                              >
                                <ChevronRight className="mr-1 h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                Previous
                              </Button>
                              <Button type="button" onClick={() => setActiveTab("appearance")} className="group">
                                Next Step
                                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </motion.div>
                          </TabsContent>

                          <TabsContent value="appearance">
                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="show"
                              className="space-y-6"
                            >
                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="fontStyle"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Font Style</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                            <SelectValue placeholder="Select font" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {fonts.map((font) => (
                                            <SelectItem key={font} value={font}>
                                              <span style={{ fontFamily: font }}>{font}</span>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="textColor"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Text Color</FormLabel>
                                      <div className="flex items-center gap-4">
                                        <FormControl>
                                          <div className="color-picker-container">
                                            <Input type="color" {...field} className="w-16 h-10 color-picker-input" />
                                          </div>
                                        </FormControl>
                                        <div
                                          className="h-10 flex-1 rounded-md border flex items-center justify-center font-medium color-preview"
                                          style={{ color: field.value, fontFamily: form.watch("fontStyle") }}
                                        >
                                          Sample Text
                                        </div>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <FormField
                                  control={form.control}
                                  name="pageColor"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Page Background Color</FormLabel>
                                      <div className="flex items-center gap-4">
                                        <FormControl>
                                          <div className="color-picker-container">
                                            <Input type="color" {...field} className="w-16 h-10 color-picker-input" />
                                          </div>
                                        </FormControl>
                                        <div
                                          className="h-10 flex-1 rounded-md border flex items-center justify-center color-preview"
                                          style={{ backgroundColor: field.value }}
                                        >
                                          <span className="font-medium" style={{ color: form.watch("textColor") }}>
                                            Page Background Preview
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Choose a background color for your assignment page
                                      </p>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <h3 className="text-lg font-medium mb-4">Font Sizes</h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                  <FormField
                                    control={form.control}
                                    name="fontSize.collegeName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>College Name</FormLabel>
                                        <FormControl>
                                          <div className="flex items-center">
                                            <Input
                                              type="number"
                                              min="12"
                                              max="72"
                                              {...field}
                                              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                            <span className="ml-2">px</span>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="fontSize.assignment"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Assignment</FormLabel>
                                        <FormControl>
                                          <div className="flex items-center">
                                            <Input
                                              type="number"
                                              min="12"
                                              max="72"
                                              {...field}
                                              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                            <span className="ml-2">px</span>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="fontSize.details"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Details</FormLabel>
                                        <FormControl>
                                          <div className="flex items-center">
                                            <Input
                                              type="number"
                                              min="12"
                                              max="72"
                                              {...field}
                                              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                            <span className="ml-2">px</span>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </motion.div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.6 }}
                              className="flex justify-between mt-6"
                            >
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab("assignment-info")}
                                className="group"
                              >
                                <ChevronRight className="mr-1 h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                Previous
                              </Button>
                              <Button type="submit" className="relative group overflow-hidden">
                                <span className="relative z-10">Create Front Page</span>
                                <div className="absolute inset-0 bg-primary/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                              </Button>
                            </motion.div>
                          </TabsContent>
                        </Tabs>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {showPreview && formData && (
            <Preview
              data={formData}
              onClose={() => setShowPreview(false)}
              onSave={saveAssignment}
              savedRefNumber={referenceNumber}
            />
          )}

          {/* Add the Footer component */}
          <Footer />
        </div>
      </div>
    </Background>
  )
}
