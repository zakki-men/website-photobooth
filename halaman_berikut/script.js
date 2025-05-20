document.addEventListener("DOMContentLoaded", function () {
  // Ambil semua card template
  const templateCards = document.querySelectorAll(".template-card");
  const backButton = document.querySelector(".back-button"); // Ambil tombol kembali jika ada

  // Menambahkan event listener pada setiap tombol "Pilih" di template card
  templateCards.forEach((card) => {
    const selectButton = card.querySelector(".select-button");

    // Ketika tombol "Pilih" diklik
    selectButton.addEventListener("click", function () {
      const selectedTemplate = card.dataset.template; // Ambil nilai dari atribut data-template
      console.log(`Template dipilih: ${selectedTemplate}`); // Untuk debugging, menampilkan template yang dipilih di konsol

      // Arahkan pengguna ke halaman atur desain (halaman 4) dengan mengirimkan data template melalui query parameter
      window.location.href = `../edit_foto/akhir.html?template=${selectedTemplate}`;
    });
  });
});
