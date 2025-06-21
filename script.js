const conditions = {
  M_SSEvsP1: ['GI','PX','TV','BF','MB','CQ','KN','UI','EQ','TE','DM','EW'],
  M_SSEvsP2: ['TD','DG','WI','QE','HY','XU','VO','EL','JG','WR','UN','HZ'],
  M_SSEvsL1: ['US','TK','MB','KN','EQ','MF','GI','TV','QN','FI','DM','RU'],
  M_SSEvsL2: ['TD','DG','KD','EK','QE','XU','VI','HS','WI','EL','PP','WW'],
  F_SSEvsP1: ['XL','WN','KY','GQ','YR','VW','RX','BN','KX','BK','MP','PM'],
  F_SSEvsP2: ['IT','KZ','JS','RN','MW','XN','RF','LM','ZY','DI','PR','HG'],
  F_SSEvsL1: ['YR','FN','WN','BK','XL','OS','BN','GQ','ZP','SJ','KL','VG'],
  F_SSEvsL2: ['MC','MM','ZY','KP','KK','JY','MW','RF','XN','RN','PR','JT']
};

let audioPlaying = null;

// Get condition from URL parameter ?cond= or pick random if missing/invalid
function getConditionFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const cond = urlParams.get('cond');
  if (cond && conditions.hasOwnProperty(cond)) return cond;
  const keys = Object.keys(conditions);
  return keys[Math.floor(Math.random() * keys.length)];
}

// Setup play/pause toggle for audio on button click, only one audio plays at a time
function setupAudioControl(button, audio) {
  button.addEventListener('click', () => {
    if (audioPlaying && audioPlaying !== audio) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
    }
    if (audio.paused) {
      audio.play();
      audioPlaying = audio;
    } else {
      audio.pause();
      audioPlaying = null;
    }
  });
}

// Create a draggable speaker div with audio and button
function createSpeakerDiv(initials) {
  const div = document.createElement('div');
  div.className = 'draggable';
  div.dataset.id = initials;

  const audio = document.createElement('audio');
  audio.src = `audio/${initials}.wav`;
  audio.preload = 'none';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = initials;
  btn.className = 'speaker-button';

  setupAudioControl(btn, audio);

  div.appendChild(btn);
  div.appendChild(audio);

  // reset positioning for list placement
  div.style.position = 'absolute';
  div.style.transform = 'translate(0,0)';
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);

  return div;
}

// Initialize sorting area with draggable speakers based on condition key
function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const speakerList = document.getElementById('speaker-list');
  const dragLayer = document.getElementById('drag-layer');

  // Clear previous content
  speakerList.innerHTML = '';
  dragLayer.innerHTML = '';

  // Position speakers in two vertical columns visually on left (#speaker-list area)
  // But append draggable elements to #drag-layer for free movement
  const colWidth = 60;   // horizontal spacing
  const rowHeight = 40;  // vertical spacing

  speakers.forEach((initials, index) => {
    const speakerDiv = createSpeakerDiv(initials);

    const col = index % 2;  // 0 or 1 (two columns)
    const row = Math.floor(index / 2);

    const x = col * colWidth + speakerList.offsetLeft;
    const y = row * rowHeight + speakerList.offsetTop;

    speakerDiv.style.left = `${x}px`;
    speakerDiv.style.top = `${y}px`;

    speakerDiv.setAttribute('data-x', 0);
    speakerDiv.setAttribute('data-y', 0);

    dragLayer.appendChild(speakerDiv);
  });

  // Enable dragging on all .draggable elements, restricted to #task-wrapper
  interact('.draggable').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: '#task-wrapper',
        endOnly: true
      })
    ],
    listeners: {
      start(event) {
        event.target.style.zIndex = 10000;
      },
      move(event) {
        const target = event.target;
        let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      },
      end(event) {
        event.target.style.zIndex = 10;
      }
    }
  });
}

// Show error message
function showError(msg) {
  const errEl = document.getElementById('error-message');
  if (errEl) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
}

// Hide error message
function hideError() {
  const errEl = document.getElementById('error-message');
  if (errEl) {
    errEl.textContent = '';
    errEl.style.display = 'none';
  }
}

// Handle form submit on intro page
document.getElementById('age-gender-form').addEventListener('submit', (e) => {
  e.preventDefault();
  hideError();

  const ageInput = document.getElementById('age');
  const genderSelect = document.getElementById('gender');

  const age = parseInt(ageInput.value, 10);
  const gender = genderSelect.value;

  if (!age || age < 1 || age > 120) {
    showError('Please enter a valid age between 1 and 120.');
    return;
  }
  if (!gender) {
    showError('Please select a gender.');
    return;
  }

  // Build condition key based on gender and random choice (simulate your real logic here)
  // For demo, pick a random condition for the gender group:
  let conditionKeys;
  if (gender === 'M') {
    conditionKeys = Object.keys(conditions).filter(k => k.startsWith('M_'));
  } else if (gender === 'F') {
    conditionKeys = Object.keys(conditions).filter(k => k.startsWith('F_'));
  } else {
    showError('Gender option not recognized.');
    return;
  }
  const conditionKey = conditionKeys[Math.floor(Math.random() * conditionKeys.length)];

  // Redirect to sorting page with condition as URL param
  window.location.href = `?page=sorting&cond=${conditionKey}`;
});

// On DOM loaded: if on sorting page, init sorting, else show intro
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');

  if (page === 'sorting') {
    document.body.innerHTML = `
      <section id="sorting-section">
        <h1>Sorting Task</h1>
        <div id="task-wrapper">
          <div id="speaker-list"></div>
          <div id="sorting-container"></div>
          <div id="drag-layer"></div>
        </div>
      </section>
    `;

    const cond = getConditionFromUrl();
    initSorting(cond);
  }
});

