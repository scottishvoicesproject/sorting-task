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
  const taskWrapper = document.getElementById('task-wrapper');
  const sortingContainer = document.getElementById('sorting-container');

  // Remove previous icons
  taskWrapper.querySelectorAll('.draggable').forEach(el => el.remove());
  sortingContainer.innerHTML = '';

  const colLeft = 20;
  const colRight = 90;
  const rowHeight = 45;
  let rowLeft = 0;
  let rowRight = 0;

  for (let i = 0; i < speakers.length; i++) {
    const initials = speakers[i];
    const speakerDiv = createSpeakerDiv(initials);
    speakerDiv.style.position = 'absolute';

    if (i % 2 === 0) {
      speakerDiv.style.left = `${colLeft}px`;
      speakerDiv.style.top = `${20 + rowLeft * rowHeight}px`;
      rowLeft++;
    } else {
      speakerDiv.style.left = `${colRight}px`;
      speakerDiv.style.top = `${20 + rowRight * rowHeight}px`;
      rowRight++;
    }

    taskWrapper.appendChild(speakerDiv);
  }

  interact('.draggable').draggable({
    inertia: false, // disable inertia

    modifiers: [
      interact.modifiers.restrict({
        restriction: 'parent',
        endOnly: true,
      })
    ],

    listeners: {
      move(event) {
        const target = event.target;

        // Adjust position so that the dragged element centers under the pointer,
        // this fixes the "drag behind finger" hesitation:
        // We get the current pointer position relative to the parent container,
        // then subtract half the width and height of the target element.

        const parentRect = target.parentElement.getBoundingClientRect();
        let pointerX = event.clientX - parentRect.left;
        let pointerY = event.clientY - parentRect.top;

        // Calculate new x,y so center of div is under pointer
        const newX = pointerX - target.offsetWidth / 2;
        const newY = pointerY - target.offsetHeight / 2;

        // Restrict within parent bounds:
        const maxX = target.parentElement.clientWidth - target.offsetWidth;
        const maxY = target.parentElement.clientHeight - target.offsetHeight;

        const clampedX = Math.min(Math.max(newX, 0), maxX);
        const clampedY = Math.min(Math.max(newY, 0), maxY);

        target.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        target.setAttribute('data-x', clampedX);
        target.setAttribute('data-y', clampedY);
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

