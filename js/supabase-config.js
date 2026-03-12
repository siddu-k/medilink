// ===== SUPABASE CONFIGURATION =====
const SUPABASE_URL = 'https://xcimfxzisamrdseqcmik.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaW1meHppc2FtcmRzZXFjbWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDA0NDIsImV4cCI6MjA4ODg3NjQ0Mn0.XniwjNMGCEocM83wuYnY5snmG4ssIOndmT_v_kvZLGE';

let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabaseClient;
}

// Wait for Supabase SDK to load
async function waitForSupabase(maxRetries = 20) {
    let retries = 0;
    while (!getSupabase() && retries < maxRetries) {
        await new Promise(r => setTimeout(r, 150));
        retries++;
    }
    return getSupabase();
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const existing = document.querySelectorAll('.toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all .3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== DATABASE HELPERS =====

// Fetch all patients from DB, with local fallback
async function fetchPatients() {
    const sb = getSupabase();
    if (!sb) return getFallbackPatients();
    try {
        const { data, error } = await sb.from('patients').select('*');
        if (error || !data || data.length === 0) return getFallbackPatients();
        return data;
    } catch { return getFallbackPatients(); }
}

// Fetch single patient
async function fetchPatient(patientId) {
    const sb = getSupabase();
    if (!sb) return getFallbackPatients().find(p => p.id === patientId);
    try {
        const { data, error } = await sb.from('patients').select('*').eq('id', patientId).single();
        if (error || !data) return getFallbackPatients().find(p => p.id === patientId);
        return data;
    } catch { return getFallbackPatients().find(p => p.id === patientId); }
}

// Fetch reports for a patient
async function fetchReports(patientId) {
    const sb = getSupabase();
    if (!sb) return getFallbackReports(patientId);
    try {
        const { data, error } = await sb.from('medical_reports').select('*').eq('patient_id', patientId).order('date', { ascending: false });
        if (error || !data || data.length === 0) return getFallbackReports(patientId);
        return data;
    } catch { return getFallbackReports(patientId); }
}

// Fetch all doctors
async function fetchDoctors() {
    const sb = getSupabase();
    if (!sb) return getFallbackDoctors();
    try {
        const { data, error } = await sb.from('doctors').select('*');
        if (error || !data || data.length === 0) return getFallbackDoctors();
        return data;
    } catch { return getFallbackDoctors(); }
}

// Fetch appointments for patient
async function fetchAppointments(patientId) {
    const sb = getSupabase();
    if (!sb) return [];
    try {
        const { data, error } = await sb.from('appointments').select('*').eq('patient_id', patientId).order('appointment_date', { ascending: true });
        return error ? [] : (data || []);
    } catch { return []; }
}

// Fetch doctor's linked patients
async function fetchDoctorPatients(doctorId) {
    const sb = getSupabase();
    if (!sb) return [];
    try {
        const { data, error } = await sb.from('doctor_patients').select('*, patients(*)').eq('doctor_id', doctorId);
        return error ? [] : (data || []);
    } catch { return []; }
}

// Link patient to doctor
async function linkPatientToDoctor(doctorId, patientId) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
        const { error } = await sb.from('doctor_patients').upsert({ doctor_id: doctorId, patient_id: patientId }, { onConflict: 'doctor_id,patient_id' });
        return !error;
    } catch { return false; }
}

// Upload file to Supabase storage
async function uploadMedicalFile(file, patientId) {
    const sb = getSupabase();
    if (!sb || !file) return null;
    try {
        const ext = file.name.split('.').pop();
        const path = `medical-reports/${patientId}/${Date.now()}.${ext}`;
        const { data, error } = await sb.storage.from('medical-files').upload(path, file);
        if (error) { console.error('Upload error:', error); return null; }
        const { data: { publicUrl } } = sb.storage.from('medical-files').getPublicUrl(path);
        return publicUrl;
    } catch (e) { console.error('Upload error:', e); return null; }
}

// Save medical report
async function saveReport(patientId, report) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
        const { error } = await sb.from('medical_reports').insert({ patient_id: patientId, ...report });
        return !error;
    } catch { return false; }
}

