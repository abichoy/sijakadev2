# SiJaka (Sistem Informasi Peminjaman Jaket Keselamatan)

SiJaka adalah aplikasi berbasis web yang didesain secara khusus untuk UPP Kelas II Maccini Baji, Kabupaten Pangkep, nhằm mengelola sirkulasi dan kepatuhan peminjaman jaket keselamatan pada nakhoda dan kapal-kapal motor tradisional (Jolloro).

Aplikasi ini mendigitalisasi peminjaman untuk mencegah overloading dan kehilangan aset. 

## Fitur Utama
- **Autentikasi (JWT)**: Dilengkapi dengan role berbasis admin dan petugas pangkalan.
- **Master Data Cepat**: Manajemen Kapal, Nakhoda, dan Inventaris menggunakan UUID relasional.
- **Validasi Kepatuhan Keselamatan**: Blokir limitasi SOLAS untuk dewasa maksimal `125%` dan anak maksimal `10%` dari kapasitas spesifikasi kapal. 
- **Peminjaman Tanpa Ketik (QR Code Flow)**: Memindai QR Code untuk identifikasi instan (Simulasi Scan diterapkan pada MVP ini), dilanjutkan dengan pengisian kuota, dan validasi persetujuan tanda tangan digital (e-signature).
- **Monitoring Kepatuhan (Radar)**: Dashboard analitik untuk melihat peringatan dini nakhoda yang terlambat mengembalikan inventaris negara.
- **Edukasi Multi-Bahasa**: Tampilan modul *"Seragam Pelaut Hebat"* yang menghancurkan mitos 'pammali' kedalam translasi lokal Bugis dan Makassar.

## Teknologi (Tech Stack)
- **Database**: MySQL/PostgreSQL
- **Backend**: Node.js v18+, Express.js, Sequelize ORM, JWT, Bcrypt.js
- **Frontend**: React.js v18+, Vite, Tailwind CSS v4, Material UI (MUI), Lucide Icons, Chart.js, React-Signature-Canvas.

## Cara Menjalankan Di Lokal (Development)

1. Pastikan database server aktif dan impor tabel melalui `init_db.sql`:
   ```bash
   mysql -u root -p < init_db.sql
   ```
2. Nyalakan Backend (Port 3000):
   ```bash
   cd backend
   npm install
   node server.js
   ```
3. Nyalakan Frontend (Port 5173):
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```

## Kredensial Uji Coba Default
- **Role Admin**: Username `admin` / Password `admin`
- **Role Petugas**: Username `petugas` / Password `petugas`

*Aplikasi ini siap dibawa untuk dipresentasikan dan di-deploy kapanpun menuju lingkungan produksi.*
