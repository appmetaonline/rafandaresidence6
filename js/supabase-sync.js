// js/supabase-sync.js - Integrasi & Sinkronisasi Database Supabase Cloud

let supabaseSyncTimer = null;
let cachedSqlScript = '';

function goToSupabaseTab() {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Silakan login admin untuk mengelola Supabase.', 'info');
        return;
    }
    navigateTo('/config');
    setTimeout(() => {
        if (typeof switchConfigSubTab === 'function') {
            switchConfigSubTab('supabase');
        }
    }, 100);
}

async function checkSupabaseStatus(manual = false) {
    const badge = document.getElementById('supabaseStatusBadge');
    const badgeDot = document.getElementById('supabaseBadgeDot');
    const badgeText = document.getElementById('supabaseBadgeText');
    const miniTag = document.getElementById('cfgSupabaseMiniTag');
    const statusDot = document.getElementById('sbStatusDot');
    const statusState = document.getElementById('sbStatusState');
    const latencyEl = document.getElementById('sbViewLatency');
    const bannerMsg = document.getElementById('sbStatusMessage');
    const banner = document.getElementById('sbStatusBanner');
    const bannerIcon = document.getElementById('sbBannerIcon');
    const sqlPreview = document.getElementById('sqlPreviewCode');

    if (manual) showToastNotification('Memeriksa koneksi Supabase Cloud...', 'info');

    try {
        const res = await fetch('/api/supabase/status');
        const data = await res.json();

        if (data.sqlScript) {
            cachedSqlScript = data.sqlScript;
            if (sqlPreview) sqlPreview.textContent = data.sqlScript;
        }

        const adminBadgeVisibility = 'admin-only ' + (activeAdminSession ? '' : 'hidden ');

        if (data.connected) {
            if (data.tablesReady) {
                if (badge) badge.className = adminBadgeVisibility + 'cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs';
                if (badgeDot) badgeDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
                if (badgeText) badgeText.textContent = 'Terhubung';
                if (miniTag) {
                    miniTag.className = 'ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700';
                    miniTag.textContent = 'Online';
                }
                if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
                if (statusState) {
                    statusState.textContent = 'Tabel Siap & Terhubung';
                    statusState.className = 'text-xs font-bold text-emerald-700';
                }
                if (banner) {
                    banner.className = 'p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 bg-emerald-50 text-emerald-800 border-emerald-200';
                }
                if (bannerIcon) bannerIcon.className = 'fa-solid fa-circle-check text-emerald-600 mt-0.5';
                if (bannerMsg) bannerMsg.textContent = 'Koneksi database Supabase aktif dan tabel telah terkonfigurasi dengan baik. Data otomatis tersinkron.';
                if (manual) showToastNotification('Supabase terhubung dan tabel siap digunakan!', 'success');
            } else {
                if (badge) badge.className = adminBadgeVisibility + 'cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-2xs';
                if (badgeDot) badgeDot.className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
                if (badgeText) badgeText.textContent = 'Perlu Setup SQL';
                if (miniTag) {
                    miniTag.className = 'ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700';
                    miniTag.textContent = 'Setup SQL';
                }
                if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-amber-500';
                if (statusState) {
                    statusState.textContent = 'Perlu Inisialisasi Tabel';
                    statusState.className = 'text-xs font-bold text-amber-700';
                }
                if (banner) {
                    banner.className = 'p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 bg-amber-50 text-amber-800 border-amber-200';
                }
                if (bannerIcon) bannerIcon.className = 'fa-solid fa-triangle-exclamation text-amber-600 mt-0.5';
                if (bannerMsg) bannerMsg.textContent = 'Koneksi ke proyek Supabase berhasil! Namun tabel database belum dibuat. Silakan salin skrip SQL di bawah dan jalankan di SQL Editor Supabase.';
                if (manual) showToastNotification('Koneksi Supabase OK. Silakan jalankan skrip SQL di Supabase.', 'warning');
            }

            if (latencyEl && data.latencyMs) latencyEl.textContent = `(${data.latencyMs} ms)`;
        } else {
            throw new Error(data.error || 'Gagal tersambung ke Supabase');
        }
    } catch (err) {
        console.warn('Error checking Supabase:', err);
        const adminBadgeVisibility = 'admin-only ' + (activeAdminSession ? '' : 'hidden ');
        if (badge) badge.className = adminBadgeVisibility + 'cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-2xs';
        if (badgeDot) badgeDot.className = 'w-2 h-2 rounded-full bg-rose-500';
        if (badgeText) badgeText.textContent = 'Terputus';
        if (miniTag) {
            miniTag.className = 'ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700';
            miniTag.textContent = 'Offline';
        }
        if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-rose-500';
        if (statusState) {
            statusState.textContent = 'Terputus';
            statusState.className = 'text-xs font-bold text-rose-700';
        }
        if (banner) {
            banner.className = 'p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 bg-rose-50 text-rose-800 border-rose-200';
        }
        if (bannerIcon) bannerIcon.className = 'fa-solid fa-triangle-exclamation text-rose-600 mt-0.5';
        if (bannerMsg) bannerMsg.textContent = 'Gagal terhubung ke Supabase: ' + err.message;
        if (manual) showToastNotification('Koneksi Supabase gagal: ' + err.message, 'error');
    }
}

