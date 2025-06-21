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

function getConditionFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const cond = urlParams.get('cond');
  if (cond && conditions[cond]) return cond;
  const keys = Object.keys(conditions);
  return keys[Math.floor(Math.random() * keys.length)];
}

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

  btn.addEventListener('click', () => {
    if (audioPlaying && audioPlaying !== audio) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
    }
    if (audio.paused) {
      audio.play();
      audioPlaying = audio;
    } else {
      audio.pause();
      audio.currentTime = 0;
      audioPlaying = null;
    }
  });

  div.appendChild(btn);
  div.appendChild(audio);

  return div;
}

function loadSpeakers() {
  const cond = getConditionFromUrl();
  const speakerList = document.getElementById('speaker-list');
  speakerList.innerHTML = '';
  conditions[cond].forEach(initials => {
    const speakerDiv = createSpeakerDiv(initials);
    speakerList.appendChild(speakerDiv);
  });
}

// Initialize draggable with interactjs
function initDraggables() {
  interact('.draggable').draggable({
    inertia: false,
    listeners: {
      move(event) {
        const target = event.target;
        let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  });
}

function showRotateWarning(show) {
  const warning = document.getElementById('rotate-warning');
  if (show) {
    warning.style.display = 'flex';
  } else {
    warning.style.display = 'none';
  }
}

// Check orientation and show warning on mobile
function checkOrientation() {
  if (window.innerWidth < 600) {
    if (window.innerHeight > window.innerWidth) {
      showRotateWarning(true);
    } else {
      showRotateWarning(false);
    }
  } else {
    showRotateWarning(false);
  }
}

// Form validation and task start
document.getElementById('age-gender-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const age = document.getElementById('age').value.trim();
  const gender = document.getElementById('gender').value;

  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = '';

  if (!age || isNaN(age) || age < 1 || age > 120) {
    errorMessage.textContent = 'Please enter a valid age between 1 and 120.';
    return;
  }

  if (!gender) {
    errorMessage.textContent = 'Please select your gender.';
    return;
  }

  // Hide intro box and show sorting section & instructions
  document.getElementById('intro-box').style.display = 'none';
  document.getElementById('sorting-section').style.display = 'block';
  document.getElementById('instructions').style.display = 'block';

  loadSpeakers();
  initDraggables();

  // Enable pointer events on sorting container so dragging works
  document.getElementById('sorting-container').style.pointerEvents = 'auto';
});

// Run orientation check on load and on resize
window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);

