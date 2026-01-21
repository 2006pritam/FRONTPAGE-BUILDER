"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Mail,
  MessageSquare,
  AlertTriangle,
  Send,
  ThumbsUp,
  Phone,
  HelpCircle,
  User,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CustomLoader, LoaderGroup } from "./custom-loader"
import { Turnstile } from "./turnstile"

// Define conversion types with their API parameters
const conversionTypes = [
  {
    value: "word-to-pdf",
    label: "Word to PDF",
    inputFormat: ".docx,.doc",
    outputFormat: "pdf",
    description: "Convert Microsoft Word documents to PDF format",
  },
  {
    value: "pdf-to-word",
    label: "PDF to Word",
    inputFormat: ".pdf",
    outputFormat: "docx",
    description: "Convert PDF documents to editable Microsoft Word format",
  },
  {
    value: "pptx-to-pdf",
    label: "PowerPoint to PDF",
    inputFormat: ".pptx,.ppt",
    outputFormat: "pdf",
    description: "Convert PowerPoint presentations to PDF format",
  },
  {
    value: "pdf-to-pptx",
    label: "PDF to PowerPoint",
    inputFormat: ".pdf",
    outputFormat: "pptx",
    description: "Convert PDF documents to editable PowerPoint presentations",
  },
  {
    value: "excel-to-pdf",
    label: "Excel to PDF",
    inputFormat: ".xlsx,.xls",
    outputFormat: "pdf",
    description: "Convert Excel spreadsheets to PDF format",
  },
  {
    value: "pdf-to-excel",
    label: "PDF to Excel",
    inputFormat: ".pdf",
    outputFormat: "xlsx",
    description: "Convert PDF documents to editable Excel spreadsheets",
  },
]

// FAQ items
const faqItems = [
  {
    question: "When will the document conversion feature be available?",
    answer:
      "We're currently working on integrating with reliable conversion APIs. The feature is expected to be available within the next few weeks. Please check back soon or leave your email in the feedback form to be notified when it's ready.",
  },
  {
    question: "What file formats will be supported?",
    answer:
      "We plan to support conversion between PDF, Word (DOCX/DOC), PowerPoint (PPTX/PPT), and Excel (XLSX/XLS) formats. Additional formats may be added based on user feedback and demand.",
  },
  {
    question: "Will there be a file size limit?",
    answer:
      "Yes, we plan to support files up to 100MB. For larger files, we recommend splitting them into smaller documents before conversion.",
  },
  {
    question: "Will the conversion service be free?",
    answer:
      "We plan to offer a limited number of free conversions per month. For users with higher volume needs, we'll have affordable subscription options.",
  },
  {
    question: "How can I report issues with converted files?",
    answer:
      "Once the service is live, you'll be able to report issues directly through the feedback form. Our team will review and address any conversion quality issues promptly.",
  },
]

// Contact information
const contactInfo = {
  email: "modakpritam06@gmail.com",
  phone: "+919064662830",
  address: "puratan hat, kalna, west bengal, 713434",
}

// Formbold URL
const FORMBOLD_URL = "https://formbold.com/s/3wGwk"

// Cloudflare Turnstile keys
// Site key is used on the client side
const TURNSTILE_SITE_KEY = "0x4AAAAAABDHQatUwRgkSjd4"
// Secret key: 0x4AAAAAABDHQSl--2hS7AB0VtVV5e3OlZY (used on server side for verification)