function debouncePushToSupabase() {
    clearTimeout(supabaseSyncTimer);
    const badgeText = document.getElementById('supabaseBadgeText');
    if (badgeText) badgeText.textContent = 'Menyimpan...';

    supabaseSyncTimer = setTimeout(() => {
        pushDataToSupabase(false);
    }, 1200);
}

async function pushDataToSupabase(manual = false) {
    const btn = document.getElementById('btnPushToCloud');
    const badgeText = document.getElementById('supabaseBadgeText');
    const lastSyncEl = document.getElementById('sbLastSyncTime');

    if (manual && btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Mengirim ke Cloud...</span>';
    }

    try {
        const res = await fetch('/api/supabase/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemConfig,
                adminUsers,
                wargaData,
                iuranData,
                kasData,
                pengumumanData,
                kontakData
            })
        });

        const data = await res.json();

        if (data.success) {
            if (badgeText) badgeText.textContent = 'Terhubung';
            const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if (lastSyncEl) lastSyncEl.textContent = `Hari ini, ${nowStr}`;
            if (manual) showToastNotification('Data berhasil disimpan ke Supabase Cloud!', 'success');
        } else {
            if (data.tablesReady === false) {
                if (badgeText) badgeText.textContent = 'Perlu Setup SQL';
                if (manual) showToastNotification(data.message, 'warning');
            } else {
                throw new Error(data.error || data.message || 'Gagal menyimpan data');
            }
        }
    } catch (err) {
        console.warn('Gagal push ke Supabase:', err);
        if (badgeText) badgeText.textContent = 'Gagal Simpan';
        if (manual) showToastNotification('Gagal mengirim ke Supabase: ' + err.message, 'error');
    } finally {
        if (manual && btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i><span>Kirim Semua Data ke Supabase</span>';
        }
    }
}

async function pullDataFromSupabase(manual = false) {
    const btn = document.getElementById('btnPullFromCloud');
    const lastSyncEl = document.getElementById('sbLastSyncTime');

    if (manual && btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Menarik Data...</span>';
    }

    try {
        const res = await fetch('/api/supabase/pull');
        const data = await res.json();

        if (data.success && data.data) {
            const d = data.data;
            let updated = false;

            if (d.config) { systemConfig = d.config; updated = true; }
            if (d.admins && Array.isArray(d.admins)) { adminUsers = d.admins; updated = true; }
            if (d.warga && Array.isArray(d.warga)) { wargaData = d.warga; updated = true; }
            if (d.iuran && typeof d.iuran === 'object') { iuranData = d.iuran; updated = true; }
            if (d.kas && Array.isArray(d.kas)) { kasData = d.kas; updated = true; }
            if (d.pengumuman && Array.isArray(d.pengumuman)) { pengumumanData = d.pengumuman; updated = true; }
            if (d.kontak && Array.isArray(d.kontak)) { kontakData = d.kontak; updated = true; }

            if (updated) {
                saveLocalStorageData(true); // Hindari loop push
                updateAppIdentityUI();
                if (typeof renderDashboard === 'function') renderDashboard();
                if (typeof renderWargaTable === 'function') renderWargaTable();
                if (typeof renderIuranTable === 'function') renderIuranTable();
                if (typeof renderKasTable === 'function') renderKasTable();
                if (typeof renderPengumumanGrid === 'function') renderPengumumanGrid();
                if (typeof renderKontakGrid === 'function') renderKontakGrid();
                if (typeof renderAdminUsersTable === 'function') renderAdminUsersTable();

                const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                if (lastSyncEl) lastSyncEl.textContent = `Hari ini, ${nowStr}`;
                if (manual) showToastNotification('Data berhasil ditarik dari Supabase Cloud!', 'success');
            } else if (manual) {
                showToastNotification('Data di Supabase masih kosong atau identik.', 'info');
            }
        } else if (manual) {
            showToastNotification(data.message || 'Tabel Supabase belum diinisialisasi.', 'warning');
        }
    } catch (err) {
        console.warn('Gagal pull dari Supabase:', err);
        if (manual) showToastNotification('Gagal menarik data dari Supabase: ' + err.message, 'error');
    } finally {
        if (manual && btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i><span>Tarik Data Terbaru dari Supabase</span>';
        }
    }
}

function copySupabaseSqlScript() {
    const sql = cachedSqlScript || (document.getElementById('sqlPreviewCode') ? document.getElementById('sqlPreviewCode').textContent : '');
    if (!sql) {
        showToastNotification('Skrip SQL belum siap untuk disalin.', 'warning');
        return;
    }

    navigator.clipboard.writeText(sql).then(() => {
        const btnText = document.getElementById('btnCopySqlText');
        if (btnText) btnText.textContent = 'Berhasil Disalin!';
        showToastNotification('Skrip SQL berhasil disalin ke clipboard!', 'success');
        setTimeout(() => {
            if (btnText) btnText.textContent = 'Salin Skrip SQL';
        }, 2500);
    }).catch(() => {
        showToastNotification('Gagal menyalin, silakan blok teks secara manual.', 'error');
    });
}

async function initSupabaseSync() {
    await checkSupabaseStatus(false);
    // Tarik data cloud jika ada
    pullDataFromSupabase(false);
}
