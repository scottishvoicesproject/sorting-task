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

  // Clear existing speakers
  taskWrapper.querySelectorAll('.draggable').forEach(el => el.remove());

  const isSmallScreen = window.innerWidth < 600;

  // On small screens, use flex column layout, otherwise absolute positioning
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

  interact('.draggable').draggable
