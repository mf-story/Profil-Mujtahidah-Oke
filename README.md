# Portofolio Dosen

Website profil & portofolio dosen — gaya minimalis terang dengan aksen coral dan
tata letak sidebar kiri tetap. Konten sepenuhnya dapat diedit lewat panel admin.

## Teknologi
- Vanilla HTML/CSS/JS (tanpa dependensi eksternal)
- Server Node.js bawaan (modul `http`) — tidak perlu `npm install`
- Font: Space Grotesk + Inter (Google Fonts)

## Menjalankan
1. Klik dua kali **`Jalankan Server.bat`** (atau jalankan `node server.js`).
2. Buka browser ke **http://localhost:5514**
3. Panel admin: **http://localhost:5514/admin.html**
   - Kata sandi awal: **`admin123`** (ganti lewat menu **Keamanan**).

### Akses dari HP
Jalankan **`Buka Akses HP.bat`** (butuh admin — membuka port 5514 di firewall),
lalu buka alamat `http://<IP-komputer>:5514` dari HP yang satu jaringan WiFi.

## Struktur
```
index.html        Halaman utama (mount point kosong, diisi content.js)
style.css         Gaya situs
content.js        Mengambil data/content.json lalu merender semua bagian
app.js            Interaksi: menu HP, scroll-spy, animasi angka, reveal
admin.html/js/css Panel CMS (login + editor schema-driven)
server.js         Server + API (login, konten, unggah, kata sandi)
data/
  content.json    SUMBER KONTEN TUNGGAL — edit di sini atau lewat panel admin
  admin.config.json  Hash kata sandi (dibuat otomatis, jangan di-commit)
uploads/          Gambar yang diunggah + placeholder SVG
```

## Mengedit konten
Semua teks, foto, dan daftar (keahlian, pendidikan, pengalaman, portofolio,
publikasi, tautan sosial) diatur lewat **panel admin** atau langsung di
`data/content.json`. Jangan mengedit `index.html` untuk konten — bagiannya kosong.

## Catatan
- Warna aksen bisa diubah di menu **Pengaturan → Warna Aksen** (mis. `#ff4d2e`).
- Foto: unggah lewat panel admin (maks. 10MB, format jpg/png/webp/gif/svg).
- Ganti kata sandi default sebelum dipublikasikan.
