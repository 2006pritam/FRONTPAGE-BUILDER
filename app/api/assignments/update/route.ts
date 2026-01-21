import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { referenceNumber, data } = body

    if (!referenceNumber || !data) {
      return Response.json(
        { success: false, error: "Reference number and data are required" },
        { status: 400 }
      )
    }

    // Update the assignment in the database
    const result = await sql`UPDATE assignments 
       SET 
         college_name = ${data.collegeName},
         custom_college_name = ${data.customCollegeName || null},
         department = ${data.department},
         custom_department = ${data.customDepartment || null},
         full_name = ${data.fullName},
         roll_number = ${data.rollNumber},
         registration_number = ${data.registrationNumber},
         year = ${data.year},
         semester = ${data.semester},
         subject_name = ${data.subjectName},
         subject_code = ${data.subjectCode},
         assignment_type = ${data.assignmentType},
         custom_assignment_type = ${data.customAssignmentType || null},
         font_style = ${data.fontStyle},
         font_size_college_name = ${data.fontSize.collegeName},
         font_size_department = ${data.fontSize.department},
         font_size_assignment = ${data.fontSize.assignment},
         font_size_subject = ${data.fontSize.subject},
         font_size_details = ${data.fontSize.details},
         orientation = ${data.orientation},
         text_color = ${data.textColor},
         page_color = ${data.pageColor},
         show_border = ${data.showBorder},
         updated_at = NOW()
       WHERE reference_number = ${referenceNumber}
       RETURNING reference_number`

    if (result.length === 0) {
      return Response.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      referenceNumber: result[0].reference_number,
    })
  } catch (error) {
    console.error("Error updating assignment:", error)
    return Response.json(
      { success: false, error: "Failed to update assignment" },
      { status: 500 }
    )
  }
}
