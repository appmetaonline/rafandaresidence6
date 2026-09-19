// js/warga.js - Modul Manajemen Data Warga (Tambah, Edit, Hapus, Pencarian, Filter Blok & Paginasi)

function handleWargaSearchFilter() {
    currentWargaPage = 1;
    renderWargaTable();
}

function renderWargaTable() {
    const searchInput = document.getElementById('searchWargaInput');
    const filterSelect = document.getElementById('filterBlokSelect');
    const tbody = document.getElementById('wargaTableBody');
    const pagContainer = document.getElementById('wargaPagination');
    if (!tbody) return;

    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
    const filterBlok = filterSelect ? filterSelect.value : 'ALL';

    const filtered = wargaData.filter(w => {
        const matchSearch = w.nama.toLowerCase().includes(searchVal) || (w.telp && w.telp.includes(searchVal)) || w.blok.toLowerCase().includes(searchVal);
        const matchBlok = typeof matchesBlockFilter === 'function' ? matchesBlockFilter(w.blok, filterBlok) : true;
        return matchSearch && matchBlok;
    });

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / WARGA_PER_PAGE));
    if (currentWargaPage > totalPages) currentWargaPage = totalPages;
    if (currentWargaPage < 1) currentWargaPage = 1;

    const isLoggedIn = activeAdminSession !== null;
    const colSpanCount = isLoggedIn ? 7 : 6;

    if (totalItems === 0) {
        tbody.innerHTML = `<tr><td colspan="${colSpanCount}" class="px-4 py-8 text-center text-slate-400 text-xs">Tidak ada data warga yang sesuai.</td></tr>`;
        if (pagContainer) pagContainer.classList.add('hidden');
        return;
    }

    if (pagContainer) pagContainer.classList.remove('hidden');

    const startIndex = (currentWargaPage - 1) * WARGA_PER_PAGE;
    const endIndex = Math.min(startIndex + WARGA_PER_PAGE, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedItems.map((w, index) => {
        const globalIndex = startIndex + index + 1;
        const isBelum = w.status === 'Belum ditempati' || w.status === 'Kosong/Belum ditempatin';
        let badgeClass = 'bg-slate-100 text-slate-600 border border-slate-300';
        let statusIcon = 'fa-door-closed';
        if (w.status === 'Tetap') {
            badgeClass = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
            statusIcon = 'fa-house-user';
        } else if (w.status === 'Kontrak') {
            badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200';
            statusIcon = 'fa-key';
        } else if (isBelum) {
            badgeClass = 'bg-slate-100 text-slate-600 border border-slate-300';
            statusIcon = 'fa-door-closed';
        }

        const displayAnggota = (isBelum && (!w.anggota || w.anggota === 0)) 
            ? '<span class="text-xs text-slate-400 italic">0 (Belum ditempati)</span>' 
            : `${w.anggota || 0} Orang`;

        const displayTelp = (w.telp && w.telp !== '-' && w.telp !== '0') 
            ? `<a href="https://wa.me/${w.telp.replace(/\D/g, '').replace(/^0/, '62')}" target="_blank" class="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700 font-medium"><i class="fa-brands fa-whatsapp text-sm mr-1"></i> ${w.telp}</a>`
            : '<span class="text-xs text-slate-400 italic">-</span>';

        return `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 font-medium text-slate-400">${globalIndex}</td>
            <td class="px-4 py-3 font-semibold text-slate-800">${w.nama}</td>
            <td class="px-4 py-3">
                <span class="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200">${w.blok}</span>
            </td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${badgeClass}">
                    <i class="fa-solid ${statusIcon} text-[10px] mr-1.5"></i>${isBelum ? 'Belum ditempati' : (w.status || 'Tetap')}
                </span>
            </td>
            <td class="px-4 py-3 text-slate-600">${displayAnggota}</td>
            <td class="px-4 py-3">${displayTelp}</td>
            <td class="px-4 py-3 text-center space-x-1 ${isLoggedIn ? '' : 'hidden'} admin-only">
                <button onclick="editWarga('${w.id}')" title="Edit Data Warga" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteWarga('${w.id}')" title="Hapus Data Warga" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>
        `;
    }).join('');

    renderWargaPaginationControls(totalItems, totalPages, startIndex, endIndex);
}

