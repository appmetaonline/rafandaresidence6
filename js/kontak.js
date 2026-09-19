// js/kontak.js - Modul Kontak Darurat & Fasilitas Penting (Sinkronisasi Otomatis ke Supabase, Tambah, Edit, Hapus & Pemilihan Ikon)

const KONTAK_CATEGORY_CONFIG = {
    'Keamanan': {
        icon: 'fa-shield-halved',
        bgClass: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        label: 'Keamanan / Polisi / Satpam'
    },
    'Pemadam': {
        icon: 'fa-fire-extinguisher',
        bgClass: 'bg-rose-50 text-rose-600 border-rose-200',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'Pemadam Kebakaran (Damkar)'
    },
    'Kesehatan': {
        icon: 'fa-hospital',
        bgClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Rumah Sakit / Medis / Dokter'
    },
    'Ambulans': {
        icon: 'fa-truck-medical',
        bgClass: 'bg-red-50 text-red-600 border-red-200',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        label: 'Layanan Ambulans Darurat'
    },
    'Pencarian dan pertolongan': {
        icon: 'fa-life-ring',
        bgClass: 'bg-amber-50 text-amber-600 border-amber-200',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'SAR / Basarnas'
    },
    'Layanan Kelistrikan': {
        icon: 'fa-bolt-lightning',
        bgClass: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        label: 'Gangguan Listrik (PLN)'
    },
    'Layanan Air': {
        icon: 'fa-faucet-drip',
        bgClass: 'bg-cyan-50 text-cyan-600 border-cyan-200',
        badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        label: 'Air Bersih (PDAM)'
    },
    'Pengurus': {
        icon: 'fa-user-tie',
        bgClass: 'bg-sky-50 text-sky-600 border-sky-200',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
        label: 'Pengurus RT / RW'
    },
    'Kebersihan': {
        icon: 'fa-trash-can',
        bgClass: 'bg-teal-50 text-teal-600 border-teal-200',
        badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        label: 'Petugas Kebersihan / Sampah'
    },
    'Bencana': {
        icon: 'fa-triangle-exclamation',
        bgClass: 'bg-orange-50 text-orange-600 border-orange-200',
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
        label: 'BPBD / Bencana Alam'
    },
    'Lainnya': {
        icon: 'fa-phone-volume',
        bgClass: 'bg-slate-50 text-slate-600 border-slate-200',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        label: 'Kontak Darurat Umum'
    }
};

const PRESET_KONTAK_ICONS = [
    { icon: 'fa-shield-halved', title: 'Keamanan' },
    { icon: 'fa-user-shield', title: 'Satpam' },
    { icon: 'fa-fire-extinguisher', title: 'Damkar' },
    { icon: 'fa-fire-flame-curved', title: 'Api' },
    { icon: 'fa-hospital', title: 'Rumah Sakit' },
    { icon: 'fa-truck-medical', title: 'Ambulans' },
    { icon: 'fa-stethoscope', title: 'Dokter' },
    { icon: 'fa-capsules', title: 'Apotek' },
    { icon: 'fa-heart-pulse', title: 'Medis' },
    { icon: 'fa-life-ring', title: 'Basarnas' },
    { icon: 'fa-bolt-lightning', title: 'PLN' },
    { icon: 'fa-faucet-drip', title: 'PDAM' },
    { icon: 'fa-user-tie', title: 'Pengurus' },
    { icon: 'fa-trash-can', title: 'Kebersihan' },
    { icon: 'fa-triangle-exclamation', title: 'Bencana' },
    { icon: 'fa-phone-volume', title: 'Telepon' },
    { icon: 'fa-headset', title: 'Hotline' }
];

