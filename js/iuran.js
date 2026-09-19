// js/iuran.js - Modul Checklist Iuran Warga Bulanan (Ceklis, Filter Blok, Paginasi & Status Bayar)

function handleIuranFilterChange() {
    currentIuranPage = 1;
    renderIuranTable();
}

function renderIuranTable() {
    const filterElem = document.getElementById('iuranFilterBlokSelect');
    const searchElem = document.getElementById('searchIuranInput');
    const tbody = document.getElementById('iuranTableBody');
    const pagContainer = document.getElementById('iuranPagination');
    if (!tbody) return;

    const filterBlok = filterElem ? filterElem.value : 'ALL';
    const searchVal = searchElem ? searchElem.value.toLowerCase().trim() : '';

    if (!iuranData[currentActiveYear]) iuranData[currentActiveYear] = {};

    const filteredWarga = wargaData.filter(w => {
        const matchBlok = typeof matchesBlockFilter === 'function' ? matchesBlockFilter(w.blok, filterBlok) : true;
        const matchSearch = !searchVal || w.nama.toLowerCase().includes(searchVal) || (w.blok && w.blok.toLowerCase().includes(searchVal));
        return matchBlok && matchSearch;
    });

    const totalItems = filteredWarga.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / IURAN_PER_PAGE));
    if (currentIuranPage > totalPages) currentIuranPage = totalPages;
    if (currentIuranPage < 1) currentIuranPage = 1;

    if (totalItems === 0) {
        tbody.innerHTML = '<tr><td colspan="14" class="px-4 py-8 text-center text-slate-400 text-xs">Tidak ada data warga untuk ceklis iuran.</td></tr>';
        if (pagContainer) pagContainer.classList.add('hidden');
        return;
    }

    if (pagContainer) pagContainer.classList.remove('hidden');

    const startIndex = (currentIuranPage - 1) * IURAN_PER_PAGE;
    const endIndex = Math.min(startIndex + IURAN_PER_PAGE, totalItems);
    const paginatedWarga = filteredWarga.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedWarga.map((w, index) => {
        const globalIndex = startIndex + index + 1;
        if (!iuranData[currentActiveYear][w.id]) {
            iuranData[currentActiveYear][w.id] = Array(12).fill(false);
        }
        const monthsStatus = iuranData[currentActiveYear][w.id];
        const totalLunasCount = monthsStatus.filter(Boolean).length;

        const monthButtons = monthsStatus.map((isLunas, monthIdx) => `
            <td class="px-1 py-2 text-center">
                <button onclick="toggleIuranStatus('${w.id}', ${monthIdx})" class="w-7 h-7 rounded-lg text-[10px] font-bold transition-transform active:scale-95 shadow-sm cursor-pointer ${isLunas ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600'}">
                    ${isLunas ? '✓' : '✕'}
                </button>
            </td>
        `).join('');

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-3 py-2 text-left">
                    <div class="flex items-start space-x-2">
                        <span class="text-[10px] font-semibold text-slate-400 mt-0.5 w-5 text-right shrink-0">${globalIndex}.</span>
                        <div>
                            <div class="font-semibold text-slate-800 text-xs flex items-center space-x-1.5 flex-wrap">
                                <span>${w.nama}</span>
                                ${(w.status === 'Belum ditempati' || w.status === 'Kosong/Belum ditempatin') ? '<span class="text-[9px] bg-slate-100 text-slate-500 font-medium px-1.5 py-0.5 rounded border border-slate-200">Belum ditempati</span>' : ''}
                            </div>
                            <div class="text-[10px] text-slate-400">${w.blok}</div>
                        </div>
                    </div>
                </td>
                ${monthButtons}
                <td class="px-3 py-2 text-center font-bold text-slate-700">
                    <span class="px-2 py-0.5 rounded-full text-[10px] ${totalLunasCount === 12 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                        ${totalLunasCount} / 12
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    renderIuranPaginationControls(totalItems, totalPages, startIndex, endIndex);
}

function renderIuranPaginationControls(totalItems, totalPages, startIndex, endIndex) {
    const infoElem = document.getElementById('iuranPaginationInfo');
    const controlsElem = document.getElementById('iuranPaginationControls');
    if (!infoElem || !controlsElem) return;

    infoElem.innerHTML = `Menampilkan <span class="font-bold text-slate-800">${startIndex + 1}</span> - <span class="font-bold text-slate-800">${endIndex}</span> dari <span class="font-bold text-slate-800">${totalItems}</span> data warga`;

    let buttonsHtml = '';

    // Tombol Sebelumnya
    const prevDisabled = currentIuranPage <= 1;
    buttonsHtml += `
        <button onclick="changeIuranPage(${currentIuranPage - 1})" ${prevDisabled ? 'disabled' : ''} 
            class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${prevDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-2xs cursor-pointer'}">
            <i class="fa-solid fa-chevron-left text-[10px]"></i>
            <span class="hidden sm:inline">Sebelumnya</span>
        </button>
    `;

    // Hitung rentang tombol nomor halaman
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentIuranPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        buttonsHtml += `
            <button onclick="changeIuranPage(1)" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">1</button>
        `;
        if (startPage > 2) {
            buttonsHtml += `<span class="px-1 text-slate-400">...</span>`;
        }
    }

    for (let p = startPage; p <= endPage; p++) {
        if (p === currentIuranPage) {
            buttonsHtml += `
                <button class="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-default">${p}</button>
            `;
        } else {
            buttonsHtml += `
                <button onclick="changeIuranPage(${p})" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-all cursor-pointer">${p}</button>
            `;
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            buttonsHtml += `<span class="px-1 text-slate-400">...</span>`;
        }
        buttonsHtml += `
            <button onclick="changeIuranPage(${totalPages})" class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">${totalPages}</button>
        `;
    }

    // Tombol Selanjutnya
    const nextDisabled = currentIuranPage >= totalPages;
    buttonsHtml += `
        <button onclick="changeIuranPage(${currentIuranPage + 1})" ${nextDisabled ? 'disabled' : ''} 
            class="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${nextDisabled ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 shadow-2xs cursor-pointer'}">
            <span class="hidden sm:inline">Selanjutnya</span>
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </button>
    `;

    controlsElem.innerHTML = buttonsHtml;
}

function changeIuranPage(newPage) {
    currentIuranPage = newPage;
    renderIuranTable();
    const iuranSection = document.getElementById('tab-iuran');
    if (iuranSection) {
        iuranSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function toggleIuranStatus(wargaId, monthIdx) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya admin yang dapat mengubah status iuran.', 'warning');
        return;
    }
    if (!iuranData[currentActiveYear]) iuranData[currentActiveYear] = {};
    if (!iuranData[currentActiveYear][wargaId]) iuranData[currentActiveYear][wargaId] = Array(12).fill(false);

    iuranData[currentActiveYear][wargaId][monthIdx] = !iuranData[currentActiveYear][wargaId][monthIdx];
    saveLocalStorageData();
    renderIuranTable();
    if (typeof renderDashboard === 'function') renderDashboard();
}
