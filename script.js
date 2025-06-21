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
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);
  return div;
}

function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const speakerList = document.getElementById('speaker-list');
  const sortingContainer = document.getElementById('sorting-container');

  speakerList.innerHTML = '';
  sortingContainer.innerHTML = '';

  for (let i = 0; i < speakers.length; i++) {
    const initials = speakers[i];
    const speakerDiv = createSpeakerDiv(initials);
    speakerList.appendChild(speakerDiv);
  }

  interact('.draggable').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: '#sorting-container',
        endOnly: true
      })
    ],
    listeners: {
      start(event) {
        // No drag-layer stuff needed; just keep normal flow
        event.target.style.position = 'absolute';
        const rect = event.target.getBoundingClientRect();
        event.target.style.left = `${rect.left}px`;
        event.target.style.top = `${rect.top}px`;
        event.target.style.zIndex = '1000';
        event.target.style.transform = 'none';
        event.target.setAttribute('data-x', 0);
        event.target.setAttribute('data-y', 0);
        // Append directly to sorting container so it stays inside
        document.getElementById('sorting-container').appendChild(event.target);
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
        // Keep the icon where dropped (no snapping)
        // Just update the style so transform is applied as absolute left/top

        const target = event.target;
        const x = parseFloat(target.getAttribute('data-x')) || 0;
        const y = parseFloat(target.getAttribute('data-y')) || 0;

        // Calculate final absolute position based on current left/top + transform
        const currentLeft = parseFloat(target.style.left) || 0;
        const currentTop = parseFloat(target.style.top) || 0;
        const finalLeft = currentLeft + x;
        const finalTop = currentTop + y;

        target.style.left = `${finalLeft}px`;
        target.style.top = `${finalTop}px`;
        target.style.transform = 'none';
        target.setAttribute('data-x', 0);
        target.setAttribute('data-y', 0);
        target.style.zIndex = 'auto'; // reset z-index
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

  const age = document.getElementById('age').value.trim();
  const gender = document.getElementById('gender').value;

  if (!age || age < 1 || age > 120) {
    showError('Please enter a valid age between 1 and 120.');
    return;
  }
  if (!gender) {
    showError('Please select a gender.');
    return;
  }

  document.getElementById('intro-box').style.display = 'none';
  document.getElementById('instructions').style.display = 'block';
  document.getElementById('sorting-section').style.display = 'flex';

  const cond = getConditionFromUrl();
  initSorting(cond);
});

document.addEventListener('DOMContentLoaded', () => {
  hideError();
  const instructions = document.getElementById('instructions');
  if (instructions) instructions.style.display = 'none';
});

