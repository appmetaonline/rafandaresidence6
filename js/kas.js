// js/kas.js - Modul Arus Kas Keuangan (Pemasukan, Pengeluaran, Filter Tipe/Bulan & Paginasi)

function handleKasFilterChange() {
    currentKasPage = 1;
    renderKasTable();
}

function renderKasTable() {
    const typeElem = document.getElementById('kasTypeFilter');
    const monthElem = document.getElementById('kasMonthFilter');
    const tbody = document.getElementById('kasTableBody');
    const pagContainer = document.getElementById('kasPagination');
    if (!tbody) return;

    const typeFilter = typeElem ? typeElem.value : 'ALL';
    const monthFilter = monthElem ? monthElem.value : 'ALL';

    const filtered = kasData.filter(k => {
        const matchYear = k.tahun === currentActiveYear;
        const matchType = (typeFilter === 'ALL') || (k.tipe === typeFilter);
        const matchMonth = (monthFilter === 'ALL') || (k.bulan === parseInt(monthFilter, 10));
        return matchYear && matchType && matchMonth;
    });

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / KAS_PER_PAGE));
    if (currentKasPage > totalPages) currentKasPage = totalPages;
    if (currentKasPage < 1) currentKasPage = 1;

    const isLoggedIn = activeAdminSession !== null;
    const colspan = isLoggedIn ? 6 : 5;

    if (totalItems === 0) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="px-4 py-8 text-center text-slate-400 text-xs">Belum ada transaksi kas untuk periode ini.</td></tr>`;
        if (pagContainer) pagContainer.classList.add('hidden');
        return;
    }

    if (pagContainer) pagContainer.classList.remove('hidden');

    const startIndex = (currentKasPage - 1) * KAS_PER_PAGE;
    const endIndex = Math.min(startIndex + KAS_PER_PAGE, totalItems);
    const paginated = filtered.slice(startIndex, endIndex);

    tbody.innerHTML = paginated.map(k => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 text-xs text-slate-500">${k.tanggal}</td>
            <td class="px-4 py-3">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${k.tipe === 'masuk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                    ${k.tipe === 'masuk' ? '+ Masuk' : '- Keluar'}
                </span>
            </td>
            <td class="px-4 py-3 font-medium text-slate-700">${k.kategori}</td>
            <td class="px-4 py-3 text-slate-500 text-xs">${k.keterangan || '-'}</td>
            <td class="px-4 py-3 text-right font-bold ${k.tipe === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}">
                Rp ${Number(k.nominal).toLocaleString('id-ID')}
            </td>
            <td class="px-4 py-3 text-center space-x-1 ${isLoggedIn ? '' : 'hidden'} admin-only">
                <button onclick="editKas('${k.id}')" title="Edit Transaksi" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteKas('${k.id}')" title="Hapus Transaksi" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>
    `).join('');

    renderKasPaginationControls(totalItems, totalPages, startIndex, endIndex);
}

function renderKasPaginationControls(totalItems, totalPages, startIndex, endIndex) {
    const infoElem = document.getElementById('kasPaginationInfo');
    const controlsElem = document.getElementById('kasPaginationControls');
    if (!infoElem || !controlsElem) return;

    infoElem.innerHTML = `Menampilkan <span class="font-bold text-slate-800">${startIndex + 1}</span> - <span class="font-bold text-slate-800">${endIndex}</span> dari <span class="font-bold text-slate-800">${totalItems}</span> data transaksi kas`;

    let buttonsHtml = '';

    // Tombol Sebelumnya
    const prevDisabled = currentKasPage <= 1;
    buttonsHtml += `
        <button onclick="changeKasPage(${currentKasPage - 1})" ${prevDisabled ? 'disabled' : ''} 
            class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${prevDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-2xs cursor-pointer'}">
            <i class="fa-solid fa-chevron-left text-[10px]"></i>
            <span class="hidden sm:inline">Sebelumnya</span>
        </button>
    `;

    // Rentang nomor halaman
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentKasPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        buttonsHtml += `
            <button onclick="changeKasPage(1)" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">1</button>
        `;
        if (startPage > 2) {
            buttonsHtml += `<span class="px-1 text-slate-400">...</span>`;
        }
    }

    for (let p = startPage; p <= endPage; p++) {
        if (p === currentKasPage) {
            buttonsHtml += `
                <button class="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-default">${p}</button>
            `;
        } else {
            buttonsHtml += `
                <button onclick="changeKasPage(${p})" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-all cursor-pointer">${p}</button>
            `;
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            buttonsHtml += `<span class="px-1 text-slate-400">...</span>`;
        }
        buttonsHtml += `
            <button onclick="changeKasPage(${totalPages})" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">${totalPages}</button>
        `;
    }

    // Tombol Selanjutnya
    const nextDisabled = currentKasPage >= totalPages;
    buttonsHtml += `
        <button onclick="changeKasPage(${currentKasPage + 1})" ${nextDisabled ? 'disabled' : ''} 
            class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${nextDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-2xs cursor-pointer'}">
            <span class="hidden sm:inline">Selanjutnya</span>
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </button>
    `;

    controlsElem.innerHTML = buttonsHtml;
}

