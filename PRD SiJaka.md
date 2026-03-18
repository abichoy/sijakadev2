# **Project Requirements Document (PRD): SiJaka**
**Sistem Informasi Jaket Keselamatan Kapal**

---

## **1. Pendahuluan & Gambaran Umum**
### **Tujuan Utama**
SiJaka adalah platform manajemen inventaris dan sirkulasi jaket keselamatan (*Life Jacket*) yang dirancang khusus untuk otoritas pelabuhan (seperti UPP Kelas II Maccini Baji). Fokus utama aplikasi ini adalah untuk mendigitalisasi proses peminjaman jaket oleh nakhoda kapal tradisional guna memastikan standar keselamatan maritim terpenuhi.

### **Masalah yang Diselesaikan**
*   **Overloading Pencegahan:** Menghitung otomatis kuota jaket berdasarkan kapasitas penumpang sesuai standar SOLAS (125% dewasa, 10% anak).
*   **Pelacakan Inventaris:** Mencegah hilangnya aset negara dengan mencatat status setiap unit jaket (Baik, Dipinjam, Rusak, Hilang).
*   **Kepatuhan (Compliance):** Memonitor nakhoda atau kapal yang belum mengembalikan jaket melebihi batas waktu (72 jam).
*   **Transparansi Pelaporan:** Menyediakan audit log dan laporan ekspor (PDF/Excel) untuk kebutuhan birokrasi dan pengawasan.

---

## **2. Peran Pengguna (User Roles)**

| Peran | Hak Akses (Privileges) |
| :--- | :--- |
| **Admin** | Akses penuh seluruh sistem, manajemen pengguna (CRUD), manajemen data master (Kapal, Nakhoda, Inventaris), akses pusat laporan, dan pengaturan sistem. |
| **Petugas** (Pangkalan) | Melakukan operasional harian: Check-out (Peminjaman), Check-in (Pengembalian), melihat dashboard monitoring, dan manajemen data master terbatas. |

---

## **3. Kebutuhan Fungsional per Menu**

### **A. Dashboard Monitoring**
*   **Workflow:** User melihat ringkasan statistik (Tersedia, Dipinjam, Rusak/Hilang) dan grafik tren peminjaman.
*   **Logika Bisnis:** 
    *   Statistik ditarik secara *real-time* dari tabel `inventaris` dan `transaksi_peminjaman`.
    *   Menampilkan daftar "Kepatuhan" yang menyaring transaksi dengan status `dipinjam` dan `batas_waktu < CURRENT_TIMESTAMP`.
*   **Penanganan Error:** Validasi koneksi database sebelum memuat grafik Chart.js.

### **B. Manajemen Data (Kapal, Nakhoda, Inventaris)**
*   **Workflow:** CRUD (Create, Read, Update, Delete) data pendukung.
*   **Logika Bisnis:**
    *   **Nakhoda:** Setiap nakhoda harus terhubung dengan satu kapal (`kapal_id`).
    *   **Inventaris:** Kode jaket harus unik. Setiap perubahan status jaket di modul peminjaman akan otomatis mengupdate tabel `inventaris`.
    *   **Audit Log:** Setiap aksi CREATE, UPDATE, atau DELETE dicatat ke tabel `audit_logs` (User, Aksi, Target, Timestamp).
*   **Validasi:** Penghapusan kapal/nakhoda akan diblokir jika masih memiliki transaksi peminjaman aktif.

### **C. Menu Peminjaman (Check-Out)**
*   **Workflow:** Pilih Nakhoda/Kapal → Pilih unit jaket (Scan/Manual) → Tanda Tangan Digital → Submit.
*   **Logika Bisnis (Kritis):**
    *   **Anti-Double Loan:** Sistem mengecek tabel `transaksi_peminjaman`. Jika Nakhoda atau Kapal tersebut sedang dalam status `dipinjam`, peminjaman baru ditolak dengan pesan error detail.
    *   **SOLAS Validation:** `Max Dewasa = Kapasitas * 1.25`, `Max Anak = Kapasitas * 0.10`. Input melebihi kuota akan diblokir.
    *   **Batas Waktu:** Otomatis menetapkan `batas_waktu` 72 jam (3 hari) dari waktu check-out.
