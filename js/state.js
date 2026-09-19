// js/state.js - Global State & Data Store

let currentActiveYear = 2026;
let chartInstance = null;
let activeAdminSession = null; // Menyimpan data sesi login admin
let currentWargaPage = 1;
const WARGA_PER_PAGE = 25;
let currentIuranPage = 1;
const IURAN_PER_PAGE = 25;
let currentKasPage = 1;
const KAS_PER_PAGE = 25;

// System Config Default
let systemConfig = {
    namaKomplek: "Perumahan Graha SIMAK",
    alamatKomplek: "RT 05 / RW 12",
    nominalIuranDefault: 20000
};

// Admin Accounts Store
let adminUsers = [
    { username: 'admin', password: 'admin123', name: 'Admin Utama', role: 'Super Admin' },
    { username: 'bendahara', password: 'kas123', name: 'Bendahara Komplek', role: 'Bendahara' }
];

// Initial Seed Data for Warga
let wargaData = [
    { id: 'W-1', nama: 'Budi Santoso', blok: 'Blok A1 No 04', status: 'Tetap', anggota: 4, telp: '081234567891' },
    { id: 'W-2', nama: 'Ahmad Dahlan', blok: 'Blok A1 No 08', status: 'Tetap', anggota: 3, telp: '081398765432' },
    { id: 'W-3', nama: 'Hendra Wijaya', blok: 'Blok B2 No 12', status: 'Kontrak', anggota: 2, telp: '085711223344' },
    { id: 'W-4', nama: 'Sri Wahyuni', blok: 'Blok C3 No 01', status: 'Tetap', anggota: 5, telp: '081900112233' },
    { id: 'W-5', nama: 'Rudi Hermawan', blok: 'RT 02 / Rose', status: 'Kontrak', anggota: 3, telp: '082155667788' },
    { id: 'W-6', nama: 'Rumah (Milik Pak Hendro)', blok: 'Blok C3 No 05', status: 'Belum ditempati', anggota: 0, telp: '-' }
];

// Dues Checklist Records Matrix
let iuranData = {
    2026: {
        'W-1': [true, true, true, true, true, true, true, true, false, false, false, false],
        'W-2': [true, true, true, true, true, false, false, false, false, false, false, false],
        'W-3': [true, true, false, false, false, false, false, false, false, false, false, false],
        'W-4': [true, true, true, true, true, true, true, true, true, true, false, false],
        'W-5': [true, false, false, false, false, false, false, false, false, false, false, false],
        'W-6': [false, false, false, false, false, false, false, false, false, false, false, false]
    }
};

let kasData = [
    { id: 'K-1', tahun: 2026, bulan: 1, tanggal: '2026-01-05', tipe: 'masuk', kategori: 'Iuran Kas Warga', nominal: 2500000, keterangan: 'Pemasukan kas rutin bulan Januari' },
    { id: 'K-2', tahun: 2026, bulan: 1, tanggal: '2026-01-12', tipe: 'keluar', kategori: 'Kebersihan & Sampah', nominal: 650000, keterangan: 'Honor petugas sampah & alat kebersihan' },
    { id: 'K-3', tahun: 2026, bulan: 2, tanggal: '2026-02-04', tipe: 'masuk', kategori: 'Iuran Kas Warga', nominal: 2300000, keterangan: 'Pemasukan kas bulan Februari' },
    { id: 'K-4', tahun: 2026, bulan: 2, tanggal: '2026-02-18', tipe: 'keluar', kategori: 'Lampu Jalan', nominal: 400000, keterangan: 'Pengantian 4 titik bohlam LED fasilitas umum' },
    { id: 'K-5', tahun: 2026, bulan: 3, tanggal: '2026-03-02', tipe: 'masuk', kategori: 'Sumbangan Acara', nominal: 1000000, keterangan: 'Sumbangan donatur warga untuk kegiatan komplek' },
    { id: 'K-6', tahun: 2026, bulan: 3, tanggal: '2026-03-15', tipe: 'keluar', kategori: 'Konsumsi Kerja Bakti', nominal: 350000, keterangan: 'Snack & minuman suadaya warga' }
];

