import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser for JSON payloads
app.use(express.json({ limit: '10mb' }));

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://anmuadtarsxidtvyhmzm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ZBMkKLdiNqp0nQEN8YOUCA_00nwOsOK';
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'anmuadtarsxidtvyhmzm';
const SUPABASE_PROJECT_NAME = process.env.SUPABASE_PROJECT_NAME || 'Sistem Informasi Manajemen Komplek';

let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    // Clean URL if trailing /rest/v1 was passed
    const cleanUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    supabaseClient = createClient(cleanUrl, SUPABASE_KEY);
  }
  return supabaseClient;
}

const SQL_INIT_SCRIPT = `-- ========================================================
-- SKRIP INISIALISASI DATABASE SIMAK DI SUPABASE
-- Project: ${SUPABASE_PROJECT_NAME} (${SUPABASE_PROJECT_ID})
-- ========================================================

-- 1. TABEL PENYIMPANAN DATA UTAMA (SIMAK STORE)
CREATE TABLE IF NOT EXISTS public.simak_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan RLS & Buat Policy Akses
ALTER TABLE public.simak_store ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Simak Store" ON public.simak_store;
CREATE POLICY "Akses Publik Simak Store" ON public.simak_store FOR ALL USING (true) WITH CHECK (true);

-- 2. TABEL DATA WARGA
CREATE TABLE IF NOT EXISTS public.warga (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    blok TEXT NOT NULL,
    status TEXT DEFAULT 'Tetap',
    anggota INTEGER DEFAULT 1,
    telp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.warga ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Warga" ON public.warga;
CREATE POLICY "Akses Publik Warga" ON public.warga FOR ALL USING (true) WITH CHECK (true);

-- 3. TABEL KAS KEUANGAN
CREATE TABLE IF NOT EXISTS public.kas (
    id TEXT PRIMARY KEY,
    tahun INTEGER NOT NULL,
    bulan INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    tipe TEXT NOT NULL,
    kategori TEXT NOT NULL,
    nominal NUMERIC NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.kas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Kas" ON public.kas;
CREATE POLICY "Akses Publik Kas" ON public.kas FOR ALL USING (true) WITH CHECK (true);

-- 4. TABEL IURAN BULANAN
CREATE TABLE IF NOT EXISTS public.iuran (
    id TEXT PRIMARY KEY,
    tahun INTEGER NOT NULL,
    warga_id TEXT NOT NULL,
    status_bulan JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.iuran ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Iuran" ON public.iuran;
CREATE POLICY "Akses Publik Iuran" ON public.iuran FOR ALL USING (true) WITH CHECK (true);

-- 5. TABEL PENGUMUMAN KOMPLEK
CREATE TABLE IF NOT EXISTS public.pengumuman (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    tanggal DATE NOT NULL,
    kategori TEXT NOT NULL,
    isi TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Pengumuman" ON public.pengumuman;
CREATE POLICY "Akses Publik Pengumuman" ON public.pengumuman FOR ALL USING (true) WITH CHECK (true);

-- 6. TABEL KONTAK DARURAT
CREATE TABLE IF NOT EXISTS public.kontak (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    nomor TEXT NOT NULL,
    kategori TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.kontak ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Kontak" ON public.kontak;
CREATE POLICY "Akses Publik Kontak" ON public.kontak FOR ALL USING (true) WITH CHECK (true);

-- 7. TABEL PROFIL & KONFIGURASI SISTEM
CREATE TABLE IF NOT EXISTS public.system_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    nama_komplek TEXT,
    alamat_komplek TEXT,
    nominal_iuran_default NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik System Config" ON public.system_config;
CREATE POLICY "Akses Publik System Config" ON public.system_config FOR ALL USING (true) WITH CHECK (true);
`;

