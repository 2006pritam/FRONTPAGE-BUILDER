import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { contactSubmissionSchema } from '@/lib/contact-schema'

const sql = neon(process.env.DATABASE_URL!)
const maxRequestSize = 16_384

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ success: false, error: 'Expected a JSON request.' }, { status: 415 })
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength !== null) {
    const requestSize = Number(contentLength)
    if (!Number.isFinite(requestSize) || requestSize > maxRequestSize) {
      return NextResponse.json({ success: false, error: 'The message is too large.' }, { status: 413 })
    }
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = contactSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Please review the form fields.' }, { status: 400 })
  }

  const { name, email, phoneNumber, problemStatement, website } = parsed.data
  if (website?.trim()) {
    return NextResponse.json({ success: true })
  }

  try {
    await sql`
      INSERT INTO public.contact_submissions (name, email, phone_number, problem_statement)
      VALUES (${name}, ${email}, ${phoneNumber}, ${problemStatement})
    `

    return NextResponse.json({ success: true })
  } catch {
    console.error('[contact] Failed to save feedback submission.')
    return NextResponse.json(
      { success: false, error: 'Unable to send feedback right now. Please try again.' },
      { status: 500 },
    )
  }
}