let pengumumanData = [
    { id: 'P-1', judul: 'Kerja Bakti Masal & Pembersihan Got', tanggal: '2026-03-22', kategori: 'Kegiatan', isi: 'Dihimbau kepada seluruh kepala keluarga untuk berpartisipasi dalam kegiatan kerja bakti pembersihan saluran air menjelang musim hujan.' },
    { id: 'P-2', judul: 'Pengetatan Keamanan Pos Kamling Utama', tanggal: '2026-03-10', kategori: 'Keamanan', isi: 'Wajib lapor bagi tamu luar yang berkunjung di atas pukul 22:00 WIB ke pos satpam.' }
];

let kontakData = [
    { id: 'KT-1', nama: 'Polsek Sekitar', nomor: '021-5550110', kategori: 'Keamanan' },
    { id: 'KT-2', nama: 'Pos Satpam Gate Utama', nomor: '081299887766', kategori: 'Keamanan' },
    { id: 'KT-3', nama: 'Pemadam Kebakaran (Damkar)', nomor: '113', kategori: 'Pemadam' },
    { id: 'KT-4', nama: 'RS Medika Komplek', nomor: '021-5559988', kategori: 'Kesehatan' },
    { id: 'KT-5', nama: 'Ambulans Gawat Darurat', nomor: '118', kategori: 'Ambulans' },
    { id: 'KT-6', nama: 'Gangguan Listrik PLN', nomor: '123', kategori: 'Layanan Kelistrikan' },
    { id: 'KT-7', nama: 'Ketua RT 05 (Pak Agus)', nomor: '081234567890', kategori: 'Pengurus' }
];

function loadLocalStorageData() {
    try {
        const savedConfig = localStorage.getItem('SIMAK_CONFIG');
        if (savedConfig) {
            systemConfig = JSON.parse(savedConfig);
            if (!systemConfig.nominalIuranDefault || systemConfig.nominalIuranDefault === 50000) {
                systemConfig.nominalIuranDefault = 20000;
            }
        }

        const savedAdmins = localStorage.getItem('SIMAK_ADMINS');
        if (savedAdmins) adminUsers = JSON.parse(savedAdmins);

        const savedWarga = localStorage.getItem('SIMAK_WARGA');
        if (savedWarga) {
            wargaData = JSON.parse(savedWarga);
            let migrated = false;
            wargaData.forEach(w => {
                if (w.status === 'Kosong/Belum ditempatin') {
                    w.status = 'Belum ditempati';
                    migrated = true;
                }
            });
            if (migrated) saveLocalStorageData();
        }

        const savedIuran = localStorage.getItem('SIMAK_IURAN');
        if (savedIuran) iuranData = JSON.parse(savedIuran);

        const savedKas = localStorage.getItem('SIMAK_KAS');
        if (savedKas) kasData = JSON.parse(savedKas);

        const savedPengumuman = localStorage.getItem('SIMAK_PENGUMUMAN');
        if (savedPengumuman) pengumumanData = JSON.parse(savedPengumuman);

        const savedKontak = localStorage.getItem('SIMAK_KONTAK');
        if (savedKontak) kontakData = JSON.parse(savedKontak);
    } catch (err) {
        console.error("Gagal memuat data dari localStorage:", err);
    }
}

function saveLocalStorageData(skipCloudSync = false) {
    try {
        localStorage.setItem('SIMAK_CONFIG', JSON.stringify(systemConfig));
        localStorage.setItem('SIMAK_ADMINS', JSON.stringify(adminUsers));
        localStorage.setItem('SIMAK_WARGA', JSON.stringify(wargaData));
        localStorage.setItem('SIMAK_IURAN', JSON.stringify(iuranData));
        localStorage.setItem('SIMAK_KAS', JSON.stringify(kasData));
        localStorage.setItem('SIMAK_PENGUMUMAN', JSON.stringify(pengumumanData));
        localStorage.setItem('SIMAK_KONTAK', JSON.stringify(kontakData));

        if (!skipCloudSync && typeof debouncePushToSupabase === 'function') {
            debouncePushToSupabase();
        }
    } catch (err) {
        console.error("Gagal menyimpan ke localStorage:", err);
    }
}
