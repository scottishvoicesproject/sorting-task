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

// Get cond from URL or pick random
function getConditionFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const cond = urlParams.get('cond');
  if (cond && conditions[cond]) return cond;
  const keys = Object.keys(conditions);
  return keys[Math.floor(Math.random() * keys.length)];
}

// Create speaker draggable element
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

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
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

  div.appendChild(btn);

  div.appendChild(audio);
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);
  return div;
}

function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const taskWrapper = document.getElementById('task-wrapper');

  // Clear existing draggable divs
  taskWrapper.querySelectorAll('.draggable').forEach(el => el.remove());

  const isSmallScreen = window.innerWidth < 600;

  // Set taskWrapper layout for mobile vs desktop
  if (isSmallScreen) {
    taskWrapper.style.display = 'flex';
    taskWrapper.style.flexDirection = 'column';
    taskWrapper.style.height = 'auto';
  } else {
    taskWrapper.style.display = 'block';
    taskWrapper.style.height = '400px';
  }

  for (let i = 0; i < speakers.length; i++) {
    const initials = speakers[i];
    const speakerDiv = createSpeakerDiv(initials);

    if (isSmallScreen) {
      speakerDiv.style.position = 'relative';
      speakerDiv.style.left = 'auto';
      speakerDiv.style.top = 'auto';
      speakerDiv.style.marginBottom = '10px';
      speakerDiv.style.width = '100%';
      speakerDiv.style.transform = 'none';
      speakerDiv.setAttribute('data-x', 0);
      speakerDiv.setAttribute('data-y', 0);
    } else {
      speakerDiv.style.position = 'absolute';
      if (i % 2 === 0) {
        speakerDiv.style.left = '20px';
        speakerDiv.style.top = `${20 + Math.floor(i / 2) * 45}px`;
      } else {
        speakerDiv.style.left = '90px';
        speakerDiv.style.top = `${20 + Math.floor(i / 2) * 45}px`;
      }
      speakerDiv.style.width = '60px';
      speakerDiv.style.height = '40px';
      speakerDiv.style.marginBottom = '0';
      speakerDiv.style.transform = 'translate(0, 0)';
      speakerDiv.setAttribute('data-x', 0);
      speakerDiv.setAttribute('data-y', 0);
    }

    taskWrapper.appendChild(speakerDiv);
  }

  // Enable dragging with interact.js
  interact('.draggable').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: '#sorting-container',
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

// Show/hide rotate warning for portrait on sorting page
function checkRotateWarning() {
  const rotateWarning = document.getElementById('rotate-warning');
  // Show only if sorting section is visible and in portrait mode
  const sortingSectionVisible = document.getElementById('sorting-section').style.display !== 'none';
  if (sortingSectionVisible && window.matchMedia("(orientation: portrait)").matches) {
    rotateWarning.style.display = 'flex';
  } else {
    rotateWarning.style.display = 'none';
  }
}

// On window resize/orientation change check rotate warning and re-init sorting layout
window.addEventListener('resize', () => {
  checkRotateWarning();
  if (document.getElementById('sorting-section').style.display !== 'none') {
    initSorting(currentCondition);
  }
});

window.addEventListener('orientationchange', checkRotateWarning);

let currentCondition = getConditionFromUrl();

window.addEventListener('DOMContentLoaded', () => {
  // Hide rotate warning initially
  checkRotateWarning();

  const form = document.getElementById('age-gender-form');
  const introBox = document.getElementById('intro-box');
  const sortingSection = document.getElementById('sorting-section');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate age and gender
    const age = parseInt(form.age.value);
    const gender = form.gender.value;

    if (!age || age < 1 || age > 120) {
      errorMessage.textContent = 'Please enter a valid age between 1 and 120.';
      return;
    }
    if (!gender) {
      errorMessage.textContent = 'Please select your gender.';
      return;
    }
    errorMessage.textContent = '';

    // Hide intro, show sorting
    introBox.style.display = 'none';
    sortingSection.style.display = 'block';

    // Show instructions for desktop only
    const instructions = document.getElementById('instructions');
    if (window.innerWidth > 768) {
      instructions.style.display = 'block';
    } else {
      instructions.style.display = 'none';
    }

    // Initialize sorting draggable speakers
    initSorting(currentCondition);

    // Check rotate warning on start
    checkRotateWarning();
  });
});
