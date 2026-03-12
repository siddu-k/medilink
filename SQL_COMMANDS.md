# MediLink - Supabase SQL Setup

Run these commands in your **Supabase SQL Editor** (Dashboard → SQL Editor → New Query).

---

## Step 1: Create Tables

```sql
-- ============================================
-- 1. PROFILES TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'hospital')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY, -- e.g. ML-2024-001
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    age INTEGER,
    photo TEXT,
    blood_group TEXT,
    phone TEXT,
    email TEXT,
    allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    specialty TEXT,
    hospital TEXT,
    experience TEXT,
    fee TEXT,
    image TEXT,
    slots TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MEDICAL REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_reports (
    id SERIAL PRIMARY KEY,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    hospital TEXT,
    doctor TEXT,
    date DATE,
    status TEXT,
    value TEXT,
    metric TEXT,
    details TEXT,
    file_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    doctor_name TEXT,
    specialization TEXT,
    hospital TEXT,
    appointment_date DATE,
    appointment_time TEXT,
    status TEXT DEFAULT 'Pending',
    hospital_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. DOCTOR-PATIENTS LINK TABLE
-- (When doctor scans NFC and logs in on patient profile,
--  the patient gets linked to that doctor's dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_patients (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    linked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(doctor_id, patient_id)
);
```

---

## Step 2: Create Storage Bucket

```sql
-- Create storage bucket for medical files
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-files', 'medical-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload medical files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'medical-files');

-- Allow anyone to view medical files
CREATE POLICY "Anyone can view medical files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'medical-files');
```

---

## Step 2.5: Enable RLS & Add Policies (REQUIRED)

> **Without these policies, all table queries will return empty results!**

```sql
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES: users can read all profiles, update own
-- ============================================
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- PATIENTS: anyone can read, authenticated can insert/update
-- ============================================
CREATE POLICY "Anyone can read patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert patients" ON patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update patients" ON patients FOR UPDATE TO authenticated USING (true);

-- ============================================
-- DOCTORS: anyone can read, authenticated can insert/update
-- ============================================
CREATE POLICY "Anyone can read doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert doctors" ON doctors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update doctors" ON doctors FOR UPDATE TO authenticated USING (true);

-- ============================================
-- MEDICAL_REPORTS: anyone can read, authenticated can insert
-- ============================================
CREATE POLICY "Anyone can read medical_reports" ON medical_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert medical_reports" ON medical_reports FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- APPOINTMENTS: anyone can read, authenticated can insert/delete
-- ============================================
CREATE POLICY "Anyone can read appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete appointments" ON appointments FOR DELETE TO authenticated USING (true);

-- ============================================
-- DOCTOR_PATIENTS: anyone can read, authenticated can insert
-- ============================================
CREATE POLICY "Anyone can read doctor_patients" ON doctor_patients FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert doctor_patients" ON doctor_patients FOR INSERT TO authenticated WITH CHECK (true);
```

---

## Step 3: Insert Seed Data (Demo Doctors)

