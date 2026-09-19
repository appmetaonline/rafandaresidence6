// js/auth.js - Modul Otentikasi Login, Logout, Hak Akses & Sesi Admin

function checkAdminSession() {
    try {
        const savedSession = sessionStorage.getItem('SIMAK_ACTIVE_ADMIN');
        if (savedSession) {
            activeAdminSession = JSON.parse(savedSession);
        } else {
            activeAdminSession = null;
        }
    } catch (e) {
        activeAdminSession = null;
    }
    updateRoleUI();
}

function resetLoginForm() {
    const form = document.getElementById('loginForm');
    if (form) form.reset();
    const userInput = document.getElementById('loginUsername');
    const passInput = document.getElementById('loginPassword');
    if (userInput) userInput.value = '';
    if (passInput) passInput.value = '';
    const alertBox = document.getElementById('loginAlert');
    if (alertBox) alertBox.classList.add('hidden');
}

function openLoginModal() {
    resetLoginForm();
    const alertBox = document.getElementById('loginAlert');
    const overlay = document.getElementById('loginModalOverlay');
    if (alertBox) alertBox.classList.add('hidden');
    if (overlay) overlay.classList.remove('hidden');
    // Fokuskan kursor ke input username
    setTimeout(() => {
        const userInput = document.getElementById('loginUsername');
        if (userInput) userInput.focus();
    }, 50);
    // Update URL menjadi /auth saat modal login terbuka
    window.history.pushState({}, "", "/auth");
}

function closeLoginModal() {
    resetLoginForm();
    const overlay = document.getElementById('loginModalOverlay');
    if (overlay) overlay.classList.add('hidden');
    // Kembalikan URL ke dashboard atau halaman aktif sebelumnya
    window.history.pushState({}, "", "/dashboard");
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const userInput = document.getElementById('loginUsername').value.trim();
    const passInput = document.getElementById('loginPassword').value.trim();
    const alertBox = document.getElementById('loginAlert');

    const foundAdmin = adminUsers.find(a => a.username === userInput && a.password === passInput);

    if (foundAdmin) {
        if (alertBox) alertBox.classList.add('hidden');
        activeAdminSession = foundAdmin;
        sessionStorage.setItem('SIMAK_ACTIVE_ADMIN', JSON.stringify(foundAdmin));
        resetLoginForm();
        closeLoginModal();
        updateRoleUI();
        navigateTo('/dashboard');
        showToastNotification(`Selamat datang kembali, ${foundAdmin.name || foundAdmin.username}!`, 'success');
    } else {
        if (alertBox) alertBox.classList.remove('hidden');
        const alertText = document.getElementById('loginAlertText');
        if (alertText) alertText.textContent = 'Username atau password salah!';
        const passEl = document.getElementById('loginPassword');
        if (passEl) {
            passEl.value = '';
            passEl.focus();
        }
    }
}

function handleLogout() {
    sessionStorage.removeItem('SIMAK_ACTIVE_ADMIN');
    activeAdminSession = null;
    resetLoginForm();
    updateRoleUI();
    navigateTo('/dashboard');
    showToastNotification('Anda telah berhasil logout.', 'info');
}

function updateRoleUI() {
    const isLoggedIn = activeAdminSession !== null;
    const topbarAuth = document.getElementById('topbarAuthContainer');

    if (topbarAuth) {
        if (isLoggedIn) {
            topbarAuth.innerHTML = `
                <div class="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-xs font-semibold text-indigo-900 truncate max-w-[100px] sm:max-w-none">${activeAdminSession.name || activeAdminSession.username}</span>
                </div>
                <button onclick="handleLogout()" title="Keluar dari Admin" class="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span class="hidden sm:inline">Logout</span>
                </button>
            `;
        } else {
            topbarAuth.innerHTML = `
                <button onclick="openLoginModal()" class="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-sm shadow-indigo-500/30 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer">
                    <i class="fa-solid fa-user-shield text-xs"></i>
                    <span>Login Admin</span>
                </button>
            `;
        }
    }

    const sidebarAdminName = document.getElementById('sidebarAdminName');
    const sidebarAdminRole = document.getElementById('sidebarAdminRole');
    if (sidebarAdminName && sidebarAdminRole) {
        if (isLoggedIn) {
            sidebarAdminName.textContent = activeAdminSession.name || activeAdminSession.username;
            sidebarAdminRole.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span> Online (${activeAdminSession.role || 'Admin'})`;
        } else {
            sidebarAdminName.textContent = 'Pengunjung Warga';
            sidebarAdminRole.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1"></span> Mode Tamu / Publik`;
        }
    }

    document.querySelectorAll('.admin-only').forEach(el => {
        if (isLoggedIn) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    const activeTab = document.querySelector('.tab-content:not(.hidden)');
    if (activeTab) {
        const tabId = activeTab.id.replace('tab-', '');
        if (tabId === 'warga' && typeof renderWargaTable === 'function') renderWargaTable();
        if (tabId === 'kas' && typeof renderKasTable === 'function') renderKasTable();
        if (tabId === 'pengumuman' && typeof renderPengumumanGrid === 'function') renderPengumumanGrid();
        if (tabId === 'kontak' && typeof renderKontakGrid === 'function') renderKontakGrid();
    }
}