// API: Cek status koneksi Supabase & keberadaan tabel
app.get('/api/supabase/status', async (req, res) => {
  try {
    const supabase = getSupabase();
    const startTime = Date.now();
    
    // Check if simak_store exists
    const { data: storeData, error: storeError } = await supabase
      .from('simak_store')
      .select('key')
      .limit(1);

    // Check if warga table exists
    const { data: wargaData, error: wargaError } = await supabase
      .from('warga')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;
    const storeExists = !storeError;
    const wargaExists = !wargaError;
    const tablesReady = storeExists || wargaExists;

    res.json({
      connected: true,
      tablesReady,
      storeExists,
      wargaExists,
      latencyMs: latency,
      project: {
        id: SUPABASE_PROJECT_ID,
        name: SUPABASE_PROJECT_NAME,
        url: SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''),
        apiKeyMasked: SUPABASE_KEY ? `${SUPABASE_KEY.slice(0, 10)}...${SUPABASE_KEY.slice(-6)}` : 'Not Set'
      },
      message: tablesReady
        ? 'Tabel Supabase terdeteksi dan siap digunakan.'
        : 'Koneksi ke Supabase aktif, namun tabel database belum dibuat. Silakan salin & jalankan skrip SQL di Supabase SQL Editor.',
      sqlScript: SQL_INIT_SCRIPT
    });
  } catch (err) {
    console.error('Error checking Supabase status:', err);
    res.status(500).json({
      connected: false,
      tablesReady: false,
      error: err.message,
      project: {
        id: SUPABASE_PROJECT_ID,
        name: SUPABASE_PROJECT_NAME,
        url: SUPABASE_URL
      },
      sqlScript: SQL_INIT_SCRIPT
    });
  }
});

