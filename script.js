const startButton = document.getElementById("start-button");
const likeButton = document.querySelector(".like-button");

startButton.addEventListener("click", () => {
  window.location.href = "take_photo/halaman_foto.html"; // Redirect ke halaman ambil foto
});

likeButton.addEventListener("click", () => {
  likeButton.classList.toggle("liked"); // Tambahkan/hapus kelas 'liked'
  if (likeButton.classList.contains("liked")) {
    alert("Kamu menyukai ini! ❤️"); // Pesan box gemas
  } else {
    alert("Batal menyukai.");
  }
});
