# MediLink - Supabase Setup Guide

## Supabase Project Details
- **Project URL**: https://xdwypktkqiqwjmoetgzh.supabase.co
- **Project ID**: xdwypktkqiqwjmoetgzh
- **Anon Key**: Already configured in index.html

## Database Tables to Create

### 1. `profiles` (Auth User Profiles)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL, -- 'patient', 'hospital', 'doctor'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. `patient_profiles`
```sql
CREATE TABLE patient_profiles (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  blood_group VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  allergies JSONB,
  chronic_conditions JSONB,
  emergency_contact VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. `medical_reports`
```sql
CREATE TABLE medical_reports (
  id BIGSERIAL PRIMARY KEY,
  patient_id VARCHAR(50) REFERENCES patient_profiles(id),
  created_by UUID REFERENCES profiles(id),
  type VARCHAR(255) NOT NULL, -- e.g., "Full Blood Count", "X-Ray"
  hospital VARCHAR(255),
  doctor VARCHAR(255),
  test_date DATE,
  status VARCHAR(50), -- "Normal", "Review", "Critical"
  metric VARCHAR(100),
  value VARCHAR(100),
  details TEXT,
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. `appointments`
```sql
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id VARCHAR(50) REFERENCES patient_profiles(id),
  doctor_id VARCHAR(50),
  doctor_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  hospital VARCHAR(255),
  appointment_date DATE,
  appointment_time VARCHAR(10),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  hospital_confirmed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Storage Buckets to Create

### 1. `medical-files`
- **Type**: Private (enable when needed)
- **Purpose**: Store patient medical reports, X-rays, PDFs
- **File Path Structure**: `medical-reports/{patientId}/{fileName}`

### Bucket Policies
```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload their own files" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'medical-files' AND auth.uid()::text = split_part((storage.foldername(name))[1], '_', 1));

-- Allow public read access
CREATE POLICY "Public can read files" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'medical-files');
```

## Authentication Setup

The app uses Supabase Authentication with email/password. No additional setup needed - the code handles:
- User registration (signup)
- User login
- Profile creation on signup
- Automatic role assignment (patient, hospital, doctor)

## Environment Variables

The following are already configured in `index.html`:
```javascript
const SUPABASE_URL = 'https://xdwypktkqiqwjmoetgzh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Testing Credentials

Create test accounts in Supabase Dashboard:

### Patient Account
- **Email**: patient@test.com
- **Password**: TestPassword123
- **Role**: patient

### Hospital Staff Account
- **Email**: hospital@test.com
- **Password**: TestPassword123
- **Role**: hospital

### Doctor Account
- **Email**: doctor@test.com
- **Password**: TestPassword123
- **Role**: doctor

## Features Integrated

✅ User Registration & Login (all roles)
✅ Profile Management
✅ File Upload to Supabase Storage
✅ Medical Report Storage & Retrieval
✅ Appointment Management (database-backed)
✅ Patient Data Persistence
✅ Role-based Access Control

## API Functions Available

### Authentication
- `handleLogin(email, password, role)`
- `handleSignup(email, password, fullName, role)`
- `logout()`

### File Operations
- `uploadFileToSupabase(file, patientId)` - Upload medical files
- Returns public URL for accessing the file

### Database Operations
- `savePatientProfileToDatabase(patientData)` - Save patient info
- `saveMedicalReportToDatabase(patientId, reportData)` - Save medical report
- `saveAppointmentToDatabase(appointmentData)` - Save appointment
- `loadPatientDataFromDatabase(patientId)` - Load patient reports
- `loadAppointmentsFromDatabase(patientId)` - Load patient appointments

## Next Steps

1. Go to Supabase Dashboard
2. Create the tables using the SQL provided above
3. Create the storage bucket
4. Test registration & login in the app
5. Upload medical files and verify they appear in storage
6. View data in Supabase Dashboard to confirm persistence

## Security Notes

⚠️ The anon key displayed is public by design - it only has read/write access to authenticated users
⚠️ Implement Row Level Security (RLS) policies for production
⚠️ Store sensitive data in profiles table (encrypted if needed)
⚠️ Regularly backup your database
