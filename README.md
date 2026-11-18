# Peerly

Platform bimbingan belajar peer-to-peer. Mempertemukan siswa dengan tutor sukarela, lengkap dengan smart matching, booking sesi, bank materi, progress tracking, dan sistem poin & sertifikat volunteer.

Dibangun untuk menutup seluruh use case **Siswa** dan **Tutor/Volunteer** pada diagram sistem Peerly.

---

## Struktur proyek

```
peerly/
├── backend/           # Node.js + Express + SQLite + JWT
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   └── .env.example
└── frontend/          # Vanilla HTML + CSS + JS modules
    ├── index.html           # Landing page
    ├── css/
    │   ├── style.css        # Design tokens landing (dari desain asli)
    │   └── app.css          # Dashboard, forms, cards
    ├── js/
    │   ├── api.js           # Fetch wrapper + token store
    │   ├── ui.js            # Sidebar, icon, helper
    │   └── script.js        # Script landing (mobile nav, reveal)
    ├── assets/              # Logo + hero illustration
    └── pages/
        ├── register.html    # Daftar (role: siswa/tutor)
        ├── login.html
        ├── profil.html      # Lengkapi profil
        ├── dashboard.html   # Beda tampilan tergantung role
        ├── cari-tutor.html  # (Siswa) matching + ajukan sesi
        ├── cari-siswa.html  # (Tutor) matching
        ├── sesi.html        # (Keduanya) jadwal, konfirmasi, feedback
        ├── materi.html      # (Keduanya) bank materi + upload (tutor)
        ├── progress.html    # (Siswa) ringkasan + tabel progres
        ├── poin.html        # (Tutor) poin, tier, sertifikat
        └── notifikasi.html  # (Keduanya) notifikasi
```

---

## Cara menjalankan

**Prasyarat**: Node.js ≥ 18.

```bash
cd backend
cp .env.example .env         # ganti JWT_SECRET
npm install
npm start
```

Server jalan di `http://localhost:4000` dan **sekaligus menyajikan frontend** (static dari `../frontend`). Buka:

- Landing : `http://localhost:4000/`
- Register: `http://localhost:4000/pages/register.html`
- Login   : `http://localhost:4000/pages/login.html`

Database SQLite (`peerly.db`) dibuat otomatis beserta 6 materi awal.

---

## Pemetaan use case → halaman + endpoint

### Siswa
| Use case                      | Halaman                     | Endpoint                                   |
|-------------------------------|-----------------------------|---------------------------------------------|
| Registrasi / Login            | `register.html`, `login.html` | `POST /api/auth/register`, `POST /api/auth/login` |
| Melengkapi Profil             | `profil.html`               | `GET/PUT /api/profile`                      |
| Mencari Tutor (Matching)      | `cari-tutor.html`           | `GET /api/match/tutors` (scoring: mp +40, jenjang +25, lokasi +15, mode +10, rating×2, verified +5) |
| Mengajukan Sesi Belajar       | modal di `cari-tutor.html`  | `POST /api/sessions`                        |
| Melihat Jadwal Sesi           | `sesi.html`                 | `GET /api/sessions`                         |
| Mengakses Materi              | `materi.html`               | `GET /api/materi`, `GET /api/materi/:id`    |
| Melihat Progress Belajar      | `progress.html`             | `GET /api/progress`                         |
| Memberikan Feedback / Rating  | modal di `sesi.html`        | `POST /api/sessions/:id/feedback`           |

### Tutor / Volunteer
| Use case                      | Halaman                     | Endpoint                                   |
|-------------------------------|-----------------------------|---------------------------------------------|
| Registrasi / Login            | `register.html`, `login.html` | `POST /api/auth/register`                  |
| Melengkapi Profil             | `profil.html`               | `GET/PUT /api/profile`                      |
| Mencari Siswa (Matching)      | `cari-siswa.html`           | `GET /api/match/students`                   |
| Menerima Jadwal Sesi          | `sesi.html` (konfirm/tolak) | `POST /api/sessions/:id/respond`            |
| Melakukan Sesi Belajar        | `sesi.html` → tandai selesai | `POST /api/sessions/:id/complete`          |
| Mengakses Materi              | `materi.html`               | `GET /api/materi`                           |
| Mengumpulkan Poin Volunteer   | `poin.html` (auto saat sesi selesai) | `GET /api/tutor/points`              |
| Mengunduh Sertifikat          | `poin.html` → tombol unduh (print → PDF) | `POST /api/tutor/certificate`, `GET /api/tutor/certificates` |

