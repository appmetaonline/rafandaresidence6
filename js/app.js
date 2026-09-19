// js/app.js - Inisialisasi Aplikasi SIMAK & Global Event Handlers

function onGlobalYearChange(year) {
    currentActiveYear = parseInt(year, 10);
    currentWargaPage = 1;
    currentIuranPage = 1;
    currentKasPage = 1;
    const badge = document.getElementById('headerYearBadge');
    const mDesc = document.getElementById('dashMasukDesc');
    const kDesc = document.getElementById('dashKeluarDesc');

    if (badge) badge.textContent = 'Tahun ' + currentActiveYear;
    if (mDesc) mDesc.textContent = 'Tahun ' + currentActiveYear;
    if (kDesc) kDesc.textContent = 'Tahun ' + currentActiveYear;

    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderIuranTable === 'function') renderIuranTable();
    if (typeof renderKasTable === 'function') renderKasTable();
}

window.onload = function() {
    // 1. Muat data dari localStorage jika ada
    if (typeof loadLocalStorageData === 'function') {
        loadLocalStorageData();
    }

    // 2. Set default tanggal untuk form input
    const today = new Date().toISOString().split('T')[0];
    const kasTgl = document.getElementById('kasTanggal');
    const pengTgl = document.getElementById('pengTanggal');
    if (kasTgl) kasTgl.value = today;
    if (pengTgl) pengTgl.value = today;

    // 3. Cek sesi login admin
    if (typeof checkAdminSession === 'function') {
        checkAdminSession();
    }

    // 4. Update UI Identitas Komplek & Pilihan Filter Blok A-F
    if (typeof updateAppIdentityUI === 'function') {
        updateAppIdentityUI();
    }
    if (typeof updateBlockFilterOptions === 'function') {
        updateBlockFilterOptions();
    }

    // 5. Jalankan routing URL
    if (typeof handleRouting === 'function') {
        handleRouting();
    }

    // 6. Inisialisasi sinkronisasi data Supabase Cloud
    if (typeof initSupabaseSync === 'function') {
        initSupabaseSync();
    }
};
