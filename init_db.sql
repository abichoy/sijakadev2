CREATE DATABASE IF NOT EXISTS sijaka_db;
USE sijaka_db;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('petugas','admin') NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kapal (
  id CHAR(36) PRIMARY KEY,
  nama_kapal VARCHAR(100) NOT NULL,
  pemilik VARCHAR(100) NOT NULL,
  alamat_pulau VARCHAR(100) NOT NULL,
  kapasitas_penumpang INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nakhoda (
  id CHAR(36) PRIMARY KEY,
  nama_lengkap VARCHAR(100) NOT NULL,
  foto TEXT,
  kontak VARCHAR(20),
  kapal_id CHAR(36),
  riwayat_kepatuhan JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kapal_id) REFERENCES kapal(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inventaris (
  id CHAR(36) PRIMARY KEY,
  kode_jaket VARCHAR(50) UNIQUE NOT NULL,
  jenis ENUM('dewasa','anak') NOT NULL,
  kondisi ENUM('baik','rusak','hilang','dipinjam') DEFAULT 'baik',
  lokasi_penyimpanan VARCHAR(100) DEFAULT 'Jembatan Baru',
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaksi_peminjaman (
  id CHAR(36) PRIMARY KEY,
  nakhoda_id CHAR(36),
  kapal_id CHAR(36),
  waktu_checkout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  waktu_checkin TIMESTAMP NULL,
  jumlah_dewasa_dipinjam INT NOT NULL,
  jumlah_anak_dipinjam INT NOT NULL,
  ttd_digital TEXT,
  status ENUM('dipinjam','selesai','terlambat') DEFAULT 'dipinjam',
  batas_waktu TIMESTAMP NULL,
  FOREIGN KEY (nakhoda_id) REFERENCES nakhoda(id),
  FOREIGN KEY (kapal_id) REFERENCES kapal(id)
);

CREATE TABLE IF NOT EXISTS transaksi_jaket (
  id CHAR(36) PRIMARY KEY,
  transaksi_id CHAR(36),
  jaket_id CHAR(36),
  kondisi_saat_pinjam ENUM('baik','rusak','hilang') DEFAULT 'baik',
  kondisi_saat_kembali ENUM('baik','rusak','hilang') NULL,
  catatan TEXT,
  FOREIGN KEY (transaksi_id) REFERENCES transaksi_peminjaman(id) ON DELETE CASCADE,
  FOREIGN KEY (jaket_id) REFERENCES inventaris(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    username VARCHAR(100) NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'DELETE', 'DELETE_BLOCKED') NOT NULL,
    module VARCHAR(50) NOT NULL,
    target_id CHAR(36),
    target_label VARCHAR(200),
    detail TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Note: In MySQL 8+, UUID() can be used to generate ids or we can let Sequelize handle it.
-- Insert initial user
-- password = admin
INSERT IGNORE INTO users (id, username, password_hash, role) VALUES (
  UUID(), 'admin', '$2b$10$tXphmZpbZ2DnFblglkoQbe4AVm4G/CNEpD7KVAGkKQ4nNIWgwea4W', 'admin'
);
-- password = petugas
INSERT IGNORE INTO users (id, username, password_hash, role) VALUES (
  UUID(), 'petugas', '$2b$10$JOJbSha3gQnbhBrPciity.9XQWSdEGlbTWfgmRvDOadAAL3WXtBSO', 'petugas'
);