// Save appointment
async function saveAppointment(appt) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
        const { error } = await sb.from('appointments').insert(appt);
        return !error;
    } catch { return false; }
}

// Delete appointment
async function deleteAppointment(id) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
        const { error } = await sb.from('appointments').delete().eq('id', id);
        return !error;
    } catch { return false; }
}

// Find doctor by user_id
async function findDoctorByUserId(userId) {
    const sb = getSupabase();
    if (!sb) return null;
    try {
        const { data, error } = await sb.from('doctors').select('*').eq('user_id', userId).single();
        return error ? null : data;
    } catch { return null; }
}

// Find patient by user_id
async function findPatientByUserId(userId) {
    const sb = getSupabase();
    if (!sb) return null;
    try {
        const { data, error } = await sb.from('patients').select('*').eq('user_id', userId).single();
        return error ? null : data;
    } catch { return null; }
}

// Generate next patient ID (ML-YYYY-NNN)
async function generatePatientId() {
    const sb = getSupabase();
    const year = new Date().getFullYear();
    const prefix = `ML-${year}-`;
    if (sb) {
        try {
            const { data } = await sb.from('patients').select('id').like('id', `${prefix}%`).order('id', { ascending: false }).limit(1);
            if (data && data.length > 0) {
                const lastNum = parseInt(data[0].id.split('-').pop(), 10);
                return prefix + String(lastNum + 1).padStart(3, '0');
            }
        } catch {}
    }
    return prefix + String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
}

// Create patient record in DB
async function createPatientRecord(userId, profile) {
    const sb = getSupabase();
    if (!sb) return null;
    const id = await generatePatientId();
    try {
        const { data, error } = await sb.from('patients').insert({
            id,
            user_id: userId,
            name: profile.full_name,
            email: profile.email,
            photo: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.full_name) + '&background=059669&color=fff'
        }).select().single();
        return error ? null : data;
    } catch { return null; }
}

// Upload profile photo to Supabase storage and update record
async function uploadProfilePhoto(file, recordId, table) {
    const sb = getSupabase();
    if (!sb || !file) return null;
    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { showToast('Only JPG, PNG, WEBP allowed', 'error'); return null; }
    if (file.size > 5 * 1024 * 1024) { showToast('Max file size is 5MB', 'error'); return null; }
    try {
        const ext = file.name.split('.').pop();
        const path = `profile-photos/${table}/${recordId}.${ext}`;
        // Remove old photo if exists (overwrite)
        await sb.storage.from('medical-files').remove([path]);
        const { error: upErr } = await sb.storage.from('medical-files').upload(path, file, { upsert: true });
        if (upErr) { console.error('Photo upload error:', upErr); return null; }
        const { data: { publicUrl } } = sb.storage.from('medical-files').getPublicUrl(path);
        // Add cache-bust to avoid stale images
        const freshUrl = publicUrl + '?t=' + Date.now();
        // Update the record's photo column
        const photoCol = table === 'doctors' ? 'image' : 'photo';
        await sb.from(table).update({ [photoCol]: freshUrl }).eq('id', recordId);
        return freshUrl;
    } catch (e) { console.error('Photo upload error:', e); return null; }
}