function renderWargaPaginationControls(totalItems, totalPages, startIndex, endIndex) {
    const infoElem = document.getElementById('wargaPaginationInfo');
    const controlsElem = document.getElementById('wargaPaginationControls');
    if (!infoElem || !controlsElem) return;

    infoElem.innerHTML = `Menampilkan <span class="font-bold text-slate-800">${startIndex + 1}</span> - <span class="font-bold text-slate-800">${endIndex}</span> dari <span class="font-bold text-slate-800">${totalItems}</span> data warga`;

    let buttonsHtml = '';

    // Tombol Sebelumnya
    const prevDisabled = currentWargaPage <= 1;
    buttonsHtml += `
        <button onclick="changeWargaPage(${currentWargaPage - 1})" ${prevDisabled ? 'disabled' : ''} 
            class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${prevDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-2xs cursor-pointer'}">
            <i class="fa-solid fa-chevron-left text-[10px]"></i>
            <span class="hidden sm:inline">Sebelumnya</span>
        </button>
    `;

    // Hitung rentang tombol nomor halaman
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentWargaPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        buttonsHtml += `
            <button onclick="changeWargaPage(1)" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">1</button>
        `;
        if (startPage > 2) {
            buttonsHtml += `<span class="px-1 text-slate-400">...</span>`;
        }
    }

    for (let p = startPage; p <= endPage; p++) {
        if (p === currentWargaPage) {
            buttonsHtml += `
                <button class="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-default">${p}</button>
            `;
        } else {
            buttonsHtml += `
                <button onclick="changeWargaPage(${p})" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-all cursor-pointer">${p}</button>
            `;
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            buttonsHtml += `<span class="px-1 text-slate-400">...</span>`;
        }
        buttonsHtml += `
            <button onclick="changeWargaPage(${totalPages})" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">${totalPages}</button>
        `;
    }

    // Tombol Selanjutnya
    const nextDisabled = currentWargaPage >= totalPages;
    buttonsHtml += `
        <button onclick="changeWargaPage(${currentWargaPage + 1})" ${nextDisabled ? 'disabled' : ''} 
            class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${nextDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-2xs cursor-pointer'}">
            <span class="hidden sm:inline">Selanjutnya</span>
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </button>
    `;

    controlsElem.innerHTML = buttonsHtml;
}