function getKontakVisualConfig(kategori, nama = '', customIcon = '') {
    let config = KONTAK_CATEGORY_CONFIG[kategori];
    
    // Fallback dengan pencocokan kata kunci bila kategori non-standar
    if (!config) {
        const combined = ((kategori || '') + ' ' + (nama || '')).toLowerCase();
        if (combined.includes('kebakaran') || combined.includes('damkar') || combined.includes('pemadam')) {
            config = KONTAK_CATEGORY_CONFIG['Pemadam'];
        } else if (combined.includes('ambulan') || combined.includes('ambulance')) {
            config = KONTAK_CATEGORY_CONFIG['Ambulans'];
        } else if (combined.includes('polisi') || combined.includes('polsek') || combined.includes('satpam') || combined.includes('security') || combined.includes('keamanan') || combined.includes('babinsa') || combined.includes('bhabin')) {
            config = KONTAK_CATEGORY_CONFIG['Keamanan'];
        } else if (combined.includes('rumah sakit') || combined.includes('rs ') || combined.includes('rsud') || combined.includes('puskesmas') || combined.includes('klinik') || combined.includes('dokter') || combined.includes('bidan') || combined.includes('medika') || combined.includes('kesehatan')) {
            config = KONTAK_CATEGORY_CONFIG['Kesehatan'];
        } else if (combined.includes('basarnas') || combined.includes('sar') || combined.includes('pertolongan') || combined.includes('pencarian')) {
            config = KONTAK_CATEGORY_CONFIG['Pencarian dan pertolongan'];
        } else if (combined.includes('listrik') || combined.includes('pln') || combined.includes('kelistrikan')) {
            config = KONTAK_CATEGORY_CONFIG['Layanan Kelistrikan'];
        } else if (combined.includes('air') || combined.includes('pdam')) {
            config = KONTAK_CATEGORY_CONFIG['Layanan Air'];
        } else if (combined.includes('rt') || combined.includes('rw') || combined.includes('pengurus') || combined.includes('ketua') || combined.includes('sekretaris') || combined.includes('bendahara')) {
            config = KONTAK_CATEGORY_CONFIG['Pengurus'];
        } else if (combined.includes('sampah') || combined.includes('kebersihan')) {
            config = KONTAK_CATEGORY_CONFIG['Kebersihan'];
        } else if (combined.includes('bencana') || combined.includes('bpbd') || combined.includes('banjir') || combined.includes('longsor') || combined.includes('gempa')) {
            config = KONTAK_CATEGORY_CONFIG['Bencana'];
        } else {
            config = KONTAK_CATEGORY_CONFIG['Lainnya'];
        }
    }

    const chosenIcon = customIcon || config.icon;
    return {
        icon: chosenIcon,
        bgClass: config.bgClass,
        badgeClass: config.badgeClass,
        label: config.label,
        categoryName: kategori || 'Lainnya'
    };
}

function renderQuickIconGrid(selectedIcon) {
    const container = document.getElementById('quickIconGrid');
    if (!container) return;

    container.innerHTML = PRESET_KONTAK_ICONS.map(item => {
        const isActive = item.icon === selectedIcon;
        return `
            <button type="button" onclick="selectKontakQuickIcon('${item.icon}')" title="${item.title}" class="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${isActive ? 'bg-teal-600 text-white shadow-xs scale-105 ring-2 ring-teal-300' : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'}">
                <i class="fa-solid ${item.icon}"></i>
            </button>
        `;
    }).join('');
}

function updateKontakModalPreview(customIcon = null) {
    const katEl = document.getElementById('kontakKategori');
    const namaEl = document.getElementById('kontakNama');
    const iconHidden = document.getElementById('kontakIcon');
    if (!katEl || !iconHidden) return;

    const kategori = katEl.value;
    const nama = namaEl ? namaEl.value.trim() : '';
    const activeIcon = customIcon !== null ? customIcon : (iconHidden.value || '');

    const cfg = getKontakVisualConfig(kategori, nama, activeIcon);
    iconHidden.value = cfg.icon;

    const previewBox = document.getElementById('modalKontakIconPreview');
    const iconEl = document.getElementById('modalKontakIconEl');
    const labelEl = document.getElementById('modalKontakIconLabel');
    const badgeEl = document.getElementById('modalKontakIconBadge');

    if (previewBox) {
        previewBox.className = `w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border shadow-2xs transition-all ${cfg.bgClass}`;
    }
    if (iconEl) {
        iconEl.className = `fa-solid ${cfg.icon}`;
    }
    if (labelEl) {
        labelEl.textContent = cfg.label;
    }
    if (badgeEl) {
        badgeEl.textContent = cfg.categoryName;
        badgeEl.className = `text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.badgeClass}`;
    }

    renderQuickIconGrid(cfg.icon);
}

