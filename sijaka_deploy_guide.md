# 🚀 Panduan Deploy SiJaka ke Hostinger VPS
## Subdomain: `sijakadev.uppmaccinibaji.org`

> [!IMPORTANT]
> Aplikasi SiJaka memiliki backend **Node.js + MySQL**. Ini **wajib** menggunakan **Hostinger VPS** (bukan Shared Hosting). Shared hosting tidak bisa menjalankan Node.js.

---

## 📋 Prasyarat

| Kebutuhan | Keterangan |
|---|---|
| **Paket Hostinger** | VPS (minimal KVM 1) |
| **Subdomain** | `sijakadev.uppmaccinibaji.org` |
| **Domain utama** | `uppmaccinibaji.org` harus sudah aktif di Hostinger |
| **OS VPS** | Ubuntu 22.04 LTS (direkomendasikan) |

---

## BAGIAN 1 — Persiapan di Hostinger Panel

### Langkah 1: Beli/Aktifkan VPS Hostinger
1. Login ke **hPanel** → [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Pilih menu **VPS** → Order VPS minimal paket **KVM 1**
3. Pilih OS: **Ubuntu 22.04**
4. Catat **IP Publik VPS**, **root password**, dan **port SSH (default: 22)**

### Langkah 2: Buat Subdomain DNS
1. Di hPanel → **Domain** → pilih `uppmaccinibaji.org`
2. Klik **DNS Zone** → **Add Record**
3. Tambahkan record:
   ```
   Type : A
   Name : sijakadev
   Points to : [IP_PUBLIK_VPS_ANDA]
   TTL  : 3600
   ```
4. Tunggu propagasi DNS (biasanya 5–30 menit)

---

## BAGIAN 2 — Setup VPS (via SSH dari Mac)

Buka **Terminal** di Mac dan jalankan perintah berikut satu per satu:

### Langkah 3: Koneksi ke VPS
```bash
ssh root@IP_PUBLIK_VPS_ANDA
```
Masukkan password root VPS saat ditanya.

### Langkah 4: Update sistem & install dependencies
```bash
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx ufw
```

### Langkah 5: Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # Harus muncul v20.x.x
npm -v
```

### Langkah 6: Install MySQL
```bash
apt install -y mysql-server
mysql_secure_installation
# Ikuti wizard: set root password, hapus user anonim, nonaktifkan remote root login
```

Buat database & user:
```bash
mysql -u root -p
```
```sql
CREATE DATABASE sijaka_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sijaka_user'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON sijaka_db.* TO 'sijaka_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Langkah 7: Install PM2 (process manager Node.js)
```bash
npm install -g pm2
```

---

## BAGIAN 3 — Deploy Kode ke VPS

### Langkah 8: Upload kode proyek
Dari **Mac Anda** (terminal baru, jangan tutup SSH):
```bash
# Di Mac, bukan di VPS
scp -r /Users/abichoy/Documents/sijakadev2 root@IP_VPS:/var/www/sijaka
```
Atau gunakan **Git** jika proyek sudah di GitHub:
```bash
# Di VPS
mkdir -p /var/www/sijaka
cd /var/www/sijaka
git clone https://github.com/USERNAME/sijakadev2.git .
```

### Langkah 9: Setup Backend
```bash
cd /var/www/sijaka/backend
npm install
```

Buat file [.env](file:///Users/abichoy/Documents/sijakadev2/backend/.env) untuk produksi:
```bash
nano .env
```
Isi dengan:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=sijaka_user
DB_PASSWORD=GANTI_PASSWORD_KUAT
DB_NAME=sijaka_db
DB_DIALECT=mysql
JWT_SECRET=BUAT_JWT_SECRET_ACAK_PANJANG_MIN_32_KARAKTER
```
Simpan: `Ctrl+O` → Enter → `Ctrl+X`

Import database (jika ada dump SQL):
```bash
mysql -u sijaka_user -p sijaka_db < /var/www/sijaka/database/dump.sql
```

Jalankan backend dengan PM2:
```bash
cd /var/www/sijaka/backend
pm2 start server.js --name sijaka-backend
pm2 save
pm2 startup   # Ikuti perintah yang ditampilkan untuk auto-start
```

### Langkah 10: Build Frontend
```bash
cd /var/www/sijaka/frontend
npm install
```

Update URL API di frontend dari `localhost:3000` ke domain produksi. **Ini langkah kritis!**

```bash
# Ganti semua localhost:3000 ke URL API produksi
grep -r "localhost:3000" /var/www/sijaka/frontend/src --include="*.jsx" --include="*.js" -l
```

Cara tercepat — buat `.env.production`:
```bash
nano /var/www/sijaka/frontend/.env.production
```
```env
VITE_API_URL=https://sijakadev.uppmaccinibaji.org/api
```

> [!WARNING]
> Kemudian Anda perlu mengubah semua `http://localhost:3000/api/...` di kode frontend menjadi `${import.meta.env.VITE_API_URL}/...` agar URL otomatis diganti saat build produksi. Lihat Bagian 5 untuk cara cepatnya.

Build produksi:
```bash
npm run build
# Hasil build ada di: /var/www/sijaka/frontend/dist
```

---

## BAGIAN 4 — Konfigurasi Nginx

### Langkah 11: Buat konfigurasi Nginx
```bash
nano /etc/nginx/sites-available/sijaka
```

Salin konfigurasi ini:
```nginx
server {
    listen 80;
    server_name sijakadev.uppmaccinibaji.org;

    # Frontend (React build)
    root /var/www/sijaka/frontend/dist;
    index index.html;

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API ke backend Node.js
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static uploads (foto profil dll)
    location /uploads/ {
        alias /var/www/sijaka/backend/uploads/;
    }
}
```

Aktifkan site:
```bash
ln -s /etc/nginx/sites-available/sijaka /etc/nginx/sites-enabled/
nginx -t    # Test konfigurasi, harus "test is successful"
systemctl reload nginx
```

### Langkah 12: Install SSL Certificate (HTTPS gratis)
```bash
certbot --nginx -d sijakadev.uppmaccinibaji.org
# Ikuti wizard: masukkan email, setuju syarat, pilih redirect HTTP→HTTPS
```

certbot akan otomatis memperbarui konfigurasi Nginx untuk HTTPS.

### Langkah 13: Konfigurasi Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## BAGIAN 5 — Fix URL API Frontend (Wajib!)

Sebelum build, ganti semua hardcoded `localhost:3000` dengan environment variable.

Di **Mac**, jalankan:
```bash
find /Users/abichoy/Documents/sijakadev2/frontend/src -type f \( -name "*.jsx" -o -name "*.js" \) \
  -exec sed -i '' 's|http://localhost:3000|${import.meta.env.VITE_API_URL}|g' {} +
```

> [!CAUTION]
> Perintah `sed` di atas mengedit file secara massal. Pastikan ada backup atau commit ke Git terlebih dahulu sebelum menjalankannya.

Lalu buat file `.env.production`:
```bash
echo "VITE_API_URL=https://sijakadev.uppmaccinibaji.org" > /Users/abichoy/Documents/sijakadev2/frontend/.env.production
```

Build ulang:
```bash
cd /Users/abichoy/Documents/sijakadev2/frontend
npm run build
```
Upload hasil build ke VPS:
```bash
scp -r dist root@IP_VPS:/var/www/sijaka/frontend/
```

---

## BAGIAN 6 — Verifikasi & Pemeliharaan

### Cek status semua service:
```bash
# Di VPS
pm2 status                    # Backend Node.js
systemctl status nginx        # Nginx
systemctl status mysql        # MySQL
```

### Log backend:
```bash
pm2 logs sijaka-backend
```

### Update kode (deploy ulang):
```bash
cd /var/www/sijaka
git pull                           # Tarik perubahan terbaru
cd backend && npm install          # Install dependency baru jika ada
pm2 restart sijaka-backend         # Restart backend

cd ../frontend && npm install
npm run build                      # Build ulang frontend
```

---

## 📊 Ringkasan Arsitektur Produksi

```
Browser Pengguna
       │
       ▼
sijakadev.uppmaccinibaji.org (HTTPS:443)
       │
       ▼
   Nginx (Reverse Proxy)
   ├── /          → /var/www/sijaka/frontend/dist (React SPA)
   ├── /api/*     → localhost:3000 (Node.js Express)
   └── /uploads/* → /var/www/sijaka/backend/uploads/
                           │
                           ▼
                    Node.js + PM2 (port 3000)
                           │
                           ▼
                      MySQL Database
```

---

## ❓ Butuh Bantuan Lebih?

Jika Anda mengalami kendala di langkah tertentu, beritahu saya dan saya akan bantu debug lebih lanjut. Langkah yang paling sering bermasalah biasanya:

1. **DNS belum propagasi** → tunggu hingga 30 menit
2. **Error MySQL** → pastikan password dan nama DB benar
3. **URL masih localhost** → pastikan `.env.production` sudah benar dan build ulang
4. **PM2 backend tidak jalan** → cek `pm2 logs sijaka-backend` untuk error detail
