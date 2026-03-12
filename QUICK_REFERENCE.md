# MediLink Supabase Integration - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Open Supabase
```
https://app.supabase.com → Select project xdwypktkqiqwjmoetgzh
```

### 2. Create Tables
- Go to SQL Editor
- Paste all SQL from SQL_COMMANDS.md
- Execute (Cmd/Ctrl + Enter)

### 3. Create Storage Bucket
- Storage → Create new bucket
- Name: medical-files
- Private bucket

### 4. Test in App
```
Open index.html → Sign up → Login → Use portals
```

---

## 📞 Login Credentials (Examples)

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Patient | patient@test.com | Test123456 | Patient Portal |
| Hospital | hospital@test.com | Test123456 | Hospital Portal |
| Doctor | doctor@test.com | Test123456 | Doctor Portal |

---

## 🔑 Key Functions

### Auth Functions
```javascript
handleLogin(email, password, role)     // Login user
handleSignup(email, password, name, role)  // Register user
logout()                                // Logout user
initAuth()                             // Initialize on page load
```

### File Functions
```javascript
uploadFileToSupabase(file, patientId)  // Upload file to storage
                                       // Returns: public URL
```

### Database Functions
```javascript
saveMedicalReportToDatabase()          // Save medical report
loadPatientDataFromDatabase()          // Get patient reports
saveAppointmentToDatabase()            // Save appointment
loadAppointmentsFromDatabase()         // Get appointments
```

---

## 🗄️ Database Tables

| Table | Purpose | Rows After Setup |
|-------|---------|-------------------|
| profiles | User accounts | 0 (grows with signups) |
| patient_profiles | Patient data | 0 |
| medical_reports | Medical records | 0 |
| appointments | Appointments | 0 |

---

## 📁 Storage Structure

```
medical-files/
└── medical-reports/
    └── {patientId}/
        ├── file1.pdf
        ├── xray1.jpg
        └── report1.doc
```

---

## 🎯 What Each Portal Does

### Patient Portal
```
Login → View Dashboard
       → Upload Medical Records
       → Book Appointment
       → View Health Card
       → Cancel Appointment
```

### Hospital Portal
```
Login → Select Session Type
      → Saved Patients → View Patient Registry
                      → View Doctor Appointments
      → New Patients   → NFC/QR/Manual Entry
                      → Manage Appointments
```

### Doctor Portal
```
Login → Select Your Profile
      → View Dashboard
      → See Your Appointments
      → Confirm/Cancel
      → Add Notes
```

---

## 🔍 Verify Setup

### Test Authentication
1. Open index.html
2. Try Signup with new email
3. Check profiles table has new row
4. Try Login

### Test File Upload
1. Login as Patient
2. Go to Upload Medical Report
3. Upload a file
4. Check storage bucket for file

### Test Database
1. Open Supabase SQL Editor
2. Run: `SELECT * FROM profiles;`
3. Should show your test user

---

## ⚙️ Configuration

### In index.html (Lines 124-125)
```javascript
const SUPABASE_URL = 'https://xdwypktkqiqwjmoetgzh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOi...'; // Already set
```

### In Supabase Dashboard
- Project ID: xdwypktkqiqwjmoetgzh
- Region: [Auto-assigned]
- Plan: [Your plan]

---

## 🆘 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Table does not exist" | Create tables using SQL_COMMANDS.md |
| "Auth failed" | Check email/password, verify profiles table exists |
| "File upload stuck" | Check bucket exists and policies are set |
| "Blank page" | Check browser console (F12) for errors |
| "Session lost on refresh" | Wait for initAuth() to complete |

---

## 📊 File Locations

```
c:\Users\Asus\Desktop\medilink\
├── index.html                    ← Main app (1 file, everything)
├── SUPABASE_SETUP.md            ← Detailed setup guide
├── INTEGRATION_SUMMARY.md       ← Technical overview
├── SQL_COMMANDS.md              ← Database creation SQL
├── SETUP_INSTRUCTIONS.md        ← Step-by-step instructions
└── QUICK_REFERENCE.md           ← This file
```

---

## 🎨 Customization

### Change greeting
Find in index.html:
```javascript
"Your Health, Digitally Secured"  // Line ~580
```

### Change colors
Edit in CSS:
```css
.medical-gradient { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
```

### Change role names
Update in renderLoginPage():
```javascript
<option value="patient">Patient</option>
<option value="hospital">Hospital Staff</option>
<option value="doctor">Doctor</option>
```

---

## 🔐 Security Tips

1. Keep SUPABASE_KEY private
2. Enable RLS on all tables
3. Use strong passwords (8+ chars)
4. Regular backups
5. Monitor access logs

---

## 📈 Next Steps

1. ✅ Setup Supabase (YOU ARE HERE)
2. Create database tables
3. Test authentication
4. Test file uploads
5. Customize for your hospital
6. Add real data
7. Deploy to production

---

## 🆘 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **SQL Help**: https://www.postgresql.org/docs/
- **JavaScript**: https://developer.mozilla.org/
- **Browser Console**: F12 (debug errors)

---

## ✨ Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Ready | Login/Signup implemented |
| Database | ⏳ Pending | SQL commands provided |
| File Storage | ⏳ Pending | Bucket needs to be created |
| Patient Portal | ✅ Ready | Can upload files, book appointments |
| Hospital Portal | ✅ Ready | Can manage appointments |
| Doctor Portal | ✅ Ready | Can view/confirm appointments |
| Email Verification | ⏳ Optional | Can be enabled later |
| Multi-factor Auth | ⏳ Optional | Can be enabled later |

---

## 💡 Pro Tips

1. **Bulk Test User Creation**: Use Supabase API to create test users
2. **Data Export**: Use SQL Editor to export data as CSV
3. **Backup Regularly**: Supabase provides automatic backups
4. **Monitor Usage**: Check dashboard for query performance
5. **Cache Credentials**: Browser stores session automatically
6. **API Testing**: Use Postman to test Supabase APIs

---

**Created**: March 12, 2026
**Version**: 1.0
**Status**: ✅ Ready for Setup
