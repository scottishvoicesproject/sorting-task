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

function getConditionFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const cond = urlParams.get('cond');
  if (cond && conditions[cond]) return cond;
  const keys = Object.keys(conditions);
  return keys[Math.floor(Math.random() * keys.length)];
}

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

function createSpeakerDiv(initials, idx) {
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

  // Vertical stack with left padding, 90px vertical gap
  const gapY = 90;
  const x = 20;
  const y = idx * gapY + 20;

  div.style.transform = `translate(${x}px, ${y}px)`;
  div.setAttribute('data-x', x);
  div.setAttribute('data-y', y);

  return div;
}

function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const container = document.getElementById('sorting-container');
  container.innerHTML = '';

  speakers.forEach((initials, idx) => {
    const speakerDiv = createSpeakerDiv(initials, idx);
    container.appendChild(speakerDiv);
  });

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
      }
    }
  });
}

function showError(msg) {
  const errEl = document.getElementById('error-message');
  errEl.textContent = msg;
  errEl.style.display = 'block';
}

function hideError() {
  const errEl = document.getElementById('error-message');
  errEl.style.display = 'none';
}

function submitAgeGender() {
  const ageInput = document.getElementById('age');
  const genderInput = document.getElementById('gender');

  const age = parseInt(ageInput.value);
  const gender = genderInput.value.trim();

  if (isNaN(age) || age < 4 || age > 17) {
    showError("Oops! Please enter a valid age between 4 and 17.");
    return false;
  }

  if (!gender) {
    showError("Oops! Please enter your gender.");
    return false;
  }

  hideError();

  // Hide age/gender form and instructions, show sorting task
  document.getElementById('intro-section').style.display = 'none';
  document.getElementById('sorting-section').style.display = 'block';

  // Load task condition
  const condKey = getConditionFromUrl();
  initSorting(condKey);

  return false; // prevent form submit reload
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('age-gender-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitAgeGender();
  });
});