export function PdfConverter() {
  const [activeTab, setActiveTab] = useState<string>("convert")
  const [feedbackType, setFeedbackType] = useState<string>("feature-request")
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false)
  const [activeFileInput, setActiveFileInput] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string>("")
  const [turnstileVerified, setTurnstileVerified] = useState<boolean>(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token)
    setTurnstileVerified(true)
    toast({
      title: "Verification successful",
      description: "You have been verified as a human.",
      variant: "default",
    })
  }

  const handleTurnstileError = () => {
    setTurnstileVerified(false)
    toast({
      title: "Verification failed",
      description: "Please try again or contact support if the issue persists.",
      variant: "destructive",
    })
  }

  const handleTurnstileExpire = () => {
    setTurnstileVerified(false)
    toast({
      title: "Verification expired",
      description: "Please complete the verification again.",
      variant: "default",
    })
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!turnstileVerified) {
      toast({
        title: "Verification required",
        description: "Please complete the verification to submit your feedback.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create a hidden input for the turnstile token
      if (formRef.current && turnstileToken) {
        const tokenInput = document.createElement("input")
        tokenInput.type = "hidden"
        tokenInput.name = "cf-turnstile-response"
        tokenInput.value = turnstileToken
        formRef.current.appendChild(tokenInput)

        // Submit the form to Formbold
        formRef.current.submit()
      }

      // Show success message
      setFeedbackSubmitted(true)

      // Reset form
      setName("")
      setEmail("")
      setMessage("")
      setTurnstileToken("")
      setTurnstileVerified(false)

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll get back to you soon.",
      })
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="convert" className="text-sm md:text-base py-2 px-4">
              Document Converter
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-sm md:text-base py-2 px-4">
              Feedback
            </TabsTrigger>
            <TabsTrigger value="support" className="text-sm md:text-base py-2 px-4">
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="convert" className="space-y-6">
            {/* Coming Soon Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
              <div className="mb-4">
                <LoaderGroup />
              </div>
              <h2 className="text-2xl font-bold mb-2">Document Conversion Coming Soon</h2>
              <p className="text-muted-foreground mb-4">
                We're currently working on integrating our document conversion service. This feature will be available
                soon!
              </p>
              <Button onClick={() => setActiveTab("feedback")} variant="outline" className="bg-background">
                <MessageSquare className="mr-2 h-4 w-4" />
                Request Early Access
              </Button>
            </div>

            {/* Conversion Types Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Planned Conversion Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conversionTypes.map((type, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-muted/50 flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {feedbackSubmitted ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <ThumbsUp className="h-12 w-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-green-800 dark:text-green-300">Thank You!</h2>
                <p className="text-green-700 dark:text-green-400 mb-4">
                  Your feedback has been submitted successfully. We appreciate your input!
                </p>
                <Button onClick={() => setFeedbackSubmitted(false)} variant="outline" className="bg-background">
                  Submit Another Response
                </Button>
              </div>
            ) : (
              <div className="bg-background/80 backdrop-blur-sm rounded-lg border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Share Your Feedback
                </h2>
                <p className="text-muted-foreground mb-6">
                  We value your input! Please share your thoughts, suggestions, or request early access to upcoming
                  features.
                </p>

                <form
                  ref={formRef}
                  action={FORMBOLD_URL}
                  method="POST"
                  onSubmit={handleFeedbackSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="feedback-type">Feedback Type</Label>
                    <Select value={feedbackType} onValueChange={setFeedbackType} name="feedback-type">
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature-request">Feature Request</SelectItem>
                        <SelectItem value="bug-report">Bug Report</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="early-access">Request Early Access</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`pl-10 transition-all duration-200 ${
                          activeFileInput === "name" ? "ring-2 ring-primary/20" : ""
                        }`}
                        onFocus={() => setActiveFileInput("name")}
                        onBlur={() => setActiveFileInput(null)}
                        required
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 transition-all duration-200 ${
                          activeFileInput === "email" ? "ring-2 ring-primary/20" : ""
                        }`}
                        onFocus={() => setActiveFileInput("email")}
                        onBlur={() => setActiveFileInput(null)}
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Please share your feedback, suggestions, or request early access..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`transition-all duration-200 ${
                        activeFileInput === "message" ? "ring-2 ring-primary/20" : ""
                      }`}
                      onFocus={() => setActiveFileInput("message")}
                      onBlur={() => setActiveFileInput(null)}
                      rows={5}
                      required
                    />
                  </div>

                  {/* Cloudflare Turnstile */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <Label>Verification</Label>
                    </div>
                    <Turnstile
                      siteKey={TURNSTILE_SITE_KEY}
                      onVerify={handleTurnstileVerify}
                      onError={handleTurnstileError}
                      onExpire={handleTurnstileExpire}
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      This helps us protect our service from spam and abuse.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting || !turnstileVerified}>
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <CustomLoader type="circle" className="mr-2" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                Contact Support
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Email Support</h3>
                        <p className="text-sm text-muted-foreground mb-1">For general inquiries and support:</p>
                        <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Phone Support</h3>
                        <p className="text-sm text-muted-foreground mb-1">Available Monday-Friday, 9am-5pm IST:</p>
                        <a href={`tel:${contactInfo.phone}`} className="text-primary hover:underline">
                          {contactInfo.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Address</h3>
                        <p className="text-sm text-muted-foreground mb-1">Our office location:</p>
                        <p className="text-sm">{contactInfo.address}</p>
                      </div>
                    </div>

                    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertTitle className="text-amber-800 dark:text-amber-300">Response Time</AlertTitle>
                      <AlertDescription className="text-amber-700 dark:text-amber-400">
                        We typically respond to all inquiries within 24-48 hours during business days.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div className="border-t pt-6 mt-2">
                  <h3 className="text-lg font-medium mb-4">Common Support Topics</h3>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="topic-1">
                      <AccordionTrigger>Document Conversion Issues</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground mb-2">
                          If you're experiencing issues with document conversion, please provide the following details:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>Source and target file formats</li>
                          <li>File size</li>
                          <li>Error messages (if any)</li>
                          <li>Screenshots of the issue</li>
                        </ul>
                        <Button
                          onClick={() => setActiveTab("feedback")}
                          variant="link"
                          className="p-0 h-auto mt-2 text-primary"
                        >
                          Submit a bug report
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="topic-2">
                      <AccordionTrigger>Account and Billing</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground mb-2">
                          For account-related issues or billing inquiries, please contact our dedicated support team at:
                        </p>
                        <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline block mb-2">
                          {contactInfo.email}
                        </a>
                        <p className="text-sm text-muted-foreground">
                          Please include your account details and specific questions in your email.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="topic-3">
                      <AccordionTrigger>Feature Requests</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground mb-2">
                          We love hearing your ideas! If you have suggestions for new features or improvements:
                        </p>
                        <Button
                          onClick={() => {
                            setActiveTab("feedback")
                            setFeedbackType("feature-request")
                          }}
                          variant="link"
                          className="p-0 h-auto text-primary"
                        >
                          Submit a feature request
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
