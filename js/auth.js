// ===== AUTH UTILITIES =====
// Shared auth functions used across all pages

// Check if user is logged in, redirect to login if not
async function requireAuth(allowedRoles) {
    const sb = await waitForSupabase();
    if (!sb) {
        window.location.href = 'index.html';
        return null;
    }
    try {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return null;
        }
        const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
        if (!profile) {
            await sb.auth.signOut();
            window.location.href = 'index.html';
            return null;
        }
        if (allowedRoles && !allowedRoles.includes(profile.role)) {
            showToast('Access denied for your role', 'error');
            window.location.href = 'index.html';
            return null;
        }
        return { user, profile };
    } catch (e) {
        console.error('Auth check failed:', e);
        window.location.href = 'index.html';
        return null;
    }
}

// Get current user without redirect
async function getCurrentUser() {
    const sb = await waitForSupabase();
    if (!sb) return null;
    try {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return null;
        const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
        return profile ? { user, profile } : null;
    } catch { return null; }
}

// Logout
async function logout() {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    window.location.href = 'index.html';
}

// Login
async function loginUser(email, password) {
    const sb = await waitForSupabase();
    if (!sb) { showToast('Service unavailable, please try again', 'error'); return null; }

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { showToast(error.message, 'error'); return null; }

    const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
    if (!profile) { showToast('Profile not found. Please sign up again.', 'error'); await sb.auth.signOut(); return null; }

    return { user: data.user, profile };
}

// Signup
async function signupUser(email, password, fullName, role) {
    const sb = await waitForSupabase();
    if (!sb) { showToast('Service unavailable, please try again', 'error'); return null; }

    const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, role: role } }
    });
    if (error) { showToast(error.message, 'error'); return null; }

    // Profile is auto-created via DB trigger, but let's also try manual insert as fallback
    try {
        await sb.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, role });
    } catch (e) { console.warn('Profile upsert fallback:', e); }

    return { user: data.user, profile: { role, full_name: fullName, email } };
}

// Redirect based on role
function redirectByRole(role) {
    switch (role) {
        case 'patient': window.location.href = 'patient.html'; break;
        case 'doctor': window.location.href = 'doctor.html'; break;
        case 'hospital': window.location.href = 'hospital.html'; break;
        default: window.location.href = 'index.html';
    }
}

// Render user info in navbar
function renderUserNav(profile, containerId) {
    const el = document.getElementById(containerId);
    if (!el || !profile) return;
    el.style.marginLeft = 'auto';
    el.innerHTML = `
        <div style="display:flex;align-items:center;gap:1rem;">
            <button onclick="logout()" class="btn btn-danger btn-sm" style="gap:.4rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
            </button>
            <div style="display:flex;flex-direction:column;align-items:flex-end;" class="hide-mobile">
                <div style="font-weight:800;font-size:.85rem;color:var(--slate-900)">${profile.full_name || profile.email}</div>
                <div style="font-size:.7rem;color:var(--slate-400);text-transform:capitalize">${profile.role}</div>
            </div>
        </div>
    `;
}
