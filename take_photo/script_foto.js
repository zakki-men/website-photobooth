document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const takePhotoButton = document.querySelector(".take-photo-button");
  const flipCameraButton = document.querySelector(".flip-camera-button");
  const uploadPhotoButton = document.getElementById("upload-photo");
  const uploadBackgroundButton = document.getElementById("upload-background");
  const backgroundButtons = document.querySelectorAll(".background-button");
  const filters = document.querySelectorAll(".filter-button");
  const photoResultsContainer = document.getElementById(
    "photoResultsContainer"
  );
  const customFilterButton = document.getElementById("custom-filter-button");
  const customFilterBox = document.getElementById("custom-filter-box");
  const closeButton = customFilterBox.querySelector(".close-button");
  const zoomSlider = document.getElementById("zoom");
  const brightnessSlider = document.getElementById("brightness");
  const contrastSlider = document.getElementById("contrast");
  const sharpnessSlider = document.getElementById("sharpness");
  const saturationSlider = document.getElementById("saturation");
  const resetCustomFilterButton = document.getElementById(
    "reset-custom-filter"
  );
  const countdownCircle = document.getElementById("countdown-circle");
  const resetButton = document.querySelector(".reset-button");
  const nextButton = document.querySelector(".next-button");
  const photoCountElement = document.querySelector(".photo-count");

  let currentStream;
  let facingMode = "user";
  let currentFilter = "normal";
  let customFilters = {
    zoom: 1,
    brightness: 1,
    contrast: 1,
    sharpness: 1,
    saturation: 1,
  };
  let photos = [];
  const maxPhotos = 3;

  // Fungsi untuk memperbarui tampilan jumlah foto
  function updatePhotoCount() {
    photoCountElement.textContent = `Foto: ${photos.length}/${maxPhotos}`;
  }

  // Panggil updatePhotoCount saat halaman dimuat untuk inisialisasi
  updatePhotoCount();

  // Fungsi untuk memulai atau mengganti stream kamera
  async function startCamera(deviceId) {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }
    const constraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: facingMode },
      audio: false,
    };
    try {
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = currentStream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      alert(
        "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan."
      );
    }
  }

  // Mendapatkan daftar perangkat kamera yang tersedia
  async function getCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (videoDevices.length > 1 && flipCameraButton) {
        flipCameraButton.style.display = "block";
      } else if (flipCameraButton) {
        flipCameraButton.style.display = "none";
      }
    } catch (error) {
      console.error("Error enumerating devices.", error);
    }
  }

  // Memulai kamera saat halaman dimuat
  getCameraDevices().then(startCamera);

  // Fungsi untuk menerapkan filter CSS ke video
  function applyFilters() {
    let filterString = "";
    if (currentFilter === "sepia") {
      filterString = "sepia(100%)";
    } else if (currentFilter === "black-and-white") {
      filterString = "grayscale(100%)";
    } else if (currentFilter === "invert") {
      filterString = "invert(100%)";
    } else if (currentFilter === "custom") {
      filterString = `brightness(${customFilters.brightness}) contrast(${customFilters.contrast}) saturate(${customFilters.saturation})`;
      video.style.transform = `scale(${customFilters.zoom})`;
      const blurAmount = Math.max(0, 1 - customFilters.sharpness) * 3;
      video.style.filter = `${filterString} blur(${blurAmount}px)`;
      return;
    }

    video.style.filter = filterString;
    video.style.transform = `scale(1)`;
  }

  // Event listener untuk tombol ambil foto
  takePhotoButton.addEventListener("click", () => {
    if (photos.length >= maxPhotos) {
      alert(
        `Foto sudah diambil maksimal ${maxPhotos} kali. Mohon hapus foto untuk mengambil lagi atau ulangi pengambilan foto.`
      );
      return;
    }

    let count = 3;
    countdownCircle.textContent = count;
    countdownCircle.style.display = "flex";
    const countdownInterval = setInterval(() => {
      count--;
      countdownCircle.textContent = count;
      if (count <= 0) {
        clearInterval(countdownInterval);
        countdownCircle.style.display = "none";
        takeSnapshot();
      }
    }, 1000);
  });

  // Fungsi untuk mengambil snapshot dari video
  function takeSnapshot() {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.filter = video.style.filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL("image/png");
    photos.push(imageDataURL);
    addPhotoToResults(imageDataURL);
    updatePhotoCount();

    // Simpan foto ke localStorage dengan kunci berurutan
    localStorage.setItem(`foto${photos.length}`, imageDataURL);
  }

  // Fungsi untuk menambahkan foto ke hasil
  function addPhotoToResults(imageDataURL) {
    const photoDiv = document.createElement("div");
    photoDiv.classList.add("photo-results");

    const imgElement = document.createElement("img");
    imgElement.src = imageDataURL;
    imgElement.style.width = "100%";
    imgElement.style.height = "auto";
    imgElement.style.objectFit = "contain";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => {
      const index = photos.indexOf(imageDataURL);
      if (index > -1) {
        photos.splice(index, 1);
        photoResultsContainer.removeChild(photoDiv);
        updatePhotoCount();
        // Hapus juga dari localStorage jika diperlukan (opsional)
        localStorage.removeItem(`foto${index + 1}`);
        // Perbarui kunci foto yang tersisa (opsional, kompleks)
      }
    });

    photoDiv.appendChild(imgElement);
    photoDiv.appendChild(deleteButton);
    photoResultsContainer.prepend(photoDiv);
  }

  // Event listener untuk mengunggah foto dari album
  uploadPhotoButton.addEventListener("change", (event) => {
    const files = event.target.files;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          photos.push(e.target.result);
          addPhotoToResults(e.target.result);
          updatePhotoCount();
          // Simpan foto unggahan ke localStorage (gunakan panjang array sebagai kunci)
          localStorage.setItem(`foto${photos.length}`, e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
    event.target.value = "";
  });

  // Event listener untuk memilih latar belakang warna
  backgroundButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const background = this.dataset.background;
      video.style.backgroundColor =
        background === "normal" ? "black" : background;
      video.style.backgroundImage = "none";
    });
  });

  // Event listener untuk mengunggah latar belakang custom
  uploadBackgroundButton.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        video.style.backgroundImage = `url(${e.target.result})`;
        video.style.backgroundSize = "cover";
        video.style.backgroundPosition = "center";
      };
      reader.readAsDataURL(file);
    } else {
      video.style.backgroundImage = "none";
      video.style.backgroundColor = "black";
    }
    event.target.value = "";
  });

  // Event listener untuk memilih filter
  filters.forEach((filterButton) => {
    filterButton.addEventListener("click", function () {
      filters.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.dataset.filter;
      applyFilters();
      if (currentFilter !== "custom") {
        customFilterBox.classList.remove("active");
      }
    });
  });

  // Event listener untuk tombol custom filter
  customFilterButton.addEventListener("click", () => {
    customFilterBox.classList.add("active");
    filters.forEach((btn) => btn.classList.remove("active"));
    filters.forEach((btn) => {
      if (btn.dataset.filter === "custom") {
        btn.classList.add("active");
      }
    });
    currentFilter = "custom";
    applyFilters();
  });

  // Event listener untuk menutup kotak custom filter
  closeButton.addEventListener("click", () => {
    customFilterBox.classList.remove("active");
    filters.forEach((btn) => {
      if (btn.dataset.filter === "normal") {
        btn.classList.add("active");
        currentFilter = "normal";
        applyFilters();
      }
    });
  });

  const sliderMinusButtons = customFilterBox.querySelectorAll(
    ".slider-container .slider-minus"
  );
  const sliderPlusButtons = customFilterBox.querySelectorAll(
    ".slider-container .slider-plus"
  );

  function updateSliderValue(slider, value) {
    slider.value = value;
    const event = new Event("input", { bubbles: true, cancelable: true });
    slider.dispatchEvent(event);
  }

  sliderMinusButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const slider = this.parentNode.querySelector('input[type="range"]');
      let newValue = parseFloat(slider.value) - parseFloat(slider.step);
      newValue = Math.max(parseFloat(slider.min), newValue);
      updateSliderValue(slider, newValue);
    });
  });

  sliderPlusButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const slider = this.parentNode.querySelector('input[type="range"]');
      let newValue = parseFloat(slider.value) + parseFloat(slider.step);
      newValue = Math.min(parseFloat(slider.max), newValue);
      updateSliderValue(slider, newValue);
    });
  });

  zoomSlider.addEventListener("input", (e) => {
    customFilters.zoom = parseFloat(e.target.value);
    applyFilters();
  });

  brightnessSlider.addEventListener("input", (e) => {
    customFilters.brightness = parseFloat(e.target.value);
    applyFilters();
  });

  contrastSlider.addEventListener("input", (e) => {
    customFilters.contrast = parseFloat(e.target.value);
    applyFilters();
  });

  sharpnessSlider.addEventListener("input", (e) => {
    customFilters.sharpness = parseFloat(e.target.value);
    applyFilters();
  });

  saturationSlider.addEventListener("input", (e) => {
    customFilters.saturation = parseFloat(e.target.value);
    applyFilters();
  });

  resetCustomFilterButton.addEventListener("click", () => {
    customFilters = {
      zoom: 1,
      brightness: 1,
      contrast: 1,
      sharpness: 1,
      saturation: 1,
    };
    zoomSlider.value = 1;
    brightnessSlider.value = 1;
    contrastSlider.value = 1;
    sharpnessSlider.value = 1;
    saturationSlider.value = 1;
    applyFilters();
  });

  resetButton.addEventListener("click", () => {
    photos = [];
    photoResultsContainer.innerHTML = "";
    updatePhotoCount();
    video.style.filter = "none";
    video.style.transform = "scale(1)";
    video.style.backgroundColor = "black";
    video.style.backgroundImage = "none";
    filters.forEach((btn) => btn.classList.remove("active"));
    filters[0].classList.add("active");
    currentFilter = "normal";
    customFilterBox.classList.remove("active");
    customFilters = {
      zoom: 1,
      brightness: 1,
      contrast: 1,
      sharpness: 1,
      saturation: 1,
    };
    zoomSlider.value = 1;
    brightnessSlider.value = 1;
    contrastSlider.value = 1;
    sharpnessSlider.value = 1;
    saturationSlider.value = 1;
  });

  nextButton.addEventListener("click", () => {
    if (photos.length > 0) {
      window.location.href =
        "../halaman_berikut/pilih_template.html?template=vertical"; // Contoh default template
    } else {
      alert("Ambil setidaknya satu foto sebelum melanjutkan.");
    }
  });
});
