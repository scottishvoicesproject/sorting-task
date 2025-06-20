// 🧩 All condition mappings
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

// Start button: hide instructions, show age form
startButton.addEventListener('click', () => {
  instructionsDiv.style.display = 'none';
  ageForm.style.display = 'block';
});

// Age gating
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

// Get condition from URL (e.g. ?cond=M_SSEvsP1)
function getConditionFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const cond = urlParams.get('cond');
  if (cond && conditions[cond]) {
    return cond;
  }
  // fallback default condition
  return 'M_SSEvsP1';
}

// Load speakers and setup drag/drop
function loadCondition() {
  condition = getConditionFromUrl();
  const speakers = conditions[condition];
  if (!speakers) {
    speakerContainer.innerHTML = `<p>Invalid or missing condition: ${condition}</p>`;
    return;
  }

  speakerContainer.innerHTML = ''; // Clear previous speakers

  // Position speakers initially spaced on top
  let startX = 20;
  let startY = 20;
  const gapX = 100;

  speakers.forEach((initials, idx) => {
    const div = document.createElement('div');
    div.className = 'draggable';
    div.dataset.id = initials;
    div.textContent = initials;
    // Set initial position
    div.style.transform = `translate(${startX + idx*gapX}px, ${startY}px)`;
    div.setAttribute('data-x', startX + idx*gapX);
    div.setAttribute('data-y', startY);

    // Play / pause toggle with visual cue
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

// Drag and drop functionality using Interact.js
function setupDrag() {
  interact('.draggable').draggable({
    inertia: true,
    autoScroll: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: '#grid',
        endOnly: true
      })
    ],
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  });
}

// Submit button — collect positions and groupings
submitBtn.addEventListener('click', () => {
  // Example: collect the speaker initials with their x,y positions
  const data = [];
  document.querySelectorAll('.draggable').forEach(div => {
    data.push({
      id: div.dataset.id,
      x: parseFloat(div.getAttribute('data-x')) || 0,
      y: parseFloat(div.getAttribute('data-y')) || 0,
    });
  });

  console.log('Participant grouping data:', data);

  alert('Thanks for participating! You grouped the speakers. Check console for data output.');

  // TODO: Add real data saving method here (e.g. send to server or API)
});

