# Project Requirements Document (PRD): SiJaka

**Nama Aplikasi:** SiJaka - Sistem Informasi Jaket Keselamatan Kapal  
**Versi Dasar:** 2.0.0  
**Tujuan:** Pendigitalisasian manajemen inventaris, sirkulasi peminjaman, dan kepatuhan penggunaan jaket keselamatan di dermaga/pelabuhan.

---

## 1. Pendahuluan & Gambaran Umum
Aplikasi SiJaka dirancang untuk menyelesaikan masalah klasik dalam manajemen peralatan keselamatan maritim, khususnya jaket keselamatan (life jackets). Sebelum ada SiJaka, pendataan jumlah stok, kondisi jaket, dan siapa yang meminjam seringkali dilakukan secara manual atau tidak terdata dengan baik.

**Masalah yang Diselesaikan:**
*   **Ketidakpastian Stok:** Mengetahui secara real-time berapa banyak jaket yang tersedia, sedang dipinjam, atau rusak.
*   **Pelacakan Kepatuhan:** Memastikan setiap kapal yang berangkat membawa jumlah jaket yang sesuai dengan kapasitas penumpangnya (sesuai standar keselamatan).
*   **Akuntabilitas Nakhoda:** Mendata secara digital nakhoda yang bertanggung jawab atas jaket yang dipinjam.
*   **Mitos Keselamatan:** Mengedukasi nakhoda dan penumpang mengenai pentingnya jaket keselamatan melalui pendekatan budaya lokal (bahasa daerah).

---

## 2. Peran Pengguna (User Roles)
Berdasarkan analisis teknis pada `AuthContext.jsx` dan `init_db.sql`:

| Role | Deskripsi & Hak Akses |
| :--- | :--- |
| **Admin** | Hak akses penuh (Full Privileges). Dapat mengelola user (CRUD User), melihat audit log sistem, serta melakukan seluruh fungsi operasional. |
| **Petugas** | Hak akses operasional. Melakukan manajemen data kapal, nakhoda, inventaris, dan memproses transaksi (Check-out/Check-in). Tidak dapat mengakses menu Pengaturan/Manajemen User. |

---

## 3. Kebutuhan Fungsional per Menu (Detail Technical)

### A. Dashboard Monitoring
*   **Fungsi:** Menyajikan ringkasan visual real-time dari seluruh ekosistem SiJaka.
*   **Alur Kerja:** Saat login, user langsung diarahkan ke statistik utama.
*   **Logika Bisnis:**
    *   **Statistik Stok:** Menghitung jumlah jaket berdasarkan status (`baik`, `dipinjam`, `rusak`, `hilang`).
    *   **Peminjaman Hari Ini:** Menghitung transaksi dengan `waktu_checkout` pada tanggal hari ini.
    *   **Peringatan Kepatuhan:** Menampilkan daftar kapal yang belum kembali melampaui batas waktu (72 jam).
*   **UI/UX:** Menggunakan Chart.js untuk visualisasi batang dan Fab (Floating Action Button) untuk akses cepat ke menu Check-out.

### B. Manajemen Kapal & Nakhoda
*   **Fungsi:** Pendataan armada dan pemimpin kapal.
*   **Logika Bisnis:**
    *   **Kapal:** Menyimpan data `kapasitas_penumpang` yang menjadi dasar perhitungan otomatis jumlah jaket yang wajib dipinjam.
    *   **Nakhoda:** Setiap nakhoda wajib terhubung ke satu kapal (`kapal_id`).
    *   **Validasi:** Nama kapal dan nakhoda harus unik untuk menghindari duplikasi data.

### C. Manajemen Inventaris (Life Jackets)
*   **Fungsi:** Pencatatan setiap unit jaket keselamatan.
*   **Workflow:** Setiap jaket diberi `kode_jaket` unik (mendukung sistem scanning).
*   **Kondisi Bisnis:** Status jaket otomatis berubah menjadi `dipinjam` saat proses Check-out dan kembali ke status hasil input (`baik`/`rusak`/`hilang`) saat Check-in.

### D. Transaksi CHECK-OUT (Pinjam Baru)
*   **Workflow:**
    1.  Cari Nakhoda/Kapal (via dropdown atau scan).
    2.  Pilih unit jaket (Dewasa & Anak).
    3.  Persetujuan Pakta Integritas.
    4.  Submit Transaksi.
*   **Logika Bisnis & Validasi:**
    *   **Active Loan Block:** Sistem akan menolak peminjaman jika Nakhoda atau Kapal tersebut masih memiliki status transaksi `dipinjam`.
    *   **Auto-Calculation:** 
        *   Kebutuhan Dewasa = `ceil(Kapasitas * 1.25)`
        *   Kebutuhan Anak = `ceil(Kapasitas * 0.10)`
    *   **Limit Validation:** Sistem memberikan peringatan jika jumlah jaket yang dipilih melebihi atau kurang dari kuota yang dihitung.
*   **Stabilisasi Error:** Menggunakan Database Transaction (Atomicity); jika penulisan detail jaket gagal, maka header transaksi dibatalkan (rollback).

### E. Transaksi CHECK-IN (Kembali)
*   **Workflow:** User memilih transaksi aktif dari list Monitoring Peminjaman, lalu menginput kondisi setiap jaket yang dikembalikan.
*   **Logika Bisnis:** 
    *   Jika jaket dilaporkan `rusak` atau `hilang` saat kembali, sistem akan memperbarui master data `inventaris` secara permanen ke status tersebut.

### F. Edukasi Maritim (Multi-Bahasa)
*   **Fitur Unik:** Menyediakan panduan keselamatan dalam 3 bahasa: **Indonesia, Bugis, dan Makassar**.
*   **Tujuan:** Menghilangkan hambatan komunikasi dan mitos "Pammali" (larangan adat) melalui pendekatan kearifan lokal.

---

## 4. Sistem Notifikasi & Alert
Aplikasi menggunakan sistem pemberitahuan pasif dan aktif:
1.  **Alert Batas Waktu (Overdue):** Jika transaksi > 72 jam belum Check-in, baris data akan berubah warna menjadi MERAH.
2.  **Stok Alert:** Visualisasi di dashboard menonjolkan jumlah jaket `rusak/hilang`.
3.  **Active Loan Warning:** Pop-up modal "Blokir Peminjaman" muncul jika terdeteksi kapal/nakhoda meminjam sebelum mengembalikan unit sebelumnya.

---

## 5. Fitur Pelaporan & Ekspor Data
Modul Laporan (`Laporan.jsx`) adalah pusat rekapitulasi data:
*   **Output Format:** PDF (jsPDF) dan Excel (XLSX).
*   **Kategori Laporan:** Riwayat Transaksi, Transaksi Aktif, Data Fleet, Inventaris, dan Audit Logs.

---

## 6. Arsitektur Data & Teknis
### Tech Stack:
*   **Frontend:** React (Vite), MUI, Lucide-react.
*   **Backend:** Node.js, Express.js.
*   **Database:** MySQL dengan Sequelize ORM.
*   **Security:** JWT & Bcrypt.

### Skema Database Utama:
*   `users`, `kapal`, `nakhoda`, `inventaris`, `transaksi_peminjaman`, `transaksi_jaket`, `audit_logs`.

---

## 7. Kebutuhan Non-Fungsional
*   **Keamanan (Security):** `Bearer Token` mandatory, hash password via Bcrypt, audit logs.
*   **Responsivitas (UI/UX):** Modern design, smooth transitions, mobile-friendly layout.
*   **Performa:** Client-side filtering dengan `useMemo` untuk efisiensi render data besar.
