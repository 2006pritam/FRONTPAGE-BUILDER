import { z } from 'zod'

const phoneNumberPattern = /^\+?[0-9][0-9\s().-]*$/

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(120, 'Name must be 120 characters or fewer'),
  email: z.string().trim().max(254, 'Email must be 254 characters or fewer').email('Enter a valid email address'),
  phoneNumber: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(32, 'Phone number must be 32 characters or fewer')
    .regex(phoneNumberPattern, 'Use a valid phone number format')
    .refine((value) => (value.match(/\d/g) ?? []).length >= 7, 'Phone number must contain at least 7 digits'),
  problemStatement: z
    .string()
    .trim()
    .min(10, 'Describe your issue in at least 10 characters')
    .max(5000, 'Problem statement must be 5,000 characters or fewer'),
  website: z.string().max(200).optional(),
})

export type ContactSubmissionValues = z.infer<typeof contactSubmissionSchema>