*   **Error Handling:** Menggunakan `Sequelize Transaction`; jika gagal di tengah jalan (misal update status jaket gagal), maka transaksi peminjaman dibatalkan otomatis (*Rollback*).

### **D. Menu Pengembalian (Check-In)**
*   **Workflow:** Pilih transaksi aktif → Masukkan kondisi jaket saat kembali (Baik/Rusak/Hilang) → Submit.
*   **Logika Bisnis:**
    *   Mengubah status transaksi menjadi `selesai`.
    *   Mengupdate kondisi unit jaket di tabel master secara individu berdasarkan input petugas.
    *   Mencatat `catatan` jika terjadi kerusakan atau kehilangan.

---

## **4. Sistem Notifikasi & Alert**

1.  **Peringatan Kepatuhan (Radar Dashboard):** 
    *   **Trigger:** Transaksi yang melewati 72 jam.
    *   **Tampilan:** Card merah pada dashboard yang menampilkan nama Kapal dan jumlah jaket yang tertahan.
2.  **Validasi Stok:** 
    *   **Trigger:** Mencoba meminjam jaket dengan kondisi `rusak` atau `dipinjam`.
    *   **Penyelesaian:** Filter otomatis di sisi backend (`peminjamanController.js`) hanya mengizinkan jaket kondisi `baik`.

---

## **5. Fitur Pelaporan & Ekspor Data**

Aplikasi menggunakan library `jspdf`, `jspdf-autotable`, dan `xlsx` untuk pengolahan data.

| Nama Laporan | Format | Data yang Diterangkum |
| :--- | :--- | :--- |
| **Riwayat Transaksi** | Excel | Seluruh log pinjam-kembali beserta durasi dan petugas. |
| **Laporan Kepatuhan** | PDF/Excel | Daftar nakhoda "nakal" yang sering terlambat atau saat ini sedang terlambat. |
| **Data Inventaris** | PDF | Daftar aset berdasarkan lokasi gudang dan kondisi fisik terbaru. |
| **Log Aktivitas** | PDF | Jejak audit penggunaan sistem untuk akuntabilitas (Khusus Admin). |

---

## **6. Arsitektur Data & Teknis**

### **Tech Stack**
*   **Frontend:** React.js, Vite (Fast Build), Tailwind CSS v4 (Styling), MUI (Components).
*   **Backend:** Node.js, Express.js.
*   **ORM:** Sequelize (MySQL).
*   **Auth:** JWT (JSON Web Token) dengan penyimpanan `localStorage`.

### **Skema Database Utama**
*   `users`: ID, Username, Password (Bcrypt), Role, Avatar.
*   `kapal`: ID, Nama, Pemilik, Kapasitas.
*   `nakhoda`: ID, Nama, Foto, Kontak, Kapal_ID (FK).
*   `inventaris`: ID, Kode_Seri, Jenis (Dewasa/Anak), Kondisi, Lokasi.
*   `transaksi_peminjaman`: ID, Nakhoda_ID, Kapal_ID, Status, Batas_Waktu, TTD_Digital.
*   `audit_logs`: ID, User_ID, Action, Module, Detail.

---

## **7. Kebutuhan Non-Fungsional**

*   **Keamanan:** 
    *   *Password Hashing* menggunakan `bcryptjs` (Cost factor: 10).
    *   API dilindungi middleware `authMiddleware` untuk mengecek validitas JWT.
*   **Responsivitas:** Layout menggunakan sistem *Side Navigation* yang responsif (Sidebar hilang di mobile, diganti tombol menu).
*   **Performa:** 
    *   Optimasi *query* menggunakan `include` (Eager Loading) pada Sequelize untuk meminimalisir N+1 problem.
    *   Frontend menggunakan `useMemo` dan `useEffect` untuk efisiensi render data tabel besar.
