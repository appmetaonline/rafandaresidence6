// js/settings.js - Modul Pengaturan Sistem, Profil Komplek, Manajemen Admin & Backup/Restore

function switchConfigSubTab(subId) {
    document.querySelectorAll('.cfg-sub-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.cfg-tab-btn').forEach(btn => {
        btn.classList.remove('border-sky-600', 'text-sky-600');
        btn.classList.add('border-transparent', 'text-slate-500');
    });

    const targetContent = document.getElementById('cfgContent-' + subId);
    const targetBtn = document.getElementById('cfgTab-' + subId);

    if (targetContent) targetContent.classList.remove('hidden');
    if (targetBtn) {
        targetBtn.classList.add('border-sky-600', 'text-sky-600');
        targetBtn.classList.remove('border-transparent', 'text-slate-500');
    }

    if (subId === 'supabase' && typeof checkSupabaseStatus === 'function') {
        checkSupabaseStatus(false);
    }
}

function saveComplexProfile(e) {
    e.preventDefault();
    const namaKomplek = document.getElementById('cfgNamaKomplek').value.trim();
    const alamatKomplek = document.getElementById('cfgAlamatKomplek').value.trim();
    const nominalIuranDefault = parseFloat(document.getElementById('cfgNominalIuran').value) || 0;

    systemConfig.namaKomplek = namaKomplek;
    systemConfig.alamatKomplek = alamatKomplek;
    systemConfig.nominalIuranDefault = nominalIuranDefault;

    saveLocalStorageData();
    if (typeof updateAppIdentityUI === 'function') updateAppIdentityUI();
    if (typeof navigateTo === 'function') navigateTo('/dashboard');

    // Tampilkan pop-up dialog dengan format kalimat "data berhasil disimpan"
    showSuccessModal('data berhasil disimpan');
}

function renderAdminUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    if (adminUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400 text-xs">Belum ada akun admin.</td></tr>';
        return;
    }

    tbody.innerHTML = adminUsers.map((a, idx) => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 font-semibold text-slate-800">${a.username}</td>
            <td class="px-4 py-3 text-slate-700">${a.name}</td>
            <td class="px-4 py-3">
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium ${a.role === 'Super Admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
                    ${a.role || 'Admin'}
                </span>
            </td>
            <td class="px-4 py-3 text-center">
                ${a.username === 'admin' ? '<span class="text-[10px] text-slate-400 font-medium">Bawaan Utama</span>' : `
                    <button onclick="deleteAdminUser('${a.username}')" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs cursor-pointer"><i class="fa-solid fa-trash-can"></i> Hapus</button>
                `}
            </td>
        </tr>
    `).join('');
}

function openModalAddAdmin() {
    document.getElementById('formAddAdmin').reset();
    document.getElementById('modalAddAdmin').classList.remove('hidden');
}

function closeModalAddAdmin() {
    document.getElementById('modalAddAdmin').classList.add('hidden');
}

function saveNewAdminUser(e) {
    e.preventDefault();
    const name = document.getElementById('adminNewName').value.trim();
    const username = document.getElementById('adminNewUser').value.trim();
    const password = document.getElementById('adminNewPass').value.trim();
    const role = document.getElementById('adminNewRole').value;

    if (adminUsers.some(a => a.username.toLowerCase() === username.toLowerCase())) {
        showToastNotification('Username sudah digunakan, gunakan username lain.', 'error');
        return;
    }

    adminUsers.push({ username, password, name, role });
    saveLocalStorageData();
    closeModalAddAdmin();
    renderAdminUsersTable();

    // Tampilkan pop-up dialog dengan format kalimat "data berhasil disimpan"
    showSuccessModal('data berhasil disimpan');
}

function deleteAdminUser(username) {
    const target = adminUsers.find(a => a.username === username);
    const nama = target ? `${target.name} (@${username})` : `@${username}`;
    showConfirmationModal({
        title: 'Konfirmasi Hapus Akun Admin',
        message: `Apakah Anda yakin ingin menghapus akun admin ${nama}? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Ya, Hapus Akun',
        cancelText: 'Batal',
        type: 'danger',
        icon: 'fa-solid fa-user-xmark',
        onConfirm: () => {
            adminUsers = adminUsers.filter(a => a.username !== username);
            saveLocalStorageData();
            renderAdminUsersTable();
            showToastNotification(`Akun admin @${username} berhasil dihapus.`, 'success');
        }
    });
}

function changeMyPassword(e) {
    e.preventDefault();
    if (!activeAdminSession) return;

    const oldPass = document.getElementById('passOld').value.trim();
    const newPass = document.getElementById('passNew').value.trim();
    const confirmPass = document.getElementById('passConfirm').value.trim();

    if (oldPass !== activeAdminSession.password) {
        showToastNotification('Kata sandi lama Anda tidak sesuai.', 'error');
        return;
    }

    if (newPass !== confirmPass) {
        showToastNotification('Konfirmasi kata sandi baru tidak cocok.', 'error');
        return;
    }

    const idx = adminUsers.findIndex(a => a.username === activeAdminSession.username);
    if (idx !== -1) {
        adminUsers[idx].password = newPass;
        activeAdminSession.password = newPass;
        sessionStorage.setItem('SIMAK_ACTIVE_ADMIN', JSON.stringify(activeAdminSession));
        saveLocalStorageData();
        document.getElementById('passOld').value = '';
        document.getElementById('passNew').value = '';
        document.getElementById('passConfirm').value = '';
        
        // Tampilkan pop-up dialog dengan format kalimat "data berhasil disimpan"
        showSuccessModal('data berhasil disimpan');
    }
}

function exportSystemData() {
    const fullData = {
        systemConfig,
        adminUsers,
        wargaData,
        iuranData,
        kasData,
        pengumumanData,
        kontakData,
        exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SIMAK_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importSystemData(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.systemConfig) systemConfig = parsed.systemConfig;
            if (parsed.adminUsers) adminUsers = parsed.adminUsers;
            if (parsed.wargaData) wargaData = parsed.wargaData;
            if (parsed.iuranData) iuranData = parsed.iuranData;
            if (parsed.kasData) kasData = parsed.kasData;
            if (parsed.pengumumanData) pengumumanData = parsed.pengumumanData;
            if (parsed.kontakData) kontakData = parsed.kontakData;

            saveLocalStorageData();
            if (typeof updateAppIdentityUI === 'function') updateAppIdentityUI();
            if (typeof updateBlockFilterOptions === 'function') updateBlockFilterOptions();
            if (typeof navigateTo === 'function') navigateTo('/dashboard');
            showSuccessModal('Data sistem berhasil diimpor');
        } catch (err) {
            console.error('JSON Error:', err);
            showToastNotification('Gagal mengimpor file backup: Format tidak valid.', 'error');
        }
    };
    if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0]);
    }
}

function resetSystemToDefault() {
    showConfirmationModal({
        title: 'Konfirmasi Reset Total Data',
        message: 'PERINGATAN: Semua data warga, iuran, kas, kontak, pengumuman, dan admin akan direset ke pengaturan awal pabrik. Tindakan ini tidak dapat dibatalkan. Lanjutkan?',
        confirmText: 'Ya, Reset Semua Data',
        cancelText: 'Batal',
        type: 'danger',
        icon: 'fa-solid fa-triangle-exclamation',
        onConfirm: () => {
            localStorage.clear();
            location.reload();
        }
    });
}
