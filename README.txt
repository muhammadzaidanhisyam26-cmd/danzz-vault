DANZZ VAULT - PEMBARUAN FITUR

Isi folder:
- index.html   : halaman publik
- admin.html   : halaman admin
- script.js    : fitur halaman publik
- admin.js     : fitur halaman admin
- style.css    : gaya website

Fitur tambahan:
1. Tags per tautan. Admin memasukkan tag dipisahkan koma; tag dapat diedit dari kartu tautan admin.
2. Accent Color Picker: Neon Green, Hot Pink, Cyan Blue, Electric Purple.
3. Status tautan: Working, Maintenance, Updated; admin dapat mengubah status dari kartu tautan.

Penyimpanan:
- Tetap menggunakan localStorage dengan key saved_links dan saved_categories.
- Field tags dan status ditambahkan pada objek tautan. Data lama tetap dibaca; status yang belum ada otomatis dianggap Working dan tags kosong.
- Warna pilihan disimpan di key danzz_accent_color.
- Mode gelap/terang tetap memakai key dark_mode.

PENTING:
- Gunakan file dalam folder ini sebagai satu paket dan pertahankan nama file persis seperti di atas.
- Semua file HTML, JS, dan CSS harus berada di folder yang sama.
- localStorage hanya berbagi data pada browser dan origin/domain yang sama. Jika website sebelumnya dibuka dari domain atau browser berbeda, datanya tidak otomatis tersinkron.
- Sebelum mengganti file lama, buat salinan cadangan folder dan export JSON dari Admin Panel.
