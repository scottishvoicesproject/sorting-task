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

  // reset positioning for list placement
  div.style.position = 'absolute';
  div.style.transform = '';
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);

  return div;
}

function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const container = document.getElementById('sorting-container');
  const speakerList = document.getElementById('speaker-list');
  const dragLayer = document.getElementById('drag-layer');

  // Clear previous content
  speakerList.innerHTML = '';
  container.innerHTML = '';
  dragLayer.innerHTML = '';

  // Show instructions above sorting container
  let instructions = document.getElementById('instructions');
  if (!instructions) {
    instructions = document.createElement('div');
    instructions.id = 'instructions';
    container.parentNode.insertBefore(instructions, container);
  }
  instructions.textContent = `These 12 icons have the initials of 12 speakers who all are saying the same sentence. Once you click on an icon, you can hear the speaker. Your task is to listen to all speakers and to move the rectangles onto the grid to group them together by how similar they sound in how they speak. Place the blocks close to each other if you think they belong to one group and further apart if they sound different. The distance between different groups does not matter. You can listen to the speakers as often as you want to, and you can build as few or as many groupings as you like.`;

  const colWidth = 60;   // horizontal space between columns
  const rowHeight = 40;  // vertical space between rows

  // Position speakers in two vertical columns on left side (#speaker-list visually),
  // but append draggable elements to #drag-layer for free movement
  speakers.forEach((initials, index) => {
    const speakerDiv = createSpeakerDiv(initials);

    const col = index % 2;  // 0 or 1 (two columns)
    const row = Math.floor(index / 2);

    const x = col * colWidth + speakerList.offsetLeft;
    const y = row * rowHeight + speakerList.offsetTop;

    speakerDiv.style.left = `${x}px`;
    speakerDiv.style.top = `${y}px`;

    speakerDiv.setAttribute('data-x', x);
    speakerDiv.setAttribute('data-y', y);

    dragLayer.appendChild(speakerDiv);
  });

  // Enable dragging on all .draggable elements, free movement anywhere in #task-wrapper
  interact('.draggable').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: '#task-wrapper',
        endOnly: true
      })
    ],
    listeners: {
      start(event) {
        event.target.style.zIndex = 10000;
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
        event.target.style.zIndex = 3001;
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

  // Hide intro, show sorting section
  document.getElementById('intro-box').style.display = 'none';
  document.getElementById('sorting-section').style.display = 'flex';

  // Use URL parameter or pick random condition
  const cond = getConditionFromUrl();
  initSorting(cond);
});

document.addEventListener('DOMContentLoaded', () => {
  // Nothing to do on load — wait for form submit
});

