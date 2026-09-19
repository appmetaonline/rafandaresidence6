// js/pengumuman.js - Modul Pengumuman Komplek (Daftar Pengumuman, Tambah, Edit, Hapus)

function renderPengumumanGrid() {
    const grid = document.getElementById('pengumumanGrid');
    if (!grid) return;

    if (pengumumanData.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400 text-sm">Belum ada pengumuman yang diterbitkan.</div>';
        return;
    }

    const isLoggedIn = activeAdminSession !== null;
    grid.innerHTML = pengumumanData.map(p => `
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">${p.kategori}</span>
                    <span class="text-xs text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${p.tanggal}</span>
                </div>
                <h4 class="font-bold text-slate-800 text-base leading-snug">${p.judul}</h4>
                <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">${p.isi}</p>
            </div>
            ${isLoggedIn ? `
            <div class="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2 admin-only">
                <button onclick="editPengumuman('${p.id}')" class="text-xs text-indigo-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"><i class="fa-solid fa-pen mr-1"></i> Edit</button>
                <button onclick="deletePengumuman('${p.id}')" class="text-xs text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"><i class="fa-solid fa-trash mr-1"></i> Hapus</button>
            </div>
            ` : ''}
        </div>
    `).join('');
}

function openModalPengumuman(id = null) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Fitur tambah/edit pengumuman hanya dapat diakses oleh user admin.', 'warning');
        return;
    }

    document.getElementById('formPengumuman').reset();
    document.getElementById('pengumumanId').value = '';
    document.getElementById('modalPengumumanTitle').textContent = id ? 'Edit Pengumuman' : 'Buat Pengumuman Baru';
    document.getElementById('pengTanggal').value = new Date().toISOString().split('T')[0];

    if (id) {
        const p = pengumumanData.find(item => item.id === id);
        if (p) {
            document.getElementById('pengumumanId').value = p.id;
            document.getElementById('pengJudul').value = p.judul;
            document.getElementById('pengKategori').value = p.kategori;
            document.getElementById('pengTanggal').value = p.tanggal;
            document.getElementById('pengIsi').value = p.isi;
        }
    }
    document.getElementById('modalPengumuman').classList.remove('hidden');
}

function closeModalPengumuman() { 
    const modal = document.getElementById('modalPengumuman');
    if (modal) modal.classList.add('hidden'); 
}

function savePengumuman(e) {
    e.preventDefault();
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Aksi ditolak: Hanya user admin yang dapat menyimpan pengumuman.', 'error');
        return;
    }

    const id = document.getElementById('pengumumanId').value;
    const judul = document.getElementById('pengJudul').value.trim();
    const kategori = document.getElementById('pengKategori').value;
    const tanggal = document.getElementById('pengTanggal').value;
    const isi = document.getElementById('pengIsi').value.trim();

    if (!judul || !isi) {
        showToastNotification('Harap lengkapi judul dan isi pengumuman.', 'warning');
        return;
    }

    if (id) {
        const index = pengumumanData.findIndex(p => p.id === id);
        if (index !== -1) pengumumanData[index] = { id, judul, kategori, tanggal, isi };
    } else {
        const newId = 'P-' + Date.now();
        pengumumanData.unshift({ id: newId, judul, kategori, tanggal, isi });
    }

    closeModalPengumuman();
    saveLocalStorageData();
    renderPengumumanGrid();
    if (typeof renderDashboard === 'function') renderDashboard();

    // Tampilkan pop-up dialog dengan format kalimat "data berhasil disimpan"
    showSuccessModal('data berhasil disimpan');
}

function editPengumuman(id) { 
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat mengedit pengumuman.', 'warning');
        return;
    }
    openModalPengumuman(id); 
}

function deletePengumuman(id) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat menghapus pengumuman.', 'warning');
        return;
    }
    const p = pengumumanData.find(item => item.id === id);
    const judul = p ? `"${p.judul}"` : 'pengumuman ini';
    showConfirmationModal({
        title: 'Konfirmasi Hapus Pengumuman',
        message: `Apakah Anda yakin ingin menghapus pengumuman ${judul}? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Ya, Hapus Pengumuman',
        cancelText: 'Batal',
        type: 'danger',
        icon: 'fa-solid fa-trash-can',
        onConfirm: () => {
            pengumumanData = pengumumanData.filter(item => item.id !== id);
            saveLocalStorageData();
            renderPengumumanGrid();
            if (typeof renderDashboard === 'function') renderDashboard();
            showToastNotification('Pengumuman berhasil dihapus.', 'success');
        }
    });
}
