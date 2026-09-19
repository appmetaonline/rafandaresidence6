// js/router.js - Sistem Router & Navigasi URL (HTML5 History API)

function updateAppIdentityUI() {
    try {
        const sidebarTitle = document.getElementById('sidebarAppTitle');
        const sidebarSub = document.getElementById('sidebarAppSub');
        const badgeNominal = document.getElementById('nominalIuranBadge');
        const cfgNama = document.getElementById('cfgNamaKomplek');
        const cfgAlamat = document.getElementById('cfgAlamatKomplek');
        const cfgNominal = document.getElementById('cfgNominalIuran');

        if (sidebarTitle) sidebarTitle.textContent = systemConfig.namaKomplek || "SIMAK";
        if (sidebarSub) sidebarSub.textContent = systemConfig.alamatKomplek || "Manajemen Komplek";
        if (badgeNominal) badgeNominal.textContent = `Rp ${Number(systemConfig.nominalIuranDefault || 20000).toLocaleString('id-ID')}`;
        
        if (cfgNama) cfgNama.value = systemConfig.namaKomplek || '';
        if (cfgAlamat) cfgAlamat.value = systemConfig.alamatKomplek || '';
        if (cfgNominal) cfgNominal.value = systemConfig.nominalIuranDefault || 20000;
    } catch(e) {
        console.error("Error updating identity UI:", e);
    }
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('mainSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (backdrop) backdrop.classList.toggle('hidden');
}

function navigateTo(path) {
    // Ubah URL di browser tanpa reload halaman (misal: /warga, /kas, /auth, dll)
    window.history.pushState({}, "", path);
    handleRouting();
}

function handleRouting() {
    let path = window.location.pathname;
    
    // Fallback jika dibuka dari file lokal (file://) atau root kosong
    if (!path || path === "/" || path.endsWith("index.html") || path === "") {
        path = "/dashboard";
    }

    // Normalisasi path agar mencocokkan tab
    if (path.startsWith("/")) {
        path = path.substring(1);
    }

    // Menangani Route /auth untuk membuka Modal Login secara otomatis lewat URL
    if (path === "auth") {
        if (typeof openLoginModal === 'function') openLoginModal();
        // Arahkan kembali tab aktif ke dashboard di latar belakang
        switchTabWithoutPush('dashboard');
        return;
    }

    // Pemetaan route ke tab aplikasi
    const validTabs = ['dashboard', 'warga', 'iuran', 'kas', 'pengumuman', 'kontak', 'config'];
    if (validTabs.includes(path)) {
        switchTabWithoutPush(path);
    } else {
        // Jika URL tidak dikenali, redirect ke /dashboard
        navigateTo('/dashboard');
    }
}

// Event listener ketika tombol Back / Forward di browser diklik
window.onpopstate = function() {
    handleRouting();
};

// Fungsi internal untuk mengganti tampilan tab tanpa mengubah URL pushState (digunakan oleh router)
function switchTabWithoutPush(tabId) {
    try {
        if (tabId === 'config' && activeAdminSession === null) {
            if (typeof openLoginModal === 'function') openLoginModal();
            return;
        }

        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('bg-slate-800', 'text-white', 'font-semibold');
            btn.classList.add('text-slate-300');
        });

        const activeSection = document.getElementById('tab-' + tabId);
        const activeBtn = document.getElementById('nav-' + tabId);

        if (activeSection) activeSection.classList.remove('hidden');
        if (activeBtn) {
            activeBtn.classList.add('bg-slate-800', 'text-white', 'font-semibold');
            activeBtn.classList.remove('text-slate-300');
        }

        const titleMap = {
            'dashboard': 'Dashboard',
            'warga': 'Data Warga',
            'iuran': 'Ceklis Pembayaran Iuran Kas Bulanan',
            'kas': 'Pencatatan Pemasukan & Pengeluaran Kas',
            'pengumuman': 'Papan Pengumuman Komplek',
            'kontak': 'Kontak Darurat',
            'config': 'Konfigurasi & Pengaturan Admin'
        };
        const pTitle = document.getElementById('pageTitle');
        if (pTitle) pTitle.textContent = titleMap[tabId] || 'SIMAK';

        const sidebar = document.getElementById('mainSidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 768) {
            toggleMobileMenu();
        }

        if (tabId === 'dashboard') try { if (typeof renderDashboard === 'function') renderDashboard(); } catch(e){ console.error(e); }
        if (tabId === 'warga') try { if (typeof renderWargaTable === 'function') renderWargaTable(); } catch(e){ console.error(e); }
        if (tabId === 'iuran') try { if (typeof renderIuranTable === 'function') renderIuranTable(); } catch(e){ console.error(e); }
        if (tabId === 'kas') try { if (typeof renderKasTable === 'function') renderKasTable(); } catch(e){ console.error(e); }
        if (tabId === 'pengumuman') try { if (typeof renderPengumumanGrid === 'function') renderPengumumanGrid(); } catch(e){ console.error(e); }
        if (tabId === 'kontak') try { if (typeof renderKontakGrid === 'function') renderKontakGrid(); } catch(e){ console.error(e); }
        if (tabId === 'config') {
            try {
                if (typeof switchConfigSubTab === 'function') switchConfigSubTab('profile');
                if (typeof renderAdminUsersTable === 'function') renderAdminUsersTable();
            } catch(e){ console.error(e); }
        }
    } catch (err) {
        console.error("Error during switchTab:", err);
    }
}