Fitur tambahan: tutor juga bisa catat progress siswa (`POST /api/progress`) dan tambah materi (`POST /api/materi`), serta sistem notifikasi (`GET /api/notifications`) muncul otomatis saat ada permintaan sesi, konfirmasi, atau penyelesaian sesi.

---

## Sistem poin & tier

- Setiap sesi selesai → tutor dapat **10 poin + 1 poin per 10 menit** durasi (sesi 60 menit = 16 poin).
- Jam mengajar bertambah = durasi/60.
- Tier otomatis dari jam mengajar: Starter → Bronze (5j) → Silver (20j) → Gold (50j) → Platinum (100j).
- Sertifikat bisa diterbitkan setelah mencapai minimal Bronze dan merekam tier, poin, dan jam saat diterbitkan.
- Unduh sertifikat menggunakan print-to-PDF browser (print CSS sudah disiapkan untuk A4 landscape).

---

## Catatan desain

- Palet, tipografi (Fraunces + Work Sans), dan tone bahasa Indonesia mengikuti landing page asli (brand "Peerly" → di-rename jadi "Peerly").
- Frontend dibuat **tanpa framework** — HTML + CSS + modul JS native — supaya kode ringan dan mudah dipelajari untuk tugas kuliah.
- Backend juga satu file (`server.js`) agar mudah dibaca, dengan skema database dan seeding dipisahkan ke `database.js`.
- Keamanan dasar: password di-hash dengan bcrypt (10 rounds), auth pakai JWT (default 7 hari), semua endpoint peka-role dilindungi middleware `requireRole`.

---

## API cepat (quick reference)

```
POST   /api/auth/register           { name, email, password, role }
POST   /api/auth/login              { email, password }
GET    /api/auth/me                 (auth)
GET    /api/profile                 (auth)
PUT    /api/profile                 (auth) { phone, bio, jenjang, kelas, lokasi, mode_preference, gaya_belajar, mata_pelajaran[], availability }

GET    /api/match/tutors            (siswa) ?mata_pelajaran=&jenjang=&lokasi=&mode=
GET    /api/match/students          (tutor)
GET    /api/tutors                  (public)

POST   /api/sessions                (siswa) { tutor_id, mata_pelajaran, scheduled_at, mode, ... }
GET    /api/sessions                (auth)  ?status=
GET    /api/sessions/:id            (auth)
POST   /api/sessions/:id/respond    (tutor) { action: confirm|reject, location_or_link? }
POST   /api/sessions/:id/complete   (auth)
POST   /api/sessions/:id/cancel     (auth)
POST   /api/sessions/:id/feedback   (auth) { rating 1-5, comment? }
GET    /api/sessions/:id/feedback   (auth)

GET    /api/materi                  (auth) ?mata_pelajaran=&jenjang=&q=
GET    /api/materi/:id              (auth)
POST   /api/materi                  (tutor) { title, mata_pelajaran, jenjang, ... }

GET    /api/progress                (siswa)
POST   /api/progress                (tutor) { siswa_id, mata_pelajaran, topik, mastery 1-5, catatan? }

GET    /api/tutor/points            (tutor)
GET    /api/tutor/certificates      (tutor)
POST   /api/tutor/certificate       (tutor)

GET    /api/notifications           (auth)
POST   /api/notifications/read-all  (auth)
```

Semua endpoint ber-tag `(auth)` butuh header `Authorization: Bearer <token>`.

---

## Lisensi

Proyek konsep untuk tugas mata kuliah Software Engineering, bebas digunakan dan dimodifikasi.
