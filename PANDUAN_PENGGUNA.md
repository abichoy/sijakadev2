# 📘 Panduan Pengguna SiJaka
**Sistem Informasi Jaket Keselamatan**

SiJaka adalah platform digital yang dirancang untuk UPP Kelas II Maccini Baji guna mengelola sirkulasi peminjaman jaket keselamatan (life jacket) bagi kapal-kapal tradisional (Jolloro) di wilayah Kabupaten Pangkep.

---

## 🚀 1. Memulai Aplikasi

### Login ke Sistem
1. Buka browser dan arahkan ke domain aplikasi.
2. Masukkan **Username** dan **Password** Anda.
   - **Admin**: Akses penuh ke semua fitur dan manajemen user.
   - **Petugas**: Akses untuk transaksi peminjaman dan pengembalian.
3. Klik tombol **Masuk**.

---

## 📊 2. Dashboard: Overview Operasional
Dashboard memberikan ringkasan status keamanan laut saat ini:
- **Total Kapal & Nakhoda**: Jumlah aset yang terdaftar.
- **Jaket Tersedia**: Stok fisik jaket di pangkalan.
- **Peringatan (Alerts)**: Daftar kapal yang belum mengembalikan jaket melebihi batas waktu yang ditentukan.
- **Statistik Bulanan**: Grafik tren peminjaman.

---

## ⚓ 3. Manajemen Data Master
Sebelum melakukan transaksi, pastikan data pendukung telah terinput dengan benar.

### a. Data Kapal
- Menu: `Master Data` > `Kapal`.
- Digunakan untuk mencatat spesifikasi kapal (GT, Kapasitas Penumpang).
- **Penting**: Kapasitas kapal menentukan batas maksimal (limit) peminjaman jaket keselamatan secara otomatis oleh sistem.

### b. Data Nakhoda
- Menu: `Master Data` > `Nakhoda`.
- Masukkan identitas nakhoda penanggung jawab kapal.

### c. Inventaris (Jaket)
- Menu: `Master Data` > `Inventaris`.
- Daftarkan ID unik setiap jaket keselamatan untuk pelacakan yang akurat.

---

## 🔄 4. Alur Transaksi (Fitur Inti)

### A. Peminjaman (Check-out)
Alur ini dilakukan sebelum kapal berangkat:
1. Klik menu **Peminjaman** > **Pinjam Baru**.
2. **Scan QR Code**: Arahkan kamera ke QR Code Kapal atau masukkan ID Kapal secara manual.
3. **Pilih Jaket**: Pilih jaket yang akan dipinjam (sistem akan memvalidasi apakah jumlah sesuai dengan limit kapasitas kapal).
4. **Tanda Tangan Digital**: Nakhoda memberikan tanda tangan langsung pada layar perangkat sebagai bukti komitmen pengembalian.
5. Klik **Konfirmasi Peminjaman**.

### B. Pengembalian (Check-in)
Alur ini dilakukan saat kapal kembali ke dermaga:
1. Klik menu **Peminjaman** > **Check-in (Kembali)**.
2. Cari data kapal berdasarkan nama atau scan QR Code kapal.
3. Verifikasi jumlah jaket yang dikembalikan.
4. Klik **Konfirmasi Pengembalian** untuk mengembalikan stok ke inventaris pangkalan.

---

## 🎓 5. Modul Edukasi: "Seragam Pelaut Hebat"
Misi SiJaka adalah mengubah budaya keselamatan.
- Akses menu **Edukasi**.
- Temukan poster dan video instruksi penggunaan jaket keselamatan.
- Tersedia dalam **Bahasa Indonesia, Bugis, dan Makassar** untuk memudahkan edukasi ke masyarakat lokal.

---

## 📋 6. Laporan
- Menu **Laporan** memungkinkan Admin untuk mengunduh rekapitulasi data.
- Filter laporan berdasarkan rentang tanggal atau status (Sedang Dipinjam / Sudah Kembali).
- Laporan dapat digunakan sebagai bahan evaluasi kepatuhan keselamatan mingguan.

---

## ⚙️ 7. Pengaturan Profil
- Klik ikon profil di pojok kanan atas.
- Anda dapat mengubah foto profil, informasi kontak, dan yang paling penting adalah **Mengubah Password** secara berkala untuk menjaga keamanan akun Anda.

---

> [!TIP]
> **Tips Keamanan**: Selalu lakukan *Logout* setelah selesai bertugas, terutama jika menggunakan perangkat bersama di pangkalan.

> [!IMPORTANT]
> Sistem akan memblokir transaksi jika data GT Kapal belum lengkap atau jika Nakhoda memiliki riwayat "Blacklist" karena keterlambatan pengembalian yang ekstrem.
