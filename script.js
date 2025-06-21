const audioFiles = [
  "audio/m_ssevsp1.mp3",
  "audio/m_ssevsp2.mp3",
  "audio/f_ssefsp1.mp3",
  "audio/f_ssefsp2.mp3",
  // Add all your audio filenames here
];

const instructionsDiv = document.getElementById("instructions");
const startButton = document.getElementById("start-button");
const demographicsForm = document.getElementById("demographics-form");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const taskDiv = document.getElementById("task");
const audioContainer = document.getElementById("audio-container");
const grid = document.getElementById("grid");

let currentAudio = null;
let currentPlayingBox = null;

startButton.addEventListener("click", () => {
  instructionsDiv.style.display = "none";
  demographicsForm.style.display = "block";
});

demographicsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const age = parseInt(ageInput.value, 10);
  const gender = genderInput.value.trim();
  if (!age || age < 4 || age > 17) {
    alert("Please enter a valid age between 4 and 17.");
    return;
  }
  if (!gender) {
    alert("Please enter your gender.");
    return;
  }
  demographicsForm.style.display = "none";
  taskDiv.style.display = "flex";
  loadAudioBoxes();
});

function loadAudioBoxes() {
  audioFiles.forEach((file, i) => {
    const box = document.createElement("div");
    box.classList.add("audio-box");
    box.textContent = file.split("/").pop().replace(".mp3", "");
    box.dataset.audioSrc = file;

    box.addEventListener("click", () => {
      if (currentAudio && !currentAudio.paused && currentPlayingBox === box) {
        // Pause if clicked again
        currentAudio.pause();
        box.classList.remove("playing");
        return;
      }
      // Stop previous
      if (currentAudio) {
        currentAudio.pause();
        if (currentPlayingBox) currentPlayingBox.classList.remove("playing");
      }
      // Play new
      currentAudio = new Audio(file);
      currentAudio.play();
      currentPlayingBox = box;
      box.classList.add("playing");
      currentAudio.onended = () => {
        box.classList.remove("playing");
      };
    });

    audioContainer.appendChild(box);
  });
}

// TODO: Add drag and drop logic with interact.js for the grid if you want free sorting!

document.getElementById("submit-btn").addEventListener("click", () => {
  alert("Submit clicked! You can add your data saving logic here.");
});
