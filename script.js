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
const condition = urlParams.get('cond') || 'M_SSEvsP1'; // default if none

const speakerContainer = document.getElementById('speaker-container');
const grid = document.getElementById('grid');

let currentAudio = null;
let currentPlayingDiv = null;

document.getElementById("start-button").addEventListener("click", () => {
  document.getElementById("instructions").style.display = "none";
  document.getElementById("age-form").style.display = "block";
});

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
  document.getElementById("submit-btn").style.display = "block";

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
      // Pause previous audio if playing
      if (currentAudio && currentPlayingDiv && currentPlayingDiv !== div) {
        currentAudio.pause();
        currentPlayingDiv.classList.remove('playing');
      }

      // If clicking same playing audio toggle pause/play
      if (currentPlayingDiv === div && currentAudio) {
        if (currentAudio.paused) {
          currentAudio.play();
          div.classList.add('playing');
        } else {
          currentAudio.pause();
          div.classList.remove('playing');
        }
      } else {
        // New audio play
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
  interact('.draggable').draggable({
    inertia: true,
    autoScroll: true,
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('