function changeWargaPage(newPage) {
    currentWargaPage = newPage;
    renderWargaTable();
    const wargaSection = document.getElementById('tab-warga');
    if (wargaSection) {
        wargaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function onWargaStatusChange() {
    const statusElem = document.getElementById('wargaStatus');
    const anggotaElem = document.getElementById('wargaAnggota');
    const namaElem = document.getElementById('wargaNama');
    const telpElem = document.getElementById('wargaTelp');
    if (!statusElem) return;
    const status = statusElem.value;
    if (status === 'Belum ditempati' || status === 'Kosong/Belum ditempatin') {
        if (!anggotaElem.value || anggotaElem.value === '3') {
            anggotaElem.value = '0';
        }
        if (namaElem && !namaElem.value) {
            namaElem.placeholder = 'Contoh: Rumah Milik Pak Hendro (Belum Ditempati)';
        }
        if (telpElem && !telpElem.value) {
            telpElem.placeholder = 'Boleh dikosongkan atau diisi nomor pemilik';
        }
    } else {
        if (anggotaElem.value === '0') {
            anggotaElem.value = '3';
        }
        if (namaElem && (namaElem.placeholder.includes('Rumah Kosong') || namaElem.placeholder.includes('Belum Ditempati'))) {
            namaElem.placeholder = 'Contoh: Pak Budi Santoso';
        }
        if (telpElem && telpElem.placeholder.includes('pemilik')) {
            telpElem.placeholder = 'Contoh: 08123456789 atau - jika kosong';
        }
    }
}

function openModalWarga(id = null) {
    document.getElementById('formWarga').reset();
    document.getElementById('wargaId').value = '';
    document.getElementById('modalWargaTitle').textContent = id ? 'Edit Data Warga' : 'Tambah Data Warga';

    if (id) {
        const w = wargaData.find(item => item.id === id);
        if (w) {
            document.getElementById('wargaId').value = w.id;
            document.getElementById('wargaNama').value = w.nama;
            document.getElementById('wargaBlok').value = w.blok;
            document.getElementById('wargaStatus').value = w.status || 'Tetap';
            document.getElementById('wargaAnggota').value = w.anggota !== undefined ? w.anggota : 3;
            document.getElementById('wargaTelp').value = w.telp || '';
        }
    } else {
        document.getElementById('wargaStatus').value = 'Tetap';
        document.getElementById('wargaAnggota').value = '3';
    }
    onWargaStatusChange();
    document.getElementById('modalWarga').classList.remove('hidden');
}

function closeModalWarga() {
    document.getElementById('modalWarga').classList.add('hidden');
}

function saveWarga(e) {
    e.preventDefault();
    const id = document.getElementById('wargaId').value;
    const nama = document.getElementById('wargaNama').value.trim();
    const blok = document.getElementById('wargaBlok').value.trim();
    const status = document.getElementById('wargaStatus').value;
    const anggotaVal = parseInt(document.getElementById('wargaAnggota').value, 10);
    const anggota = isNaN(anggotaVal) ? 0 : Math.max(0, anggotaVal);
    const telp = document.getElementById('wargaTelp').value.trim() || '-';

    if (!nama || !blok) {
        showToastNotification('Harap lengkapi nama dan blok rumah warga.', 'warning');
        return;
    }

    if (id) {
        const index = wargaData.findIndex(w => w.id === id);
        if (index !== -1) wargaData[index] = { id, nama, blok, status, anggota, telp };
    } else {
        const newId = 'W-' + Date.now();
        wargaData.push({ id: newId, nama, blok, status, anggota, telp });
    }

    closeModalWarga();
    saveLocalStorageData();
    if (typeof updateBlockFilterOptions === 'function') updateBlockFilterOptions();
    renderWargaTable();
    if (typeof renderIuranTable === 'function') renderIuranTable();
    if (typeof renderDashboard === 'function') renderDashboard();

    // Tampilkan pop-up dialog dengan format kalimat "data berhasil disimpan"
    showSuccessModal('data berhasil disimpan');
}

function editWarga(id) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat mengedit data warga.', 'warning');
        return;
    }
    openModalWarga(id);
}

function deleteWarga(id) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat menghapus data warga.', 'warning');
        return;
    }
    const w = wargaData.find(item => item.id === id);
    const namaWarga = w ? `"${w.nama}" (${w.blok})` : 'data warga ini';
    showConfirmationModal({
        title: 'Konfirmasi Hapus Data Warga',
        message: `Apakah Anda yakin ingin menghapus ${namaWarga}? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Ya, Hapus Warga',
        cancelText: 'Batal',
        type: 'danger',
        icon: 'fa-solid fa-trash-can',
        onConfirm: () => {
            wargaData = wargaData.filter(w => w.id !== id);
            saveLocalStorageData();
            if (typeof updateBlockFilterOptions === 'function') updateBlockFilterOptions();
            renderWargaTable();
            if (typeof renderIuranTable === 'function') renderIuranTable();
            if (typeof renderDashboard === 'function') renderDashboard();
            showToastNotification('Data warga berhasil dihapus.', 'success');
        }
    });
}
