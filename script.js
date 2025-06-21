const conditions = {
  M_SSEvsP1: ['GI','PX','TV','BF','MB','CQ','KN','UI','EQ','TE','DM','EW'],
  M_SSEvsP2: ['TD','DG','WI','QE','HY','XU','VO','EL','JG','WR','UN','HZ'],
  M_SSEvsL1: ['US','TK','MB','KN','EQ','MF','GI','TV','QN','FI','DM','RU'],
  M_SSEvsL2: ['TD','DG','KD','EK','QE','XU','VI','HS','WI','EL','PP','WW'],
  F_SSEvsP1: ['XL','WN','KY','GQ','YR','VW','RX','BN','KX','BK','MP','PM'],
  F_SSEvsP2: ['IT','KZ','JS','RN','MW','XN','RF','LM','ZY','DI','PR','HG'],
  F_SSEvsL1: ['YR','FN','WN','BK','XL','OS','BN','GQ','ZP','SJ','KL','VG'],
  F_SSEvsL2: ['MC','MM','ZY','KP','KK','JY','MW','RF','XN','RN','PR','JT'],
};

const urlParams = new URLSearchParams(window.location.search);
const condition = urlParams.get('cond') || 'M_SSEvsP1';

const speakerContainer = document.getElementById('speaker-container');
const grid = document.getElementById('grid');
const submitBtn = document.getElementById('submit-btn');

let currentAudio = null;
let currentPlayingDiv = null;

// Show age form when start button clicked
document.getElementById("start-button").addEventListener("click", () => {
  document.getElementById("instructions").style.display = "none";
  document.getElementById("age-form").style.display = "block";
});

// Age & gender form submit
document.getElementById("age-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const ageInput = document.getElementById("age");
  const genderInput = document.getElementById("gender");

  const age = parseInt(ageInput.value);
  const gender = genderInput.value.trim();

  if (isNaN(age) || age < 4 || age > 17) {
    alert("Sorry, only participants aged 4–17 can take part.");
    return;
  }

  if (!gender) {
    alert("Please enter your gender.");
    return;
  }

  document.getElementById("age-form").style.display = "none";
  document.getElementById("task").style.display = "flex";
  submitBtn.style.display = "block";

  loadCondition();
});

function loadCondition() {
  const speakers = conditions[condition];
  if (!speakers) {
    speakerContainer.innerHTML = `<p>Invalid or missing condition: ${condition}</p>`;
    return;
  }
  
  speakerContainer.innerHTML = '';
  grid.innerHTML = '';

  speakers.forEach(initials => {
    const div = document.createElement('div');
    div.className = 'draggable';
    div.dataset.id = initials;
    div.textContent = initials;

    div.addEventListener('click', () => {
      // Stop previously playing audio if different speaker clicked
      if (currentAudio && currentPlayingDiv && currentPlayingDiv !== div) {
        currentAudio.pause();
        currentPlayingDiv.classList.remove('playing');
      }

      // Toggle play/pause if same speaker clicked
      if (currentPlayingDiv === div && currentAudio) {
        if (currentAudio.paused) {
          currentAudio.play();
          div.classList.add('playing');
        } else {
          currentAudio.pause();
          div.classList.remove('playing');
        }
      } else {
        // Play new audio
        currentAudio = new Audio(`audio/${initials.toLowerCase()}.wav`);
        currentPlayingDiv = div;

        currentAudio.play();
        div.classList.add('playing');

        currentAudio.onended = () => {
          div.classList.remove('playing');
        };
      }
    });

    speakerContainer.appendChild(div);
  });

  setupDrag();
}

function setupDrag() {
  interact
