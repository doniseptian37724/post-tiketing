# Panduan Pengembangan APlikasi POS Ticketing (Post Tiketing)

Dokumen ini berisi instruksi lengkap dan spesifikasi teknis untuk membangun aplikasi Point of Sale (POS) khusus penjualan tiket berbasis web. Aplikasi ini dirancang dengan gaya modern, profesional, dan fungsionalitas tinggi.

---

## 1. Ringkasan Proyek (Project Overview)
**Nama Proyek**: Post Tiketing System  
**Tujuan**: Membangun antarmuka POS web yang intuitif untuk kasir atau petugas tiket melakukan transaksi penjualan tiket dengan cepat.  
**Target Pengguna**: Kasir, Admin Event, Petugas Loket.  
**Style**: Premium, Modern, Responsive (Mobile & Desktop Friendly).

## 2. Spesifikasi Teknis (Tech Stack)
*   **Core**: HTML5 Semantic, CSS3 Modern, JavaScript (ES6+).
*   **Styling**: Vanilla CSS (Tanpa framework berat seperti Bootstrap). Gunakan CSS Variables, Flexbox, dan Grid System.
*   **Ikon**: Menggunakan library ikon ringan (seperti Phosphor Icons, Lucide, atau FontAwesome).
*   **Penyimpanan Data**: `localStorage` browser untuk menyimpan riwayat transaksi dan stok tiket sementara (Client-side persistency).
*   **Font**: Google Fonts (Saran: 'Inter', 'Outfit', atau 'Poppins' untuk kesan modern).

## 3. Fitur Utama & Fungsionalitas

### A. Manajemen Tiket (Ticket Catalog)
*   **Tampilan Grid**: Menampilkan daftar tiket yang tersedia dalam bentuk kartu (Card).
*   **Informasi Tiket**: Nama Event/Wahana, Harga, Stok Tersedia, dan Kategori (misal: Reguler, VIP, Weekend).
*   **Pencarian & Filter**: Fitur pencarian cepat berdasarkan nama tiket.

### B. Keranjang Belanja (Live Cart)
*   **Panel Samping Proaktif**: Selalu terlihat di layar (sticky).
*   **Kontrol Item**: Menambah (+), mengurangi (-), atau menghapus item dari keranjang.
*   **Kalkulasi Real-time**: Menghitung Subtotal, Total Item, Pajak (jika ada), dan Total Akhir secara instan setiap ada perubahan.

### C. Proses Pembayaran (Checkout Flow)
*   **Metode Pembayaran**: Pilihan Tunai (Cash), QRIS, atau Kartu (Debit/Kredit).
*   **Kalkulator Kembalian**: Input uang diterima -> Otomatis hitung kembalian.
*   **Validasi**: Tombol 'Bayar' hanya aktif jika pembayaran mencukupi.

### D. Pencetakan & Bukti Transaksi
*   **Struk Digital**: Tampilan modal sukses pembayaran yang estetik.
*   **Print Layout**: CSS `@media print` khusus untuk mencetak struk di printer thermal (ukuran 58mm atau 80mm) yang rapi, berisi detail tranksasi, waktu, dan nomor referensi.

### E. Riwayat Penjualan (History)
*   Menyimpan data transaksi yang berhasil.
*   Rekapitulasi total pendapatan sesi ini.
*   **Export Laporan**: Fitur untuk mengunduh laporan penjualan ke format CSV atau PDF sederhana.

### F. Dashboard Analitik (Mini-Dashboard)
*   **Grafik Penjualan**: Visualisasi sederhana (Bar Chart dengan CSS atau SVG) untuk melihat tren penjualan hari ini.
*   **Top Items**: Menampilkan daftar 3 tiket paling laris.

### G. Fitur Ekstra & Utilitas
*   **Dark Mode Toggle**: Tombol switch elegan untuk berpindah antara mode terang dan gelap.
*   **Audio Feedback**: Efek suara halus (beep/succcess chime) saat menambahkan item atau transaksi berhasil untuk pengalaman POS yang nyata.
*   **Keyboard Shortcuts**:  Dukungan tombol keyboard untuk efisiensi (Contoh: `F2` untuk Search, `Enter` untuk Bayar).

### H. Sistem Diskon & Promosi
*   **Kode Voucher**: Input field untuk memasukkan kode diskon (misal: "HEMAT50" untuk potongan 50%).
*   **Diskon Per Item / Total**: Logika kalkulasi harga setelah diskon (persen atau nominal tetap).

### I. Manajemen Sesi Kasir (Shift)
*   **Start/End Shift**: Mencatat waktu mulai dan selesai tugas kasir.
*   **Shift Report**: Laporan ringkas saat sesi berakhir (Total uang tunai di laci vs Total penjualan sistem).

### J. Integrasi Hardware (Opsional)
*   **Barcode Scanner Support**: Mendeteksi input cepat dari scanner barcode (biasanya dianggap sebagai input keyboard super cepat di akhir enter).
*   **Auto-Focus**: Field pencarian otomatis fokus saat aplikasi siap digunakan.

### K. Sistem Pelanggan & Membership (CRM Lite)
*   **Database Pelanggan**: Simpan data pelanggan (Nama, No HP) di `localStorage`.
*   **Poin Loyalty**: Setiap pembelian kelipatan tertentu mendapatkan poin.
*   **Member Pricing**: Harga khusus untuk member aktif.

### L. Laporan Keuangan & Export Data
*   **Daily Recap**: Tabel ringkas penjualan hari ini per kategori.
*   **Export to Excel**: Fitur download data transaksi ke `.xlsx` (bisa gunakan library ringan seperti `SheetJS` atau CSV generator manual).