```sql
INSERT INTO doctors (name, specialty, hospital, experience, fee, slots) VALUES
('Dr. Ramesh Varma', 'Cardiologist', 'Apollo Hospital', '12 Yrs', '₹800', ARRAY['10:00 AM', '11:30 AM', '04:30 PM', '06:00 PM']),
('Dr. Sarah Khan', 'Dermatologist', 'City Diagnostics', '8 Yrs', '₹600', ARRAY['09:00 AM', '11:00 AM', '02:00 PM', '03:30 PM']),
('Dr. Arun Singh', 'Pediatrician', 'Children''s Clinic', '15 Yrs', '₹500', ARRAY['10:00 AM', '12:00 PM', '05:00 PM']),
('Dr. Ananya Mehta', 'Neurologist', 'Metro Imaging', '10 Yrs', '₹1000', ARRAY['09:30 AM', '01:00 PM', '03:00 PM', '04:30 PM']),
('Dr. Priya Desai', 'Gynecologist', 'City Diagnostics', '9 Yrs', '₹700', ARRAY['10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM']),
('Dr. Vikram Patel', 'Psychiatrist', 'MindCare Center', '20 Yrs', '₹1200', ARRAY['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']),
('Dr. Meera Joshi', 'Endocrinologist', 'Apollo Hospital', '11 Yrs', '₹900', ARRAY['10:30 AM', '12:30 PM', '03:30 PM', '05:00 PM']),
('Dr. Suresh Kumar', 'Orthopedic Surgeon', 'Fortis', '18 Yrs', '₹1500', ARRAY['09:00 AM', '11:30 AM', '02:30 PM', '04:30 PM']),
('Dr. Anjali Rao', 'Gastroenterologist', 'City Diagnostics', '14 Yrs', '₹850', ARRAY['10:00 AM', '01:00 PM', '03:00 PM', '05:30 PM']),
('Dr. Rohit Verma', 'Pulmonologist', 'Metro Imaging', '13 Yrs', '₹950', ARRAY['09:30 AM', '12:00 PM', '02:30 PM', '04:00 PM']);

-- Insert demo patient
INSERT INTO patients (id, name, age, photo, blood_group, phone, email, allergies, chronic_conditions, emergency_contact) VALUES
('ML-2024-001', 'Chalamalasetti Sai Praveen', 19, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 'O+', '91-9876543210', 'chalamalasettisaipraveen07@gmail.com', ARRAY['vomitings', 'High fever'], ARRAY['None'], 'Srinivas Rao (Father) - 91-9876543211'),
('ML-2024-002', 'B Kishan', 24, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 'A-', '91-8888777766', 'kishan@gmail.com', '{}', '{}', NULL),
('ML-2024-003', 'Ajay Kumar B', 25, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 'B+', '91-9988776655', 'ajay.kumar@gmail.com', '{}', '{}', NULL),
('ML-2024-004', 'Suresh Reddy', 30, 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop', 'AB+', '91-9876655443', 'suresh.reddy@gmail.com', '{}', '{}', NULL),
('ML-2024-005', 'Ravi Teja', 28, 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop', 'O-', '91-9123456780', 'ravi.teja@gmail.com', '{}', '{}', NULL);

-- Insert demo reports for first patient
INSERT INTO medical_reports (patient_id, type, hospital, doctor, date, status, value, metric, file_url) VALUES
('ML-2024-001', 'Full Blood Count', 'Apollo Hospital', 'Dr. Ramesh', '2024-02-15', 'Normal', '14.2 g/dL', 'Hemoglobin', 'https://drive.google.com/file/d/1yQ9qkb9f6EKwHZkCr9zCsy_eQZGMFARu/view?usp=drive_link'),
('ML-2024-001', 'Chest X-Ray', 'City Diagnostics', 'Dr. Sarah', '2024-01-10', 'Review', NULL, NULL, 'https://drive.google.com/file/d/1cFJY2TbixUJ4HOy-4tH6NRXlYbAU1wM0/view?usp=drive_link'),
('ML-2024-001', 'Lipid Profile', 'Apollo Hospital', 'Dr. Ramesh', '2023-12-05', 'Normal', '180 mg/dL', 'Total Cholesterol', NULL),
('ML-2024-001', 'ECG', 'Apollo Hospital', 'Dr. Ramesh', '2023-09-30', 'Negative', NULL, NULL, NULL),
('ML-2024-002', 'CT Scan', 'Max Healthcare', 'Dr. Singh', '2024-01-20', 'Critical', 'High', 'CRP', NULL),
('ML-2024-003', 'Blood Test', 'Fortis', 'Dr. Gupta', '2024-03-01', 'Normal', NULL, NULL, NULL);
```

---

## Step 4: Create Profile Trigger (Auto-create profile on signup)

```sql
-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

> **After running all commands above**, your Supabase backend is ready! Go back to the app and start using it.
