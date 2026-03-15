# Panduan Deployment SiJaka ke Hostinger VPS (Node.js + PostgreSQL/MySQL)

Ikuti langkah-langkah di bawah ini untuk mendeploy aplikasi SiJaka secara full-stack di VPS Hostinger dengan Ubuntu/Debian.

## 1. Prasyarat Server
- **Sistem Operasi**: Ubuntu 22.04 / 24.04 (direkomendasikan)
- Telah menginstall **Node.js** (v18+), **npm**, dan **Git**
- Telah menginstall database **PostgreSQL** atau **MySQL** (untuk contoh ini menggunakan MySQL, sesuai konfigurasi)
- Domain / Subdomain yang diarahkan ke IP VPS Anda (misal: `sijakadev.uppmaccinibaji.org`)

## 2. Setup Database di Server
1. Akses MySQL:
   ```bash
   sudo mysql -u root -p
   ```
2. Buat database `sijaka_db` dan load inisialisasi awal:
   ```bash
   CREATE DATABASE sijaka_db;
   exit;
   ```
3. Import script SQL yang telah disediakan:
   ```bash
   mysql -u root -p sijaka_db < init_db.sql
   ```

## 3. Clone Repository & Install Dependensi
```bash
# Clone source code dari Git atau copy via scp
git clone https://github.com/yourrepo/sijaka.git /var/www/sijaka
cd /var/www/sijaka

# Setup Backend
cd backend
npm install

# Setup Frontend
cd ../frontend
npm install
```

## 4. Konfigurasi Environment Variables
Di dalam folder `/var/www/sijaka/backend`, konfigurasi `.env`:
```text
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sijaka_db
DB_DIALECT=mysql
JWT_SECRET=rahasia_sijaka_super_aman_123!
```

## 5. Build Frontend
Pastikan environment untuk frontend juga telah terkonfigurasi (misal Vite `VITE_API_URL` jika ada).
```bash
cd /var/www/sijaka/frontend
npm run build
```
Hasil build akan berada di direktori `dist/`.

## 6. Menjalankan Backend dengan PM2
Agar backend berjalan terus-menerus sebagai service:
```bash
sudo npm install -g pm2
cd /var/www/sijaka/backend
pm2 start server.js --name "sijaka-api"
pm2 save
pm2 startup
```

## 7. Setup Nginx (Reverse Proxy & Static Files)
Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

Buat konfigurasi server block baru:
```bash
sudo nano /etc/nginx/sites-available/sijakadev.uppmaccinibaji.org
```
Isi konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name sijakadev.uppmaccinibaji.org;

    # Frontend Statics
    root /var/www/sijaka/frontend/dist;
    index index.html index.htm;

    # Redirect semua request frontend ke index.html (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy menuju Backend Express API (Port 3000)
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Reverse proxy ke folder uploads (jika foto nakhoda di serve static via express)
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
    }
}
```

Aktifkan konfigurasi:
```bash
sudo ln -s /etc/nginx/sites-available/sijakadev.uppmaccinibaji.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Konfigurasi SSL dengan Certbot (Let's Encrypt)
Pastikan DNS A Record sudah mengarah dari `sijakadev.uppmaccinibaji.org` ke IP Publik VPS Anda.
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d sijakadev.uppmaccinibaji.org
```

Selesai! Aplikasi Anda sudah dapat diakses via **https://sijakadev.uppmaccinibaji.org**.
