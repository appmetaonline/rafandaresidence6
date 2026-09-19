// js/dashboard.js - Modul Tampilan Dashboard, Grafik Arus Kas, & Filter Global

function onGlobalYearChange(year) {
    currentActiveYear = parseInt(year, 10);
    currentIuranPage = 1;
    currentKasPage = 1;
    const badge = document.getElementById('headerYearBadge');
    const mDesc = document.getElementById('dashMasukDesc');
    const kDesc = document.getElementById('dashKeluarDesc');

    if (badge) badge.textContent = 'Tahun ' + currentActiveYear;
    if (mDesc) mDesc.textContent = 'Tahun ' + currentActiveYear;
    if (kDesc) kDesc.textContent = 'Tahun ' + currentActiveYear;

    renderDashboard();
    if (typeof renderIuranTable === 'function') renderIuranTable();
    if (typeof renderKasTable === 'function') renderKasTable();
}

function isMatchingBlockLetter(blokStr, letter) {
    if (!blokStr) return false;
    const clean = blokStr.trim().toUpperCase();
    const target = letter.toUpperCase();
    
    // Hapus awalan "BLOK" jika ada (misal: "BLOK A1" -> "A1", "BLOK A" -> "A")
    const afterBlok = clean.replace(/^BLOK\s*[-/.]?\s*/, '');
    
    // Cocokkan huruf target jika diikuti angka, spasi, tanda hubung, garis miring, titik, atau akhir teks
    const pattern = new RegExp('^' + target + '(?![A-Z])', 'i');
    return pattern.test(afterBlok);
}

function matchesBlockFilter(blokStr, filterVal) {
    if (!filterVal || filterVal === 'ALL') return true;
    return isMatchingBlockLetter(blokStr, filterVal);
}

function updateBlockFilterOptions() {
    const filterWargaSelect = document.getElementById('filterBlokSelect');
    const filterIuranSelect = document.getElementById('iuranFilterBlokSelect');

    if (!filterWargaSelect && !filterIuranSelect) return;

    const currentWargaVal = filterWargaSelect ? filterWargaSelect.value : 'ALL';
    const currentIuranVal = filterIuranSelect ? filterIuranSelect.value : 'ALL';

    // Filter blok rumah warga khusus Blok A sampai F
    const blockLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    let optionsHtmlWarga = '<option value="ALL">Semua Blok Rumah (A - F)</option>';
    let optionsHtmlIuran = '<option value="ALL">Semua Blok (A - F)</option>';

    blockLetters.forEach(letter => {
        optionsHtmlWarga += `<option value="${letter}">Blok ${letter}</option>`;
        optionsHtmlIuran += `<option value="${letter}">Blok ${letter}</option>`;
    });

    const validValues = ['ALL', ...blockLetters];

    if (filterWargaSelect) {
        filterWargaSelect.innerHTML = optionsHtmlWarga;
        filterWargaSelect.value = validValues.includes(currentWargaVal) ? currentWargaVal : 'ALL';
    }

    if (filterIuranSelect) {
        filterIuranSelect.innerHTML = optionsHtmlIuran;
        filterIuranSelect.value = validValues.includes(currentIuranVal) ? currentIuranVal : 'ALL';
    }
}

function renderDashboard() {
    const totalWargaElem = document.getElementById('dashTotalWarga');
    if (totalWargaElem) totalWargaElem.textContent = wargaData.length;

    const activeYearKas = kasData.filter(k => k.tahun === currentActiveYear);
    const totalMasuk = activeYearKas.filter(k => k.tipe === 'masuk').reduce((acc, curr) => acc + Number(curr.nominal), 0);
    const totalKeluar = activeYearKas.filter(k => k.tipe === 'keluar').reduce((acc, curr) => acc + Number(curr.nominal), 0);
    const saldo = totalMasuk - totalKeluar;

    const totalMasukElem = document.getElementById('dashTotalMasuk');
    const totalKeluarElem = document.getElementById('dashTotalKeluar');
    const saldoElem = document.getElementById('dashSaldo');

    if (totalMasukElem) totalMasukElem.textContent = 'Rp ' + totalMasuk.toLocaleString('id-ID');
    if (totalKeluarElem) totalKeluarElem.textContent = 'Rp ' + totalKeluar.toLocaleString('id-ID');
    if (saldoElem) saldoElem.textContent = 'Rp ' + saldo.toLocaleString('id-ID');

    const dashAnnContainer = document.getElementById('dashAnnouncementsList');
    if (dashAnnContainer) {
        if (pengumumanData.length === 0) {
            dashAnnContainer.innerHTML = '<p class="text-xs text-slate-400 py-4 text-center">Belum ada pengumuman.</p>';
        } else {
            dashAnnContainer.innerHTML = pengumumanData.slice(0, 3).map(p => `
                <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">${p.kategori}</span>
                        <span class="text-[10px] text-slate-400">${p.tanggal}</span>
                    </div>
                    <h4 class="font-semibold text-xs text-slate-800 line-clamp-1">${p.judul}</h4>
                    <p class="text-[11px] text-slate-500 line-clamp-2">${p.isi}</p>
                </div>
            `).join('');
        }
    }

    renderDashboardChart();
}

