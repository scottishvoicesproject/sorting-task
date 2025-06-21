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

  div.style.position = ''; // no forced position here
  div.style.transform = ''; // allow transform updates
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);

  return div;
}

function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const speakerList = document.getElementById('speaker-list');
  const container = document.getElementById('sorting-container');
  speakerList.innerHTML = '';
  container.innerHTML = '';

  speakers.forEach(initials => {
    const speakerDiv = createSpeakerDiv(initials);
    speakerList.appendChild(speakerDiv);
  });

  interact('.draggable').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent', // restrict drag within immediate parent container
        endOnly: true,
      }),
    ],
    listeners: {
      start(event) {
        const target = event.target;
        // When drag starts, set position absolute so it can move freely within container
        target.style.position = 'absolute';

        // Reset transform so it doesn't jump
        target.style.transform = 'translate(0px, 0px)';
        target.setAttribute('data-x', 0);
        target.setAttribute('data-y', 0);

        // Append to container to allow free drag inside sorting-container
        // Only if dragged from speaker-list to sorting-container
        if (target.parentElement.id === 'speaker-list') {
          document.getElementById('sorting-container').appendChild(target);
        }
      },
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

  const ageInput = document.getElementById('age');
  const genderInput = document.getElementById('gender');
  const age = parseInt(ageInput.value, 10);
  const gender = genderInput.value.trim();

  if (isNaN(age) || age < 4 || age > 17) {
    showError('Please enter a valid age between 4 and 17.');
    ageInput.focus();
    return;
  }

  if (!gender) {
    showError('Please enter your gender.');
    genderInput.focus();
    return;
  }

  document.getElementById('intro-section').style.display = 'none';
  document.getElementById('sorting-section').style.display = 'block';

  const condition = getConditionFromUrl();
  initSorting(condition);
});

