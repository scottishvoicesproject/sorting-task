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
  return (cond && conditions[cond]) ? cond : Object.keys(conditions)[Math.floor(Math.random() * Object.keys(conditions).length)];
}

function createSpeakerDiv(initials, x, y) {
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
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.style.position = 'absolute';

  document.body.appendChild(div);
}

function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const spacingY = 50;
  const leftX = 20;
  const rightX = 90;
  let row = 0;

  for (let i = 0; i < speakers.length; i++) {
    const isLeft = i % 2 === 0;
    const x = isLeft ? leftX : rightX;
    const y = 120 + row * spacingY;
    createSpeakerDiv(speakers[i], x, y);
    if (!isLeft) row++;
  }

  interact('.draggable').draggable({
    inertia: true,
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

  if (!age || age < 1 || age > 120) {
    showError('Please enter a valid age between 1 and 120.');
    return;
  }

  if (!gender) {
    showError('Please select a gender.');
    return;
  }

  document.getElementById('intro-box').style.display = 'none';
  document.getElementById('sorting-section').style.display = 'block';
  document.body.classList.add('task-active');

  const cond = getConditionFromUrl();
  initSorting(cond);
  checkOrientation();
});

document.getElementById('hide-instructions').addEventListener('click', () => {
  document.getElementById('instructions').classList.remove('show');
  document.getElementById('instructions').classList.add('hide');
  document.getElementById('hide-instructions').style.display = 'none';
  document.getElementById('show-instructions').style.display = 'inline-block';
});

document.getElementById('show-instructions').addEventListener('click', () => {
  document.getElementById('instructions').classList.remove('hide');
  document.getElementById('instructions').classList.add('show');
  document.getElementById('show-instructions').style.display = 'none';
  document.getElementById('hide-instructions').style.display = 'inline-block';
});

function checkOrientation() {
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  const isMobile = window.innerWidth <= 768;
  const sortingVisible = document.getElementById('sorting-section').style.display === 'block';
  const warning = document.getElementById('rotate-warning');

  if (isMobile && isPortrait && sortingVisible) {
    warning.style.display = 'flex';
  } else {
    warning.style.display = 'none';
  }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

document.addEventListener('DOMContentLoaded', () => {
  hideError();
  checkOrientation();
});
