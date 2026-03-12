# Quick Database Setup - Copy & Paste SQL Commands

## Step 1: Create profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## Step 2: Create patient_profiles table
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

-- Enable RLS
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own data
CREATE POLICY "Patients can view own data" ON patient_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Allow users to update their own data
CREATE POLICY "Patients can update own data" ON patient_profiles
  FOR UPDATE USING (user_id = auth.uid());
```

## Step 3: Create medical_reports table
```sql
CREATE TABLE medical_reports (
  id BIGSERIAL PRIMARY KEY,
  patient_id VARCHAR(50) REFERENCES patient_profiles(id),
  created_by UUID REFERENCES profiles(id),
  type VARCHAR(255) NOT NULL,
  hospital VARCHAR(255),
  doctor VARCHAR(255),
  test_date DATE,
  status VARCHAR(50),
  metric VARCHAR(100),
  value VARCHAR(100),
  details TEXT,
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own reports
CREATE POLICY "Patients can view own reports" ON medical_reports
  FOR SELECT USING (created_by = auth.uid()
    OR patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- Allow users to insert reports
CREATE POLICY "Users can insert reports" ON medical_reports
  FOR INSERT WITH CHECK (created_by = auth.uid());
```

## Step 4: Create appointments table
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
  status VARCHAR(50) DEFAULT 'pending',
  hospital_confirmed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow patients to view their own appointments
CREATE POLICY "Patients can view own appointments" ON appointments
  FOR SELECT USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- Allow users to insert appointments
CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

-- Allow users to update their appointments
CREATE POLICY "Users can update appointments" ON appointments
  FOR UPDATE USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    OR created_at > NOW() - INTERVAL '1 day');
```

## Step 5: Create storage bucket
```sql
-- Login to Supabase Dashboard → Storage → New Bucket
-- Bucket Name: medical-files
-- Make it Private
-- Then add policies below
```

## Step 6: Storage bucket policies
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'medical-files');

-- Allow authenticated users to read files
CREATE POLICY "Users can read files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'medical-files');

-- Allow public to read files (optional)
CREATE POLICY "Public can read files" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'medical-files' AND (storage.foldername(name))[1] != 'private');
```

## How to Run These Commands

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project (xdwypktkqiqwjmoetgzh)
3. Go to SQL Editor (Sidebar → SQL)
4. Click "New Query"
5. Copy and paste each SQL block above (one at a time)
6. Click "Run" (Cmd+Enter or Ctrl+Enter)
7. Wait for confirmation

## Verify Setup

After running all commands, verify with:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check profiles table has correct structure
\d profiles

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

## Test Data

After tables are created, you can add test data:

```sql
-- This will be created automatically by the app on signup
-- But you can manually verify with:

SELECT * FROM profiles;
SELECT * FROM patient_profiles;
SELECT * FROM medical_reports;
SELECT * FROM appointments;
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the CREATE TABLE command first
- Check the table name spelling

### Error: "Permission denied" on INSERT
- Check that RLS policies are correctly created
- Verify user is authenticated
- Check Row Level Security policies

### Files not uploading to storage
- Verify bucket "medical-files" exists
- Check storage policies are created
- Verify bucket is not in private mode (unless policies allow access)

### Auth not working
- Clear browser cache and cookies
- Check anon key in index.html is correct
- Verify email/password auth is enabled in Supabase

---

**Note**: Run commands one by one and wait for success before running the next. If you get errors, check the error message carefully and adjust the SQL if needed.
