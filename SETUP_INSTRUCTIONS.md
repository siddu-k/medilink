# MediLink - Complete Setup Instructions

## 🎯 What's Been Done

Your MediLink application now has:
- ✅ Supabase authentication (login/signup)
- ✅ Role-based access control (Patient, Hospital, Doctor)
- ✅ Database integration framework
- ✅ File storage integration
- ✅ Protected routes and sessions

## 📋 Step-by-Step Setup Guide

### Step 1: Access Supabase Dashboard
1. Open: https://app.supabase.com
2. Login with your credentials
3. Select project: **xdwypktkqiqwjmoetgzh**

### Step 2: Create Database Tables
1. Go to **SQL Editor** (Left sidebar)
2. Click **New Query**
3. Copy and paste SQL from `SQL_COMMANDS.md` file
4. Run each command one at a time

**Commands to run (in order):**
1. Create profiles table (Step 1)
2. Create patient_profiles table (Step 2)
3. Create medical_reports table (Step 3)
4. Create appointments table (Step 4)

### Step 3: Create Storage Bucket
1. Go to **Storage** (Left sidebar)
2. Click **Create new bucket**
3. Name: `medical-files`
4. Privacy: Private (for now)
5. Click **Create bucket**
6. Copy and paste storage policies from SQL_COMMANDS.md (Step 6)

### Step 4: Test Authentication
1. Open `index.html` in your browser
2. Click **"Don't have an account? Sign Up"**
3. Fill in test data:
   - Name: Test Patient
   - Email: test@test.com
   - Password: Test123456
   - Role: Patient
4. Click **Create Account**
5. You should see the landing page

### Step 5: Test Patient Portal
1. Click **Patient Portal** button
2. You should see the patient dashboard
3. Try uploading a medical report
4. Verify file appears in Supabase Storage

### Step 6: Enable File Storage (Optional)
If you want public access to files:
1. Go to Storage → medical-files
2. Click Settings (gear icon)
3. Enable SSL certification (if needed)
4. Update policies to allow public read

## 🔐 Testing Different Roles

### Test Patient Access
```
Email: patient@test.com
Password: Patient123456
Role: Patient
```
- Uses Patient Portal
- Can upload medical files
- Can book appointments
- Can view health card

### Test Hospital Access
```
Email: hospital@test.com
Password: Hospital123456
Role: Hospital
```
- Uses Hospital Portal
- Can view patient registry
- Can manage doctor appointments
- Can confirm appointments

### Test Doctor Access
```
Email: doctor@test.com
Password: Doctor123456
Role: Doctor
```
- Uses Doctor Portal
- Can view own appointments
- Can confirm/cancel appointments
- Can add notes

## 📂 File Structure

```
medilink/
├── index.html                 # Main application (all code)
├── SUPABASE_SETUP.md          # Supabase configuration
├── INTEGRATION_SUMMARY.md     # What's been integrated
├── SQL_COMMANDS.md            # Database setup commands
├── SETUP_INSTRUCTIONS.md      # This file
└── newentry.html              # Legacy (can be removed)
```

## 🚨 Important Configuration

The following is already configured in `index.html`:
```javascript
const SUPABASE_URL = 'https://xdwypktkqiqwjmoetgzh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Do NOT share the SUPABASE_KEY publicly in production!**

## 🔧 Troubleshooting

### Login not working
- [ ] Check database tables are created
- [ ] Verify email/password in profiles table
- [ ] Clear browser cache and cookies
- [ ] Check browser console for errors (F12)
- [ ] Verify Supabase Auth is enabled

### File upload not working
- [ ] Check "medical-files" bucket exists
- [ ] Verify storage bucket policies
- [ ] Check file size (max 10MB recommended)
- [ ] Verify bucket is not too full

### Page shows blank/white screen
- [ ] Open browser console (F12)
- [ ] Check for error messages
- [ ] Verify Supabase CDN loaded
- [ ] Try clearing cache and hard refresh (Ctrl+Shift+Delete)

### Tables not appearing in Supabase
- [ ] Check SQL_COMMANDS.md for typos
- [ ] Verify you're in correct project
- [ ] Check if anon key has permissions
- [ ] Try running simpler queries first using SQL Editor

## 📊 Database Verification

To verify everything is set up:

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check profiles exist
SELECT * FROM profiles;

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

## 🎨 Customization Options

### Change app colors
Edit CSS in `<style>` section:
```css
.medical-gradient { /* Change green to blue */
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}
```

### Change app name
Replace "MediLink" with your hospital name in:
- `<title>` tag
- Navigation bar
- Login page

### Add more database fields
1. Modify SQL in SQL_COMMANDS.md
2. Update Supabase functions in index.html
3. Update form fields in HTML

## 🔒 Production Checklist

Before going live, ensure:
- [ ] Change anon key to different one
- [ ] Enable Row Level Security on all tables
- [ ] Set up proper authentication policies
- [ ] Enable HTTPS only
- [ ] Configure email verification
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Add API key restrictions
- [ ] Set up audit logging
- [ ] Test with real data

## 📱 Features Available

### Patient Portal
- Medical records management
- Appointment booking
- Health card with QR code
- File uploads
- Report history

### Hospital Portal
- Patient registry
- Doctor appointment management
- Appointment confirmation
- Staff tools

### Doctor Portal
- Personal appointments
- Appointment confirmation
- Patient notes
- Schedule management

## 💾 Data Backup

Important: Regularly backup your Supabase data!

1. Go to Project Settings → Backups
2. Enable automatic backups
3. Or manually export via SQL Editor

## 🆘 Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **SQL Reference**: https://www.postgresql.org/docs/
- **JavaScript**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **Tailwind CSS**: https://tailwindcss.com/docs

## ✅ Final Checklist

Before declaring setup complete:
- [ ] All SQL commands ran successfully
- [ ] Storage bucket "medical-files" created
- [ ] Can login with test account
- [ ] Can access Patient Portal
- [ ] Can upload medical files
- [ ] Files appear in Supabase Storage
- [ ] Can book appointments
- [ ] Hospital portal works
- [ ] Doctor portal works

---

## 🎉 You're All Set!

Your MediLink application is now ready with:
- Complete authentication system
- Database infrastructure
- File storage
- Role-based access
- All three portals

**Next**: Test all features and customize as needed!

---

**Questions?** Check the documentation files:
- SUPABASE_SETUP.md - Configuration details
- INTEGRATION_SUMMARY.md - Technical overview
- SQL_COMMANDS.md - Database creation commands