function changeKasPage(newPage) {
    currentKasPage = newPage;
    renderKasTable();
    const kasSection = document.getElementById('tab-kas');
    if (kasSection) {
        kasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function openModalKas(id = null) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat menambah atau mengedit transaksi kas.', 'warning');
        return;
    }

    document.getElementById('formKas').reset();
    document.getElementById('kasId').value = '';
    document.getElementById('modalKasTitle').textContent = id ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas';
    document.getElementById('kasTanggal').value = new Date().toISOString().split('T')[0];

    if (id) {
        const k = kasData.find(item => item.id === id);
        if (k) {
            document.getElementById('kasId').value = k.id;
            document.getElementById('kasTipe').value = k.tipe;
            document.getElementById('kasTanggal').value = k.tanggal;
            document.getElementById('kasKategori').value = k.kategori;
            document.getElementById('kasNominal').value = k.nominal;
            document.getElementById('kasKeterangan').value = k.keterangan;
        }
    }
    document.getElementById('modalKas').classList.remove('hidden');
}

function closeModalKas() { 
    const modal = document.getElementById('modalKas');
    if (modal) modal.classList.add('hidden'); 
}

function saveKas(e) {
    e.preventDefault();
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat menyimpan transaksi kas.', 'warning');
        return;
    }

    const id = document.getElementById('kasId').value;
    const tipe = document.getElementById('kasTipe').value;
    const tanggal = document.getElementById('kasTanggal').value;
    const kategori = document.getElementById('kasKategori').value.trim();
    const nominal = parseFloat(document.getElementById('kasNominal').value);
    const keterangan = document.getElementById('kasKeterangan').value.trim();

    if (!nominal || isNaN(nominal) || nominal <= 0) {
        showToastNotification('Nominal kas tidak valid.', 'warning');
        return;
    }

    const dateObj = new Date(tanggal);
    const tahun = dateObj.getFullYear();
    const bulan = dateObj.getMonth() + 1;

    if (id) {
        const index = kasData.findIndex(k => k.id === id);
        if (index !== -1) kasData[index] = { id, tahun, bulan, tanggal, tipe, kategori, nominal, keterangan };
    } else {
        const newId = 'K-' + Date.now();
        kasData.push({ id, tahun, bulan, tanggal, tipe, kategori, nominal, keterangan, id: newId });
    }

    closeModalKas();
    saveLocalStorageData();
    renderKasTable();
    if (typeof renderDashboard === 'function') renderDashboard();

    // Tampilkan pop-up dialog dengan format kalimat "data berhasil disimpan"
    showSuccessModal('data berhasil disimpan');
}

function editKas(id) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat mengedit transaksi kas.', 'warning');
        return;
    }
    openModalKas(id);
}

function deleteKas(id) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat menghapus transaksi kas.', 'warning');
        return;
    }
    const k = kasData.find(item => item.id === id);
    const info = k ? `"${k.keterangan || k.kategori}" senilai Rp ${Number(k.nominal).toLocaleString('id-ID')}` : 'transaksi kas ini';
    showConfirmationModal({
        title: 'Konfirmasi Hapus Transaksi Kas',
        message: `Apakah Anda yakin ingin menghapus catatan transaksi ${info}? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Ya, Hapus Transaksi',
        cancelText: 'Batal',
        type: 'danger',
        icon: 'fa-solid fa-trash-can',
        onConfirm: () => {
            kasData = kasData.filter(k => k.id !== id);
            saveLocalStorageData();
            renderKasTable();
            if (typeof renderDashboard === 'function') renderDashboard();
            showToastNotification('Catatan transaksi kas berhasil dihapus.', 'success');
        }
    });
}
