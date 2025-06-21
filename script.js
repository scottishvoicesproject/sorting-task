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

  // Reset positioning for list placement
  div.style.position = 'absolute';
  div.style.transform = '';
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);

  return div;
}

function initSorting(conditionKey, age, gender) {
  const speakers = conditions[conditionKey];
  const container = document.getElementById('sorting-container');
  const speakerList = document.getElementById('speaker-list');
  const dragLayer = document.getElementById('drag-layer');
  const infoAge = document.getElementById('info-age');
  const infoGender = document.getElementById('info-gender');
  const infoCondition = document.getElementById('info-condition');

  // Set info text
  infoAge.textContent = `Age: ${age}`;
  infoGender.textContent = `Gender: ${gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender}`;
  infoCondition.textContent = `Condition: ${conditionKey}`;

  // Clear previous content
  speakerList.innerHTML = '';
  container.innerHTML = '';
  dragLayer.innerHTML = '';   // clear draggable layer

  const colWidth = 60;   // horizontal space between columns
  const rowHeight = 40;  // vertical space between rows

  // Position speakers in two vertical columns on left side (#speaker-list visually),
  // but append draggable elements to #drag-layer for free movement
  speakers.forEach((initials, index) => {
    const speakerDiv = createSpeakerDiv(initials);

    const col = index % 2;  // 0 or 1 (two columns)
    const row = Math.floor(index / 2);

    const x = col * colWidth;
    const y = row * rowHeight;

    speakerDiv.style.left = `${x}px`;
    speakerDiv.style.top = `${y}px`;

    speakerDiv.setAttribute('data-x', x);
    speakerDiv.setAttribute('data-y', y);

    dragLayer.appendChild(speakerDiv); // append draggable to drag-layer
  });

  // Enable dragging on all .draggable elements, free movement anywhere in #sorting-container
  interact('.draggable').draggable({
    inertia: true,
    modifiers: [
      // Keep draggables inside #sorting-container boundaries
      interact.modifiers.restrictRect({
        restriction: '#sorting-container',
        endOnly: true
      })
    ],
    listeners: {
      start(event) {
        event.target.style.zIndex = 10000; // bring on top while dragging
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
        event.target.style.zIndex = 3001; // reset after drag ends
      }
    }
  });
}

document.getElementById('age-gender-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const age = e.target.age.value;
  const gender = e.target.gender.value;
  if (!age || !gender) {
    alert('Please fill in both age and gender');
    return;
  }
  const cond = getConditionFromUrl();

  // Hide intro, show sorting screen
  document.querySelector('.intro-box').classList.add('hidden');
  document.getElementById('sorting-section').classList.remove('hidden');

  // Initialize sorting grid with chosen condition and info
  initSorting(cond, age, gender);
});

// Back button to return to intro form
document.getElementById('back-button').addEventListener('click', () => {
  // Pause any playing audio
  if (audioPlaying) {
    audioPlaying.pause();
    audioPlaying = null;
  }
  // Hide sorting, show intro
  document.getElementById('sorting-section').classList.add('hidden');
  document.querySelector('.intro-box').classList.remove('hidden');
});
