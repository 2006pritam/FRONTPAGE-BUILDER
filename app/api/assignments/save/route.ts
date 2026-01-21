import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Generate a unique reference number (8 character alphanumeric)
    const referenceNumber = Math.random().toString(36).substring(2, 10).toUpperCase();

    const result = await sql`
      INSERT INTO assignments (
        reference_number,
        college_name,
        custom_college_name,
        department,
        custom_department,
        full_name,
        roll_number,
        registration_number,
        year,
        semester,
        subject_name,
        subject_code,
        assignment_type,
        custom_assignment_type,
        font_style,
        font_size_college_name,
        font_size_department,
        font_size_assignment,
        font_size_subject,
        font_size_details,
        orientation,
        text_color,
        page_color,
        show_border
      ) VALUES (
        ${referenceNumber},
        ${data.collegeName},
        ${data.customCollegeName || null},
        ${data.department},
        ${data.customDepartment || null},
        ${data.fullName},
        ${data.rollNumber},
        ${data.registrationNumber},
        ${data.year},
        ${data.semester},
        ${data.subjectName},
        ${data.subjectCode},
        ${data.assignmentType},
        ${data.customAssignmentType || null},
        ${data.fontStyle},
        ${data.fontSize.collegeName},
        ${data.fontSize.department},
        ${data.fontSize.assignment},
        ${data.fontSize.subject},
        ${data.fontSize.details},
        ${data.orientation},
        ${data.textColor},
        ${data.pageColor},
        ${data.showBorder}
      )
      RETURNING reference_number;
    `;

    return Response.json({
      success: true,
      referenceNumber: result[0].reference_number,
    });
  } catch (error) {
    console.error('Error saving assignment:', error);
    return Response.json(
      { success: false, error: 'Failed to save assignment' },
      { status: 500 }
    );
  }
}