// API: Tarik (Pull) data dari Supabase
app.get('/api/supabase/pull', async (req, res) => {
  try {
    const supabase = getSupabase();

    // 1. Coba baca dari tabel simak_store
    const { data: storeRows, error: storeError } = await supabase
      .from('simak_store')
      .select('key, data, updated_at');

    if (!storeError && Array.isArray(storeRows) && storeRows.length > 0) {
      const result = {};
      storeRows.forEach(row => {
        result[row.key] = row.data;
      });

      return res.json({
        success: true,
        source: 'simak_store',
        data: result,
        updatedAt: storeRows[0]?.updated_at || new Date().toISOString()
      });
    }

    // 2. Coba baca dari tabel relasional jika simak_store kosong atau belum dibuat
    const safeQuery = async (queryPromise) => {
      try {
        const res = await queryPromise;
        return res;
      } catch (err) {
        return { data: null, error: err };
      }
    };

    const [wargaRes, kasRes, iuranRes, pengumumanRes, kontakRes, configRes] = await Promise.all([
      safeQuery(supabase.from('warga').select('*')),
      safeQuery(supabase.from('kas').select('*')),
      safeQuery(supabase.from('iuran').select('*')),
      safeQuery(supabase.from('pengumuman').select('*')),
      safeQuery(supabase.from('kontak').select('*')),
      safeQuery(supabase.from('system_config').select('*').limit(1))
    ]);

    const hasAnyTable = (wargaRes.data && !wargaRes.error) || (kasRes.data && !kasRes.error);

    if (hasAnyTable) {
      const structuredData = {};
      if (wargaRes.data) structuredData.warga = wargaRes.data;
      if (kasRes.data) structuredData.kas = kasRes.data;
      if (pengumumanRes.data) structuredData.pengumuman = pengumumanRes.data;
      if (kontakRes.data) structuredData.kontak = kontakRes.data;
      if (configRes.data && configRes.data[0]) {
        const c = configRes.data[0];
        structuredData.config = {
          namaKomplek: c.nama_komplek,
          alamatKomplek: c.alamat_komplek,
          nominalIuranDefault: Number(c.nominal_iuran_default) || 50000
        };
      }
      if (iuranRes.data) {
        const iuranMatrix = {};
        iuranRes.data.forEach(item => {
          if (!iuranMatrix[item.tahun]) iuranMatrix[item.tahun] = {};
          iuranMatrix[item.tahun][item.warga_id] = item.status_bulan;
        });
        structuredData.iuran = iuranMatrix;
      }

      return res.json({
        success: true,
        source: 'relational',
        data: structuredData
      });
    }

    // Jika tabel belum ada atau kosong
    return res.json({
      success: false,
      tablesExist: false,
      message: 'Belum ada data di cloud atau tabel Supabase belum diinisialisasi.'
    });
  } catch (err) {
    console.error('Error pulling Supabase data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Simpan / Sinkronkan (Push) data ke Supabase
app.post('/api/supabase/push', async (req, res) => {
  try {
    const supabase = getSupabase();
    const payload = req.body || {};

    const {
      systemConfig,
      adminUsers,
      wargaData,
      iuranData,
      kasData,
      pengumumanData,
      kontakData
    } = payload;

    const itemsToUpsert = [];
    if (systemConfig) itemsToUpsert.push({ key: 'config', data: systemConfig, updated_at: new Date().toISOString() });
    if (adminUsers) itemsToUpsert.push({ key: 'admins', data: adminUsers, updated_at: new Date().toISOString() });
    if (wargaData) itemsToUpsert.push({ key: 'warga', data: wargaData, updated_at: new Date().toISOString() });
    if (iuranData) itemsToUpsert.push({ key: 'iuran', data: iuranData, updated_at: new Date().toISOString() });
    if (kasData) itemsToUpsert.push({ key: 'kas', data: kasData, updated_at: new Date().toISOString() });
    if (pengumumanData) itemsToUpsert.push({ key: 'pengumuman', data: pengumumanData, updated_at: new Date().toISOString() });
    if (kontakData) itemsToUpsert.push({ key: 'kontak', data: kontakData, updated_at: new Date().toISOString() });

    // 1. Simpan ke simak_store jika tabel tersedia
    let storeSaved = false;
    if (itemsToUpsert.length > 0) {
      const { error: storeError } = await supabase
        .from('simak_store')
        .upsert(itemsToUpsert, { onConflict: 'key' });

      if (!storeError) {
        storeSaved = true;
      } else {
        console.warn('Upsert to simak_store note:', storeError.message);
      }
    }

    // 2. Jika tabel relasional ada, coba sinkronkan juga tabel warga & kas
    let relationalSaved = false;
    if (Array.isArray(wargaData) && wargaData.length > 0) {
      try {
        const wargaRows = wargaData.map(w => ({
          id: String(w.id),
          nama: String(w.nama || ''),
          blok: String(w.blok || ''),
          status: String(w.status || 'Tetap'),
          anggota: Number(w.anggota || 1),
          telp: String(w.telp || '')
        }));
        const { error: wErr } = await supabase.from('warga').upsert(wargaRows, { onConflict: 'id' });
        if (!wErr) relationalSaved = true;
      } catch (e) {
        // Silently proceed
      }
    }

    if (Array.isArray(kasData) && kasData.length > 0) {
      try {
        const kasRows = kasData.map(k => ({
          id: String(k.id),
          tahun: Number(k.tahun),
          bulan: Number(k.bulan),
          tanggal: String(k.tanggal),
          tipe: String(k.tipe),
          kategori: String(k.kategori),
          nominal: Number(k.nominal),
          keterangan: String(k.keterangan || '')
        }));
        await supabase.from('kas').upsert(kasRows, { onConflict: 'id' });
      } catch (e) {
        // Silently proceed
      }
    }

    if (storeSaved || relationalSaved) {
      return res.json({
        success: true,
        message: 'Data berhasil disinkronkan ke Supabase Cloud!',
        syncedAt: new Date().toISOString()
      });
    }

    // Jika belum ada tabel sama sekali
    return res.status(400).json({
      success: false,
      tablesReady: false,
      message: 'Tabel database di Supabase belum dibuat. Silakan salin skrip SQL inisialisasi pada tab Konfigurasi > Supabase Cloud dan jalankan di SQL Editor Supabase Anda.',
      sqlScript: SQL_INIT_SCRIPT
    });
  } catch (err) {
    console.error('Error pushing data to Supabase:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Ambil Skrip SQL Inisialisasi
app.get('/api/supabase/sql', (req, res) => {
  res.json({ sql: SQL_INIT_SCRIPT });
});

// Serve static assets from root directory
app.use(express.static(__dirname));

// Single Page Application fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Connected to Supabase Project: ${SUPABASE_PROJECT_NAME} (${SUPABASE_PROJECT_ID})`);
});