let currentChartFilter = 'all';

function setChartFilter(filter) {
    currentChartFilter = filter;
    ['all', 'masuk', 'keluar'].forEach(f => {
        const btn = document.getElementById(`btnChartFilter${f.charAt(0).toUpperCase() + f.slice(1)}`);
        if (btn) {
            if (f === filter) {
                btn.className = 'px-2.5 py-1 rounded-lg transition-all font-semibold bg-white text-slate-800 shadow-xs';
            } else {
                btn.className = 'px-2.5 py-1 rounded-lg transition-all text-slate-600 hover:text-sky-600';
            }
        }
    });
    renderDashboardChart(true);
}

function renderDashboardChart(animateReplay = false) {
    const canvasElem = document.getElementById('dashboardChart');
    if (!canvasElem) return;

    const ctx = canvasElem.getContext('2d');
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpense = Array(12).fill(0);

    kasData.filter(k => k.tahun === currentActiveYear).forEach(k => {
        const mIndex = (k.bulan || 1) - 1;
        if (k.tipe === 'masuk') monthlyIncome[mIndex] += Number(k.nominal);
        if (k.tipe === 'keluar') monthlyExpense[mIndex] += Number(k.nominal);
    });

    // Gradient Dinamis untuk Pemasukan (Sky to Indigo-Blue)
    const gradientIncome = ctx.createLinearGradient(0, 0, 0, 280);
    gradientIncome.addColorStop(0, '#38bdf8'); // sky-400
    gradientIncome.addColorStop(0.7, '#0284c7'); // sky-600
    gradientIncome.addColorStop(1, '#0369a1'); // sky-700

    // Gradient Dinamis untuk Pengeluaran (Rose to Crimson)
    const gradientExpense = ctx.createLinearGradient(0, 0, 0, 280);
    gradientExpense.addColorStop(0, '#fb7185'); // rose-400
    gradientExpense.addColorStop(0.7, '#f43f5e'); // rose-500
    gradientExpense.addColorStop(1, '#e11d48'); // rose-600

    // Hover state gradient
    const hoverIncome = ctx.createLinearGradient(0, 0, 0, 280);
    hoverIncome.addColorStop(0, '#7dd3fc');
    hoverIncome.addColorStop(1, '#0284c7');

    const hoverExpense = ctx.createLinearGradient(0, 0, 0, 280);
    hoverExpense.addColorStop(0, '#fda4af');
    hoverExpense.addColorStop(1, '#f43f5e');

    const datasets = [];

    if (currentChartFilter === 'all' || currentChartFilter === 'masuk') {
        datasets.push({
            label: 'Pemasukan (Rp)',
            data: monthlyIncome,
            backgroundColor: gradientIncome,
            hoverBackgroundColor: hoverIncome,
            borderColor: '#0284c7',
            borderWidth: 1.5,
            borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 2, bottomRight: 2 },
            borderSkipped: false,
            barPercentage: 0.75,
            categoryPercentage: 0.82
        });
    }

    if (currentChartFilter === 'all' || currentChartFilter === 'keluar') {
        datasets.push({
            label: 'Pengeluaran (Rp)',
            data: monthlyExpense,
            backgroundColor: gradientExpense,
            hoverBackgroundColor: hoverExpense,
            borderColor: '#e11d48',
            borderWidth: 1.5,
            borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 2, bottomRight: 2 },
            borderSkipped: false,
            barPercentage: 0.75,
            categoryPercentage: 0.82
        });
    }

    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            animation: {
                duration: 1100,
                easing: 'easeOutBack',
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default') {
                        delay = context.dataIndex * 50 + context.datasetIndex * 120;
                    }
                    return delay;
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 12,
                        boxHeight: 12,
                        useBorderRadius: true,
                        borderRadius: 4,
                        font: { family: 'Inter', size: 11, weight: '500' },
                        color: '#475569',
                        padding: 16
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    borderRadius: 12,
                    titleFont: { family: 'Inter', size: 12, weight: '700' },
                    bodyFont: { family: 'Inter', size: 11 },
                    callbacks: {
                        label: function(context) {
                            const val = context.parsed.y || 0;
                            return ` ${context.dataset.label}: Rp ${val.toLocaleString('id-ID')}`;
                        },
                        afterBody: function(items) {
                            if (items.length >= 2) {
                                const inc = items[0].parsed.y || 0;
                                const exp = items[1].parsed.y || 0;
                                const net = inc - exp;
                                const sign = net >= 0 ? '+' : '';
                                return [`\nSelisih Bersih: ${sign}Rp ${net.toLocaleString('id-ID')}`];
                            }
                            return [];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9',
                        drawBorder: false
                    },
                    ticks: {
                        font: { family: 'Inter', size: 10 },
                        color: '#94a3b8',
                        callback: function(val) {
                            if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(1).replace(/\.0$/, '') + ' jt';
                            if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + ' rb';
                            return 'Rp ' + val;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { family: 'Inter', size: 10, weight: '500' },
                        color: '#64748b'
                    }
                }
            }
        }
    });
}