// ===== FALLBACK DATA (used when Supabase isn't set up yet) =====
function getFallbackPatients() {
    return [
        { id: "ML-2024-001", name: "Chalamalasetti Sai Praveen", age: 19, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", blood_group: "O+", phone: "91-9876543210", email: "chalamalasettisaipraveen07@gmail.com", allergies: ["vomitings", "High fever"], chronic_conditions: ["None"], emergency_contact: "Srinivas Rao (Father) - 91-9876543211" },
        { id: "ML-2024-002", name: "B Kishan", age: 24, photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", blood_group: "A-", phone: "91-8888777766", email: "kishan@gmail.com" },
        { id: "ML-2024-003", name: "Ajay Kumar B", age: 25, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", blood_group: "B+", phone: "91-9988776655", email: "ajay.kumar@gmail.com" },
        { id: "ML-2024-004", name: "Suresh Reddy", age: 30, photo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop", blood_group: "AB+", phone: "91-9876655443", email: "suresh.reddy@gmail.com" },
        { id: "ML-2024-005", name: "Ravi Teja", age: 28, photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop", blood_group: "O-", phone: "91-9123456780", email: "ravi.teja@gmail.com" },
    ];
}

function getFallbackReports(patientId) {
    if (patientId !== 'ML-2024-001') return [{ id: 1, type: 'Blood Test', hospital: 'City Hospital', doctor: 'Dr. Singh', date: '2024-01-20', status: 'Normal', patient_id: patientId }];
    return [
        { id: 1, type: "Full Blood Count", hospital: "Apollo Hospital", doctor: "Dr. Ramesh", date: "2024-02-15", status: "Normal", value: "14.2 g/dL", metric: "Hemoglobin", file_url: "https://drive.google.com/file/d/1yQ9qkb9f6EKwHZkCr9zCsy_eQZGMFARu/view", patient_id: "ML-2024-001" },
        { id: 2, type: "Chest X-Ray", hospital: "City Diagnostics", doctor: "Dr. Sarah", date: "2024-01-10", status: "Review", file_url: "https://drive.google.com/file/d/1cFJY2TbixUJ4HOy-4tH6NRXlYbAU1wM0/view", patient_id: "ML-2024-001" },
        { id: 3, type: "Lipid Profile", hospital: "Apollo Hospital", doctor: "Dr. Ramesh", date: "2023-12-05", status: "Normal", value: "180 mg/dL", metric: "Total Cholesterol", patient_id: "ML-2024-001" },
        { id: 4, type: "ECG", hospital: "Apollo Hospital", doctor: "Dr. Ramesh", date: "2023-09-30", status: "Negative", patient_id: "ML-2024-001" },
        { id: 5, type: "Blood Sugar Test", hospital: "City Diagnostics", doctor: "Dr. Sarah", date: "2023-08-25", status: "Normal", value: "90 mg/dL", metric: "Fasting Blood Sugar", patient_id: "ML-2024-001" },
    ];
}

function getFallbackDoctors() {
    return [
        { id: 1, name: "Dr. Ramesh Varma", specialty: "Cardiologist", hospital: "Apollo Hospital", experience: "12 Yrs", fee: "₹800", slots: ["10:00 AM", "11:30 AM", "04:30 PM", "06:00 PM"] },
        { id: 2, name: "Dr. Sarah Khan", specialty: "Dermatologist", hospital: "City Diagnostics", experience: "8 Yrs", fee: "₹600", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "03:30 PM"] },
        { id: 3, name: "Dr. Arun Singh", specialty: "Pediatrician", hospital: "Children's Clinic", experience: "15 Yrs", fee: "₹500", slots: ["10:00 AM", "12:00 PM", "05:00 PM"] },
        { id: 4, name: "Dr. Ananya Mehta", specialty: "Neurologist", hospital: "Metro Imaging", experience: "10 Yrs", fee: "₹1000", slots: ["09:30 AM", "01:00 PM", "03:00 PM", "04:30 PM"] },
        { id: 5, name: "Dr. Priya Desai", specialty: "Gynecologist", hospital: "City Diagnostics", experience: "9 Yrs", fee: "₹700", slots: ["10:00 AM", "11:30 AM", "01:30 PM", "03:00 PM"] },
        { id: 6, name: "Dr. Vikram Patel", specialty: "Psychiatrist", hospital: "MindCare Center", experience: "20 Yrs", fee: "₹1200", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
        { id: 7, name: "Dr. Meera Joshi", specialty: "Endocrinologist", hospital: "Apollo Hospital", experience: "11 Yrs", fee: "₹900", slots: ["10:30 AM", "12:30 PM", "03:30 PM", "05:00 PM"] },
        { id: 8, name: "Dr. Suresh Kumar", specialty: "Orthopedic Surgeon", hospital: "Fortis", experience: "18 Yrs", fee: "₹1500", slots: ["09:00 AM", "11:30 AM", "02:30 PM", "04:30 PM"] },
    ];
}
