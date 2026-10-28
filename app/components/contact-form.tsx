'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Check, ChevronRight } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { contactSubmissionSchema, type ContactSubmissionValues } from '@/lib/contact-schema'

interface ContactFormProps {
  onBack: () => void
}

export function ContactForm({ onBack }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<ContactSubmissionValues>({
    resolver: zodResolver(contactSubmissionSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      problemStatement: '',
      website: '',
    },
  })

  async function onSubmit(values: ContactSubmissionValues) {
    setIsLoading(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await response.json()) as { success?: boolean; error?: string }

      if (!response.ok || !data.success) {
        setSubmitStatus('error')
        setErrorMessage(data.error || 'Unable to send feedback right now. Please try again.')
        return
      }

      form.reset()
      setSubmitStatus('success')
    } catch {
      setSubmitStatus('error')
      setErrorMessage('Unable to send feedback right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-background/95 shadow-lg border-t-4 border-t-primary max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Contact &amp; Feedback</CardTitle>
              <CardDescription>
                Tell us what&apos;s going on. We&apos;ll use your details only to reply; please don&apos;t include passwords or other sensitive information.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onBack} className="group bg-transparent">
              <span>Back to Home</span>
              <ChevronRight className="ml-1 h-4 w-4 group-hover:-rotate-45 transition-transform" aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {submitStatus === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-12 text-center"
              role="status"
              aria-live="polite"
            >
              <div className="rounded-full bg-primary/10 p-4">
                <Check className="size-8 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold">Message received</h3>
              <p className="max-w-sm text-muted-foreground">
                Your feedback has been saved. We&apos;ll follow up using the contact details you provided.
              </p>
            </motion.div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex flex-col gap-6" noValidate>
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="website">Leave this field blank</label>
                  <Input id="website" tabIndex={-1} autoComplete="off" {...form.register('website')} />
                </div>

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  </motion.div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="name"
                            maxLength={120}
                            placeholder="Your name"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>The name you&apos;d like us to use when replying.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="email"
                            maxLength={254}
                            placeholder="you@example.com"
                            type="email"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>We&apos;ll use this address to reply.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="tel"
                            inputMode="tel"
                            maxLength={32}
                            placeholder="+1 555 123 4567"
                            type="tel"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Include a country code if needed.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="problemStatement"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Problem statement</FormLabel>
                        <FormControl>
                          <Textarea
                            maxLength={5000}
                            placeholder="Describe your issue, feedback, or suggestion..."
                            rows={6}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Share enough detail for us to understand how we can help.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto sm:self-end">
                  {isLoading ? 'Sending…' : 'Send Feedback'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
