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

  div.style.left = '20px';
  div.style.top = '20px';
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);

  return div;
}

function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const taskWrapper = document.getElementById('sorting-container');

  // Clear existing draggable divs
  taskWrapper.querySelectorAll('.draggable').forEach(el => el.remove());

  // Place speakers in two columns spaced vertically
  for (let i = 0; i < speakers.length; i++) {
    const initials = speakers[i];
    const speakerDiv = createSpeakerDiv(initials);

    // Position speakers in two columns, vertical spacing 50px
    if (i % 2 === 0) {
      speakerDiv.style.left = '20px';
      speakerDiv.style.top = `${20 + Math.floor(i / 2) * 50}px`;
    } else {
      speakerDiv.style.left = '100px';
      speakerDiv.style.top = `${20 + Math.floor(i / 2) * 50}px`;
    }

    taskWrapper.appendChild(speakerDiv);
  }

  // Initialize interact.js draggable
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
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      },
    },
  });
}

function checkRotateWarning() {
  const rotateWarning = document.getElementById('rotate-warning');
  const sortingSection = document.getElementById('sorting-section');
  if (
    sortingSection.style.display !== 'none' &&
    window.matchMedia('(orientation: portrait)').matches
  ) {
    rotateWarning.style.display = 'flex';
  } else {
    rotateWarning.style.display = 'none';
  }
}

window.addEventListener('resize', () => {
  checkRotateWarning();
});

window.addEventListener('orientationchange', () => {
  checkRotateWarning();
});

let currentCondition = getConditionFromUrl();

window.addEventListener('DOMContentLoaded', () => {
  checkRotateWarning();

  const form = document.getElementById('age-gender-form');
  const introBox = document.getElementById('intro-box');
  const sortingSection = document.getElementById('sorting-section');
  const errorMessage = document.getElementById('error-message');
  const instructions = document.getElementById('instructions');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

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

    // Show instructions only on wide screens
    if (window.innerWidth > 768) {
      instructions.style.display = 'block';
    } else {
      instructions.style.display = 'none';
    }

    initSorting(currentCondition);

    checkRotateWarning();
  });
});
