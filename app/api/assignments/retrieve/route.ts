import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceNumber = searchParams.get('ref');

    if (!referenceNumber) {
      return Response.json(
        { success: false, error: 'Reference number required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT * FROM assignments WHERE reference_number = ${referenceNumber.toUpperCase()};
    `;

    if (result.length === 0) {
      return Response.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const assignment = result[0];

    return Response.json({
      success: true,
      data: {
        collegeName: assignment.college_name,
        customCollegeName: assignment.custom_college_name,
        department: assignment.department,
        customDepartment: assignment.custom_department,
        fullName: assignment.full_name,
        rollNumber: assignment.roll_number,
        registrationNumber: assignment.registration_number,
        year: assignment.year,
        semester: assignment.semester,
        subjectName: assignment.subject_name,
        subjectCode: assignment.subject_code,
        assignmentType: assignment.assignment_type,
        customAssignmentType: assignment.custom_assignment_type,
        fontStyle: assignment.font_style,
        fontSize: {
          collegeName: assignment.font_size_college_name,
          department: assignment.font_size_department,
          assignment: assignment.font_size_assignment,
          subject: assignment.font_size_subject,
          details: assignment.font_size_details,
        },
        orientation: assignment.orientation,
        textColor: assignment.text_color,
        pageColor: assignment.page_color,
        showBorder: assignment.show_border,
      },
    });
  } catch (error) {
    console.error('Error retrieving assignment:', error);
    return Response.json(
      { success: false, error: 'Failed to retrieve assignment' },
      { status: 500 }
    );
  }
}