function onKontakKategoriChange() {
    const iconHidden = document.getElementById('kontakIcon');
    if (iconHidden) iconHidden.value = '';
    updateKontakModalPreview();
}

function onKontakNamaInput() {
    const katEl = document.getElementById('kontakKategori');
    const iconHidden = document.getElementById('kontakIcon');
    if (katEl && katEl.value === 'Lainnya' && iconHidden && !iconHidden.value) {
        updateKontakModalPreview();
    }
}

function selectKontakQuickIcon(icon) {
    const iconHidden = document.getElementById('kontakIcon');
    if (iconHidden) iconHidden.value = icon;
    updateKontakModalPreview(icon);
}

function resetKontakIconToCategory() {
    const iconHidden = document.getElementById('kontakIcon');
    if (iconHidden) iconHidden.value = '';
    updateKontakModalPreview('');
}

function renderKontakGrid() {
    const grid = document.getElementById('kontakGrid');
    if (!grid) return;

    if (kontakData.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400 text-sm">Belum ada kontak darurat.</div>';
        return;
    }

    const isLoggedIn = activeAdminSession !== null;
    grid.innerHTML = kontakData.map(k => {
        const cfg = getKontakVisualConfig(k.kategori, k.nama, k.icon);
        return `
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between space-x-3 hover:shadow-md hover:border-slate-300 transition-all">
                <div class="flex items-center space-x-3.5 min-w-0">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${cfg.bgClass} shadow-2xs">
                        <i class="fa-solid ${cfg.icon}"></i>
                    </div>
                    <div class="min-w-0">
                        <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${cfg.badgeClass}">${k.kategori || 'Lainnya'}</span>
                        <h4 class="font-bold text-slate-800 text-sm truncate mt-1">${k.nama}</h4>
                        <p class="text-xs font-semibold text-teal-600 mt-0.5 flex items-center space-x-1.5">
                            <i class="fa-solid fa-phone text-[10px]"></i>
                            <span>${k.nomor}</span>
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-1 shrink-0">
                    <a href="tel:${k.nomor}" title="Hubungi ${k.nama}" class="w-9 h-9 flex items-center justify-center bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white rounded-xl transition-all shadow-2xs">
                        <i class="fa-solid fa-phone text-xs"></i>
                    </a>
                    ${isLoggedIn ? `
                    <button onclick="editKontak('${k.id}')" title="Edit Kontak" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs transition-colors admin-only cursor-pointer"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteKontak('${k.id}')" title="Hapus Kontak" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs transition-colors admin-only cursor-pointer"><i class="fa-solid fa-trash"></i></button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function openModalKontak(id = null) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Fitur tambah/edit kontak darurat hanya dapat diakses oleh user admin.', 'warning');
        return;
    }

    document.getElementById('formKontak').reset();
    document.getElementById('kontakId').value = '';
    document.getElementById('kontakIcon').value = '';
    document.getElementById('modalKontakTitle').textContent = id ? 'Edit Kontak Darurat' : 'Tambah Kontak Darurat';

    if (id) {
        const k = kontakData.find(item => item.id === id);
        if (k) {
            document.getElementById('kontakId').value = k.id;
            document.getElementById('kontakNama').value = k.nama;
            document.getElementById('kontakNomor').value = k.nomor;
            document.getElementById('kontakKategori').value = k.kategori || 'Lainnya';
            document.getElementById('kontakIcon').value = k.icon || '';
            updateKontakModalPreview(k.icon || null);
        }
    } else {
        updateKontakModalPreview();
    }
    document.getElementById('modalKontak').classList.remove('hidden');
}

function closeModalKontak() { 
    const modal = document.getElementById('modalKontak');
    if (modal) modal.classList.add('hidden'); 
}

async function syncKontakToSupabase(item) {
    try {
        const res = await fetch('/api/supabase/kontak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        const data = await res.json();
        if (data && data.success) {
            const badgeText = document.getElementById('supabaseBadgeText');
            if (badgeText) badgeText.textContent = 'Terhubung';
            const lastSyncEl = document.getElementById('sbLastSyncTime');
            if (lastSyncEl) {
                const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                lastSyncEl.textContent = `Hari ini, ${nowStr}`;
            }
        }
        return data;
    } catch (err) {
        console.warn('Gagal sync kontak ke Supabase:', err);
        return { success: false, error: err.message };
    }
}

async function deleteKontakFromSupabase(id) {
    try {
        const res = await fetch('/api/supabase/kontak/' + encodeURIComponent(id), {
            method: 'DELETE'
        });
        return await res.json();
    } catch (err) {
        console.warn('Gagal menghapus kontak dari Supabase:', err);
        return { success: false, error: err.message };
    }
}

function saveKontak(e) {
    e.preventDefault();
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Aksi ditolak: Hanya user admin yang dapat menyimpan kontak darurat.', 'error');
        return;
    }

    const id = document.getElementById('kontakId').value;
    const nama = document.getElementById('kontakNama').value.trim();
    const nomor = document.getElementById('kontakNomor').value.trim();
    const kategori = document.getElementById('kontakKategori').value;
    const icon = document.getElementById('kontakIcon').value.trim();

    if (!nama || !nomor) {
        showToastNotification('Harap lengkapi nama dan nomor kontak darurat.', 'warning');
        return;
    }

    let savedItem;
    if (id) {
        const index = kontakData.findIndex(k => k.id === id);
        savedItem = { id, nama, nomor, kategori, icon };
        if (index !== -1) kontakData[index] = savedItem;
        else kontakData.push(savedItem);
    } else {
        const newId = 'KT-' + Date.now();
        savedItem = { id: newId, nama, nomor, kategori, icon };
        kontakData.push(savedItem);
    }

    closeModalKontak();
    saveLocalStorageData();
    renderKontakGrid();

    // Tampilkan pop-up dialog konfirmasi bahwa data berhasil disimpan
    showSuccessModal('data berhasil disimpan');

    // Otomatis simpan ke database Supabase Cloud
    syncKontakToSupabase(savedItem).then(res => {
        if (res && res.success) {
            showToastNotification('Data kontak darurat otomatis tersimpan di Supabase Cloud', 'success');
        }
    });
}

function editKontak(id) { 
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat mengedit kontak darurat.', 'warning');
        return;
    }
    openModalKontak(id); 
}

function deleteKontak(id) {
    if (!activeAdminSession) {
        openLoginModal();
        showToastNotification('Hanya user admin yang dapat menghapus kontak darurat.', 'warning');
        return;
    }
    const k = kontakData.find(item => item.id === id);
    const nama = k ? `"${k.nama}" (${k.nomor})` : 'kontak darurat ini';
    showConfirmationModal({
        title: 'Konfirmasi Hapus Kontak Darurat',
        message: `Apakah Anda yakin ingin menghapus kontak darurat ${nama}? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Ya, Hapus Kontak',
        cancelText: 'Batal',
        type: 'danger',
        icon: 'fa-solid fa-trash-can',
        onConfirm: () => {
            kontakData = kontakData.filter(item => item.id !== id);
            saveLocalStorageData();
            renderKontakGrid();
            deleteKontakFromSupabase(id);
            showToastNotification('Kontak darurat berhasil dihapus.', 'success');
        }
    });
}
