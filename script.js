// Responsive speaker layout strategy with improved zig-zag positioning and spacing

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
      audioPlaying = null;
    }
  });

  div.appendChild(btn);
  div.appendChild(audio);
  return div;
}

function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const sortingContainer = document.getElementById('sorting-container');
  const speakerArea = document.getElementById('speaker-area');

  sortingContainer.innerHTML = '';
  speakerArea.innerHTML = '';

  // Create two vertical columns for zig-zag positioning
  const col1 = document.createElement('div');
  const col2 = document.createElement('div');
  col1.className = 'speaker-col';
  col2.className = 'speaker-col';

  speakers.forEach((initials, index) => {
    const speakerDiv = createSpeakerDiv(initials);
    if (index % 2 === 0) {
      col1.appendChild(speakerDiv);
    } else {
      col2.appendChild(speakerDiv);
    }
  });

  speakerArea.appendChild(col1);
  speakerArea.appendChild(col2);

  interact('.draggable').draggable({
    inertia: true,
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
  errEl.textContent = '';
  errEl.style.display = 'none';
}

document.getElementById('age-gender-form').addEventListener('submit', (e) => {
  e.preventDefault();
  hideError();

  const age = parseInt(document.getElementById('age').value.trim());
  const gender = document.getElementById('gender').value;

  if (!age || age < 4 || age > 17) {
    showError('Please enter a valid age between 4 and 17.');
    return;
  }
  if (!gender) {
    showError('Please select a gender.');
    return;
  }

  document.getElementById('intro-box').style.display = 'none';
  document.getElementById('instructions').style.display = 'block';
  document.getElementById('sorting-section').style.display = 'flex';
  document.body.classList.add('task-active');

  const cond = getConditionFromUrl();
  initSorting(cond);
});

document.addEventListener('DOMContentLoaded', () => {
  hideError();
  const instructions = document.getElementById('instructions');
  if (instructions) instructions.style.display = 'none';

  const hideBtn = document.getElementById('hide-instructions');
  const showBtn = document.getElementById('show-instructions');
  hideBtn?.addEventListener('click', () => {
    document.getElementById('instructions').classList.add('hide');
    hideBtn.style.display = 'none';
    showBtn.style.display = 'inline-block';
  });
  showBtn?.addEventListener('click', () => {
    document.getElementById('instructions').classList.remove('hide');
    hideBtn.style.display = 'inline-block';
    showBtn.style.display = 'none';
  });
});
