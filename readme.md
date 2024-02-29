# Dokumentasi API

## URL Dasar

Semua permintaan API dibuat ke: `https://happiness-overload.netlify.app/`

## Allowed Origins

Berikut adalah daftar origin yang diizinkan untuk melakukan permintaan ke API ini:

- `http://localhost:5000`
- `http://localhost:3500`
- `http://localhost:5173`

## Endpoint

Tentu, berikut adalah dokumentasi API Anda dalam format markdown dengan bahasa Indonesia:

### Prefix: /auth

- `POST /google-login`: Login dengan Google (deprecated).
- `POST /register`: Mendaftarkan user baru.
- `POST /login`: Login user.
- `POST /logout`: Logout user.

### Prefix: /comments

- `POST /create/:postId`: Membuat comment post. Memerlukan autentikasi dan bisa upload gambar.
- `GET /post/:postId`: Mendapatkan comment post. Dapat menambahkan page dan limit sebagai parameter query.
- `POST /replies/:commentId`: Membuat reply comment. Memerlukan autentikasi dan bisa upload gambar.
- `GET /replies/:commentId`: Mendapatkan reply comment. Dapat menambahkan page dan limit sebagai parameter query.
- `PATCH /upvote/:commentId`: Upvote sebuah comment. Memerlukan autentikasi.
- `PATCH /downvote/:commentId`: Downvote sebuah comment. Memerlukan autentikasi.
- `GET /random-comment`: Mendapatkan comment acak.
- `GET /:commentId`: Mendapatkan comment spesifik.
- `PATCH /:commentId`: Memperbarui comment spesifik. Memerlukan autentikasi dan bisa upload gambar.
- `DELETE /:commentId`: Menghapus comment spesifik. Memerlukan autentikasi.

### Prefix: /interests

- `POST /`: Membuat minat. Memerlukan autentikasi dan bisa upload gambar.
- `GET /`: Mendapatkan minat. Dapat menambahkan page dan limit sebagai parameter query.
- `GET /:interestId`: Mendapatkan minat spesifik.
- `PATCH /:interestId`: Memperbarui minat spesifik. Memerlukan autentikasi, peran admin, dan bisa upload gambar.

### Prefix: /posts

- `POST /`: Membuat post. Memerlukan autentikasi dan bisa upload gambar banyak.
- `GET /`: Mendapatkan post. Dapat menambahkan page, limit, kategori, dan userId sebagai parameter query. Autentikasi adalah opsional.
- `GET /search`: Mencari post berdasarkan judul.
- `GET /random-post`: Mendapatkan post acak.
- `GET /saved`: Mendapatkan post yang disimpan. Memerlukan autentikasi. Dapat menambahkan page dan limit sebagai parameter query.
- `GET /self`: Mendapatkan post sendiri. Memerlukan autentikasi. Dapat menambahkan page dan limit sebagai parameter query.
- `PATCH /save/:postId`: Menyimpan post. Memerlukan autentikasi.
- `GET /cheers/:postId`: Mendapatkan user yang memberi cheers pada post.
- `PATCH /cheers/:postId`: Memberi cheers pada post. Memerlukan autentikasi.
- `PATCH /upvote/:postId`: Upvote sebuah post. Memerlukan autentikasi.
- `PATCH /downvote/:postId`: Downvote sebuah post. Memerlukan autentikasi.
- `GET /:postId`: Mendapatkan post spesifik.
- `DELETE /:postId`: Menghapus post spesifik. Memerlukan autentikasi.

### Prefix: /users

- `GET /`: Mendapatkan user. Memerlukan autentikasi dan peran admin. Dapat menambahkan page dan limit sebagai parameter query.
- `PATCH /update-password`: Memperbarui password. Memerlukan autentikasi.
- `GET /profile`: Mendapatkan profil user. Memerlukan autentikasi.
- `PATCH /profile`: Memperbarui profil user. Memerlukan autentikasi dan bisa upload gambar profil.
- `GET /following`: Mendapatkan user yang diikuti. Memerlukan autentikasi. Dapat menambahkan page dan limit sebagai parameter query.
- `GET /followers`: Mendapatkan pengikut. Memerlukan autentikasi. Dapat menambahkan page dan limit sebagai parameter query.
- `PATCH /follow/:userId`: Mengikuti user. Memerlukan autentikasi.
- `GET /search`: Mencari user. Dapat menambahkan page dan limit sebagai parameter query.
- `GET /:userId`: Mendapatkan user berdasarkan ID.

## Catatan

- Semua rute yang memerlukan autentikasi harus menyertakan JWT yang valid di cookie (Tenang saja ini otomatis kok).
- Parameter `/:postId`, `/:commentId`, `/:tagId`, dan `/:userId` dalam rute harus diganti dengan ID postingan, comment, tag, atau user yang sebenarnya.