### M. Aksesibilitas (A11y)
*   **Focus Management**: Navigasi penuh menggunakan keyboard (Tab/Shift+Tab).
*   **ARIA Labels**: Dukungan untuk screen reader pada tombol ikon.
*   **High Contrast**: Mode kontras tinggi untuk pengguna dengan gangguan penglihatan.

### N. Autentikasi Pengguna (Login System)
*   **Simple Auth**: Layar login di awal sebelum masuk ke dashboard POS.
*   **Register Admin**: Fitur membuat akun petugas/admin baru.
*   **Logout**: Tombol keluar untuk mengakhiri sesi petugas.
*   **Session Guard**: Mencegah akses ke URL jika belum login.

---

## 4. Panduan Desain & UI/UX (Aesthetics)
*   **Tema**: Gunakan pendekatan **"Clean & Vibrant"**. Latar belakang bersih (putih/abu-abu terang atau dark mode elegan) dengan warna aksen yang kontras untuk tombol aksi (misal: Indigo/Ungu untuk utama, Hijau untuk sukses, Merah untuk hapus).
*   **Glassmorphism**: Gunakan efek blur transparan pada panel keranjang atau modal untuk kesan modern.
*   **Micro-interactions**: 
    *   Efek *hover* pada kartu tiket.
    *   Animasi *scale* saat menekan tombol.
    *   Transisi halus saat item masuk keranjang.
*   **Responsivitas**: Layout harus beradaptasi otomatis di layar tablet (kasir mobile) maupun desktop. Gunakan pendekatan *Mobile-First*.
*   **Tipografi Premium**: Gunakan *pairing font* yang kontras. Misal: Headings menggunakan font Display (seperti 'Outfit' atau 'Clash Display') dan Body menggunakan font Sans-Serif yang mudah dibaca ('Inter').
*   **Loading States**: Tampilkan *Skeleton Loading* (bayangan abu-abu berkedip) saat data sedang dimuat, jangan biarkan layar kosong.

---

## 5. Struktur Folder Proyek
Disarankan menggunakan struktur berikut agar rapi dan mudah dikelola:

```text
/post-tiketing
│
├── index.html        # Struktur HTML utama
├── style.css         # Semua styling CSS (Global, Layout, Component)
├── script.js         # Logika JavaScript (State management, DOM manipulation)
├── data.js           # (Opsional) Data dummy tiket/produk
└── assets/
    ├── images/       # Gambar tiket/logo
    └── icons/        # Aset ikon (jika file lokal)
```

---

## 6. Tahapan Pengembangan (Step-by-Step Instructions)

### Tahap 1: Struktur & Layout Dasar
1.  Buat file `index.html` dengan boilerplate HTML5.
2.  Hubungkan font dari Google Fonts dan CSS.
3.  Bagi layout menjadi 2 kolom utama (pada Desktop): **Kiri (Katalog Tiket)** dan **Kanan (Panel Keranjang/Cart)**.

### Tahap 2: Styling & Desain Sistem
1.  Tentukan variabel warna di `:root` CSS (Primary, Secondary, Background, Text).
2.  Styling kartu tiket (Gambar, Judul, Harga, Tombol Add).
3.  Styling panel keranjang agar terlihat seperti struk belanja modern.

### Tahap 3: Logika JavaScript (Core)
1.  Siapkan data tiket (Array of Objects).
2.  Buat fungsi `renderTickets()` untuk menampilkan data ke HTML.
3.  Buat state `cart = []` untuk menampung belanjaan.
4.  Implementasi fungsi `addToCart()`, `updateQuantity()`, dan `removeFromCart()`.
5.  Buat fungsi kalkulasi `updateTotal()` yang berjalan setiap ada perubahan state cart.

### Tahap 4: Fitur Pembayaran & Modal
1.  Buat Modal (Pop-up) untuk input pembayaran.
2.  Logic hitung kembalian: `Kembalian = Uang Masuk - Total Belanja`.
3.  Feedback visual jika uang kurang (Validasi).

### Tahap 5: Finishing & Print
1.  Tambahkan CSS `@media print` untuk menyembunyikan elemen UI (tombol, sidebar) saat dicetak, hanya menampilkan area struk.
2.  Uji coba responsivitas di berbagai ukuran layar.
2.  Uji coba responsivitas di berbagai ukuran layar.
3.  Tambahkan animasi transisi CSS agar terasa halus.
4.  Implementasikan *Dark Mode* dengan CSS Variables.
5.  Tambahkan validasi input biar tidak ada data kosong atau minus.

### Tahap 6: Advanced Features
1.  Implementasi logika Voucher/Diskon di `updateTotal()`.
2.  Buat tombol "Tutup Kasir" yang memunculkan ringkasan Shift Report.
3.  Tambahkan event listener `keypress` global untuk menangkap input scanner barcode.

### Tahap 7: Expert Features (CRM & Reporting)
1.  Buat modal "Data Pelanggan" sebelum pembayaran (Opsional).
2.  Implementasi sistem poin sederhana (1000 IDR = 1 Poin).
3.  Buat halaman/modal khusus untuk melihat tabel rekapitulasi penjualan dan tombol download CSV.

### Tahap 8: User Authentication
1.  Buat overlay screen penuh untuk Login/Register.
2.  Simpan database user di `localStorage`.
3.  Implementasi cek sesi saat halaman dimuat (Redirect jika belum login).

---

**Catatan Tambahan**: Pastikan kode bersih, diberi komentar untuk bagian yang kompleks, dan ikuti praktik terbaik semantik HTML.