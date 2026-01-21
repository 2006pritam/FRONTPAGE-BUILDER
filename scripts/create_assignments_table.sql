-- Create assignments table to store front page data with reference numbers
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  reference_number VARCHAR(20) UNIQUE NOT NULL,
  college_name VARCHAR(255),
  custom_college_name VARCHAR(255),
  department VARCHAR(100),
  custom_department VARCHAR(100),
  full_name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50) NOT NULL,
  registration_number VARCHAR(50) NOT NULL,
  year VARCHAR(10),
  semester VARCHAR(50),
  subject_name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(50) NOT NULL,
  assignment_type VARCHAR(50),
  custom_assignment_type VARCHAR(100),
  font_style VARCHAR(50),
  font_size_college_name VARCHAR(10),
  font_size_department VARCHAR(10),
  font_size_assignment VARCHAR(10),
  font_size_subject VARCHAR(10),
  font_size_details VARCHAR(10),
  orientation VARCHAR(20),
  text_color VARCHAR(10),
  page_color VARCHAR(10),
  show_border BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on reference_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_assignments_reference_number ON assignments(reference_number);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at DESC);
