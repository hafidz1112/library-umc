# MUCILIB API Testing Guide

Folder ini berisi berbagai cara untuk melakukan testing pada API MUCILIB tanpa harus menggunakan tools eksternal yang berat.

## 1. Swagger UI (Direkomendasikan)

Cara termudah untuk mencoba semua endpoint secara visual melalui browser.

- **URL:** [http://localhost:4000/docs](http://localhost:4000/docs)
- **Fitur:** Dokumentasi interaktif, skema data, tombol "Try it out", serta pengiriman notifikasi.

## 2. VS Code REST Client (`api_tests.http`)

Jika Anda menggunakan VS Code, Anda bisa melakukan testing langsung dari editor tanpa membuka aplikasi lain.

- **Langkah:**
  1. Install extension **"REST Client"** (oleh Huachao Mao) di VS Code.
  2. Buka file `MUCILIB_BE/api_tests.http`.
  3. Klik tulisan **"Send Request"** yang muncul di atas setiap method (GET/POST).
- **Cakupan:** Auth, Profiles, Categories, Collections, Loans, dan Notifications.

## 3. Bruno (`.bru` files)

Folder ini juga berisi file koleksi Bruno. Jika Anda ingin menggunakan Bruno:

1. Download [Bruno Open Source API Client](https://www.usebruno.com/).
2. "Open Collection" dan pilih folder ini.

## 4. Automated Tests (Future)

Untuk testing otomatis dalam skala besar, disarankan menggunakan framework seperti:

- **Vitest + Supertest**: Untuk integration testing yang berjalan saat build/CI.
- Command: `npm test` (perlu dikonfigurasi).
