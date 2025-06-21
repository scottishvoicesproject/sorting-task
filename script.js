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

let audioPlaying = null; // current playing audio element

// Get condition key from URL or random
function getConditionFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const cond = urlParams.get('cond');
  if (cond && conditions[cond]) return cond;
  const keys = Object.keys(conditions);
  return keys[Math.floor(Math.random() * keys.length)];
}

// Setup audio play/pause toggle on button click
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

// Create draggable speaker div with audio button
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

  // No position here; initially stacked in #speaker-list container
  div.style.transform = 'none';
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);

  return div;
}

// Initialize the sorting task UI
function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];

  const speakerList = document.getElementById('speaker-list');
  const container = document.getElementById('sorting-container');
  speakerList.innerHTML = '';
  container.innerHTML = ''; // empty grid to start

  // Create speaker divs stacked in speakerList (left sidebar)
  speakers.forEach((initials) => {
    const speakerDiv = createSpeakerDiv(initials);
    speakerList.appendChild(speakerDiv);
  });

  // Setup interact.js draggable for all .draggable
  interact('.draggable').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: '#sorting-container',
        endOnly: true,
      }),
    ],
    listeners: {
      move(event) {
        const target = event.target;

        // Calculate new positions from previous data-x/y plus delta
        let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Apply transform to move element
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Save new positions
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        // If currently inside speaker-list (no positioning), remove it and append to sorting-container
        if (target.parentElement.id === 'speaker-list') {
          document.getElementById('sorting-container').appendChild(target);

          // Fix position after moving out of speaker-list (starts from mouse position)
          target.style.position = 'absolute';
          target.style.left = '0';
          target.style.top = '0';
        }
      }
    }
  });
}

// Show error message
function showError(msg) {
  const errEl = document.getElementById('error-message');
  errEl.textContent = msg;
  errEl.style.display =

