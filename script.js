// All conditions with speaker initials
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

const speakerContainer = document.getElementById('grid');
const ageForm = document.getElementById("age-form");
const taskDiv = document.getElementById("task");
const instructionsDiv = document.getElementById("instructions");
const startButton = document.getElementById("start-button");
const submitBtn = document.getElementById("submit-btn");

let condition = null;
let currentAudio = null;
let currentPlayingDiv = null;

// Start button hides instructions, shows age form
startButton.addEventListener('click', () => {
  instructionsDiv.style.display = 'none';
  ageForm.style.display = 'block';
});

// Age gating (3-17)
ageForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const age = parseInt(document.getElementById("age").value);
  if (age >= 3 && age <= 17) {
    ageForm.style.display = "none";
    taskDiv.style.display = "block";
    loadCondition();
  } else {
    alert("Sorry, only participants aged 3–17 can take part.");
  }
});

// Get condition from URL (default fallback)
function getConditionFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const cond = urlParams.get('cond');
  if (cond && conditions[cond]) {
    return cond;
  }
  return 'M_SSEvsP1'; // fallback default
}

// Load the speaker initials for the chosen condition
function loadCondition() {
  condition = getConditionFromUrl();
  const speakers = conditions[condition];
  if (!speakers) {
    speakerContainer.innerHTML = `<p>Invalid or missing condition: ${condition}</p>`;
    return;
  }

  speakerContainer.innerHTML = ''; // Clear previous content

  // Arrange speakers in a horizontal line initially
  const startX = 20;
  const startY = 20;
  const gapX = 100;

  speakers.forEach((initials, idx) => {
    const div = document.createElement('div');
    div.className = 'draggable';
    div.dataset.id = initials;
    div.textContent = initials;

    // Initial position
    const x = startX + idx * gapX;
    const y = startY;
    div.style.transform = `translate(${x}px, ${y}px)`;
    div.setAttribute('data-x', x);
    div.setAttribute('data-y', y);

    // Play/pause toggle
    div.addEventListener('click', () => {
      if (currentAudio && !currentAudio.paused && currentAudio.dataset.id === initials) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
        if (currentPlayingDiv) {
          currentPlayingDiv.classList.remove('playing');
          currentPlayingDiv = null;
        }
        return;
      }

      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      if (currentPlayingDiv) {
        currentPlayingDiv.classList.remove('playing');
      }

      currentAudio = new Audio(`audio/${initials.toLowerCase()}.wav`);
      currentAudio.dataset.id = initials;
      currentAudio.play();

      div.classList.add('playing');
      currentPlayingDiv = div;

      currentAudio.addEventListener('ended', () => {
        div.classList.remove('playing');
        currentAudio = null;
        currentPlayingDiv = null;
      });
    });

    speakerContainer.appendChild(div);
  });

  setupDrag();
}

// Setup Interact.js draggable with boundaries in #grid
function setupDrag() {
  interact('.draggable').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: '#grid',
        endOnly: true,
      })
    ],
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('

