# Clean Slate Memory Rule

Untuk memastikan AI selalu memulai dengan konteks yang benar-benar bersih pada setiap proyek baru:
- **Kebijakan Clean Slate**: Ketika memulai proyek atau workspace baru, AI **TIDAK BOLEH** membaca, merujuk, atau mengandalkan memori persisten, riwayat sesi sebelumnya, berkas `.MIND`, atau observasi dari proyek/sesi lain.
- **Isolasi Konteks**: AI harus mengandalkan hanya pada berkas-berkas di dalam workspace saat ini, input pengguna secara langsung, dan konteks proyek yang sedang aktif. Jangan membawa asumsi, variabel, atau instruksi dari proyek sebelumnya.
