document.addEventListener("DOMContentLoaded", function () {
  const templateContainer = document.getElementById("template-container");
  const colorOptions = document.querySelectorAll(".color-option");
  const textureOptions = document.querySelectorAll(".texture-option");
  const downloadButton = document.getElementById("download-button");
  const previewArea = document.querySelector(".preview-area");
  const shapeSquareButton = document.getElementById("shape-square");
  const shapeCircleButton = document.getElementById("shape-circle");

  let frameColor = "#8C2F39"; // Warna bingkai default
  let backgroundTexture = "texture1.png"; // Tekstur default
  let currentShape = "square"; // Bentuk default
  let photos = []; // Array untuk menyimpan data foto dari localStorage

  // Mendapatkan template yang dipilih dari query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const selectedTemplate = urlParams.get("template");

  console.log("Template yang diterima:", selectedTemplate);

  // Fungsi untuk mendapatkan foto dari localStorage
  function getStoredPhotos() {
    photos = [];
    for (let i = 1; i <= 3; i++) {
      const storedPhoto = localStorage.getItem(`foto${i}`);
      if (storedPhoto) {
        photos.push(storedPhoto);
      }
    }
    console.log("Foto dari localStorage:", photos);
  }

  // Fungsi untuk menampilkan template yang dipilih
  function displayTemplate(templateType) {
    templateContainer.innerHTML = "";
    templateContainer.className = ""; // Reset class
    templateContainer.classList.add(templateType); // Tambahkan class template (vertical atau horizontal)

    if (templateType === "vertical") {
      for (let i = 0; i < 3; i++) {
        const item = createTemplateItem(i); // Kirim indeks foto
        templateContainer.appendChild(item);
      }
    } else if (templateType === "horizontal-top-bottom") {
      const topItem = createTemplateItem(0); // Foto pertama
      topItem.classList.add("top");
      templateContainer.appendChild(topItem);

      const bottomRow = document.createElement("div");
      bottomRow.classList.add("preview-bottom");
      const bottomItem1 = createTemplateItem(1); // Foto kedua
      bottomItem1.classList.add("bottom");
      bottomRow.appendChild(bottomItem1);
      const bottomItem2 = createTemplateItem(2); // Foto ketiga
      bottomItem2.classList.add("bottom");
      bottomRow.appendChild(bottomItem2);
      templateContainer.appendChild(bottomRow);
    }
    updateFrameColors();
    updateBackgroundTexture();
    updateImageShapes();
  }

  function createTemplateItem(photoIndex) {
    const item = document.createElement("div");
    item.classList.add("preview-item");

    const frame = document.createElement("div");
    frame.classList.add("image-frame");
    if (currentShape === "circle") {
      frame.classList.add("circle-frame");
    }

    if (photos[photoIndex]) {
      const img = document.createElement("img");
      img.src = photos[photoIndex];
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      frame.appendChild(img);
      frame.style.backgroundColor = "transparent";
    } else {
      frame.textContent = `Foto ${photoIndex + 1}`;
      frame.style.display = "flex";
      frame.style.justifyContent = "center";
      frame.style.alignItems = "center";
      frame.style.color = "#777";
    }

    item.appendChild(frame);
    return item;
  }

  function updateFrameColors() {
    const imageFrames = templateContainer.querySelectorAll(".image-frame");
    imageFrames.forEach((frame) => {
      frame.style.borderColor = frameColor;
      frame.style.borderStyle = "solid"; // Pastikan border style diatur
      frame.style.borderWidth = "5px"; // Atur ketebalan border sesuai keinginan
    });
  }

  function updateBackgroundTexture() {
    if (backgroundTexture.startsWith("solid_")) {
      previewArea.style.backgroundImage = "none";
      previewArea.style.backgroundColor = backgroundTexture.split("_")[1];
    } else {
      previewArea.style.backgroundImage = `url('${backgroundTexture}')`;
      previewArea.style.backgroundColor = "transparent";
    }
    previewArea.style.backgroundSize = "cover";
  }

  function updateImageShapes() {
    const imageFrames = templateContainer.querySelectorAll(".image-frame");
    imageFrames.forEach((frame) => {
      if (currentShape === "circle") {
        frame.classList.add("circle-frame");
      } else {
        frame.classList.remove("circle-frame");
      }
    });
  }

  // Event listeners untuk tombol bentuk
  shapeSquareButton.addEventListener("click", function () {
    shapeCircleButton.classList.remove("active");
    this.classList.add("active");
    currentShape = "square";
    updateImageShapes();
  });

  shapeCircleButton.addEventListener("click", function () {
    shapeSquareButton.classList.remove("active");
    this.classList.add("active");
    currentShape = "circle";
    updateImageShapes();
  });

  // Event listeners untuk warna bingkai
  colorOptions.forEach((option) => {
    option.addEventListener("click", function () {
      document
        .querySelector(".color-option.active")
        ?.classList.remove("active");
      this.classList.add("active");
      frameColor = this.dataset.color;
      updateFrameColors();
    });
  });

  // Event listeners untuk tekstur latar belakang
  textureOptions.forEach((option) => {
    option.addEventListener("click", function () {
      document
        .querySelector(".texture-option.active")
        ?.classList.remove("active");
      this.classList.add("active");
      backgroundTexture = this.dataset.texture;
      updateBackgroundTexture();
    });
  });

  // Event listener untuk tombol unduh
  downloadButton.addEventListener("click", function () {
    html2canvas(previewArea, { useCORS: true })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = "desain_photobooth.png";
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat mengunduh gambar:", error);
        alert("Maaf, terjadi kesalahan saat mengunduh gambar.");
      });
  });

  // Inisialisasi tampilan saat halaman dimuat
  getStoredPhotos(); // Ambil foto dari localStorage saat halaman dimuat
  if (selectedTemplate) {
    displayTemplate(selectedTemplate);
  } else {
    displayTemplate("vertical"); // Template default
  }
  updateFrameColors(); // Set warna bingkai awal
});
