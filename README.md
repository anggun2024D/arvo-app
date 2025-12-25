# 🌟 ARVO – Academic & Productivity Dashboard

ARVO adalah aplikasi berbasis web yang dikembangkan untuk membantu mahasiswa dalam mengelola aktivitas akademik dan produktivitas sehari-hari. Sistem ini menyediakan fitur pengelolaan jadwal, pencatatan notulensi, pengaturan target/goals, serta dashboard analisis produktivitas yang informatif dan interaktif.

---

## 📌 Fitur Utama

### 🔐 Authentication

* Login system berbasis session
* Validasi kredensial
* Menyimpan session user
* Proteksi halaman utama

---

### 🏠 Dashboard

* Menampilkan statistik aktivitas
* Total jadwal, notes, dan goals
* Persentase progress
* Data aktivitas hari ini
* Mini calendar view
* Motivational quotes

---

### 📅 Manajemen Jadwal

CRUD (Create – Read – Update – Delete):

* Tambah jadwal
* Edit jadwal
* Hapus jadwal
* Kategori jadwal (kuliah, organisasi, tugas, pribadi)
* Priority level (low, medium, high)
* Integrasi dengan calendar & dashboard

---

### 📝 Notulensi / Notes

* Tambah catatan
* Edit catatan
* Hapus catatan
* Kategori catatan
* Menampilkan list notes

---

### 🎯 Target / Goals

* Tambah target
* Edit / update progress
* Hapus target
* Progress bar tracking

---

### 📆 Calendar

* Menampilkan jadwal berdasarkan tanggal
* Event marker
* Terintegrasi dengan schedule

---

### 🎨 UI / UX

* Responsive layout
* Theme system (Light & Dark Mode)
* Animasi halus
* SPA (Single Page Application) Navigation

---

## 🛠️ Teknologi yang Digunakan

**Frontend**

* HTML5
* CSS3 (Responsive + Theme System)
* JavaScript

**Backend**

* PHP Native
* REST API Style
* Session Based Authentication

**Database**

* MySQL

---

## 📂 Struktur Folder Project

```
ARVO/
│
├── index.html
├── style.css
├── script.js
│
├── backend/
│   ├── login.php
│   ├── logout.php
│   ├── get_stats.php
│   │
│   ├── profile/
│   │   └── get_profile.php
│   │
│   ├── schedule/
│   │   ├── add_schedule.php
│   │   ├── get_schedule.php
│   │   ├── update_schedule.php
│   │   └── delete_schedule.php
│   │
│   ├── notes/
│   │   ├── add_note.php
│   │   ├── get_notes.php
│   │   └── delete_note.php
│   │
│   └── goals/
│       ├── add_goal.php
│       ├── get_goals.php
│       └── update_goal.php
│
└── database.sql
```

---

## ⚙️ Cara Install & Menjalankan

### 1️⃣ Clone Repository

```
git clone https://github.com/username/arvo.git
```

Masuk ke folder:

```
cd arvo
```

---

### 2️⃣ Setting Database

1. Buka **phpMyAdmin**
2. Buat database baru → `arvo_db`
3. Import file:

```
database.sql
```

---

### 3️⃣ Setting Server

Letakkan folder project ke:

* `htdocs/` jika menggunakan XAMPP
* `www/` jika menggunakan Laragon

Lalu akses di browser:

```
http://localhost/www.aplikasi-arvo.com
```

---

## 🧠 Cara Menggunakan

1️⃣ Login ke sistem
2️⃣ Masuk ke dashboard → lihat statistik
3️⃣ Buka menu:

* **Schedule** → tambah/edit/hapus jadwal
* **Notes** → tambah catatan
* **Goals** → buat target
* **Calendar** → lihat jadwal berdasarkan tanggal

4️⃣ Sistem otomatis:

* Menyimpan data ke database
* Menampilkan statistik
* Update dashboard
* Sinkron ke calendar

---

## 🛡️ Validasi & Keamanan

* Session login protected
* Client-side validation (JavaScript)
* Server-side validation (PHP)
* Prepared statement (anti SQL injection)
* Error handling dan notification system

---

## 🎯 Tujuan Pengembangan

Aplikasi ini dikembangkan sebagai:
✔️ Proyek UAS Pemrograman Web
✔️ Sistem pendukung produktivitas mahasiswa
✔️ Implementasi konsep CRUD, SPA, REST API, dan UI/UX modern

---

## 👩‍💻 Developer

Nama : **Anggun Amaylia Abdillah**
Kelas : **2024D**
Prodi : **D4 – Manajemen Informatika**

---

## 📜 Lisensi

Project ini dibuat untuk tujuan pembelajaran dan akademik.


