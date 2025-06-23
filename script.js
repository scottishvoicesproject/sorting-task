let cond = null; // stores the assigned condition across functions
let audioPlaying = null;

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

const ageConditionTargets = {
  "4-6": {
    F_SSEvsL1: 4, F_SSEvsL2: 3, F_SSEvsP1: 2, F_SSEvsP2: 2,
    M_SSEvsL1: 4, M_SSEvsL2: 3, M_SSEvsP1: 3, M_SSEvsP2: 2
  },
  "7-8": {
    F_SSEvsL1: 1, F_SSEvsL2: 0, F_SSEvsP1: 2, F_SSEvsP2: 2,
    M_SSEvsL1: 1, M_SSEvsL2: 2, M_SSEvsP1: 2, M_SSEvsP2: 0
  },
  "9-10": {
    M_SSEvsL1: 2
  },
  "11-12": {
    F_SSEvsL1: 2, F_SSEvsP1: 2, F_SSEvsP2: 2,
    M_SSEvsL2: 3, M_SSEvsP1: 2, M_SSEvsP2: 2
  },
  "13-15": {
    F_SSEvsL1: 5, F_SSEvsL2: 3, F_SSEvsP1: 5, F_SSEvsP2: 5,
    M_SSEvsL1: 3, M_SSEvsL2: 5, M_SSEvsP1: 5, M_SSEvsP2: 4
  },
  "16-17": {
    F_SSEvsL1: 3, F_SSEvsL2: 4, F_SSEvsP1: 4, F_SSEvsP2: 4,
    M_SSEvsL1: 3, M_SSEvsL2: 3, M_SSEvsP1: 3, M_SSEvsP2: 1
  }
};

function getConditionByAgePriority(age) {
  const ranges = {
    "4-6": age >= 4 && age <= 6,
    "7-8": age >= 7 && age <= 8,
    "9-10": age >= 9 && age <= 10,
    "11-12": age >= 11 && age <= 12,
    "13-15": age >= 13 && age <= 15,
    "16-17": age >= 16 && age <= 17
  };

  const selectedRange = Object.keys(ranges).find(r => ranges[r]);
  if (!selectedRange || !ageConditionTargets[selectedRange]) {
    return getRandomCondition();
  }

  const pool = ageConditionTargets[selectedRange];
  const max = Math.max(...Object.values(pool));
  const topConditions = Object.entries(pool)
    .filter(([_, count]) => count === max && count > 0)
    .map(([key]) => key);

  if (topConditions.length === 0) return getRandomCondition();

  const selected = topConditions[Math.floor(Math.random() * topConditions.length)];
  ageConditionTargets[selectedRange][selected]--;
  return selected;
}

function getRandomCondition() {
  const keys = Object.keys(conditions);
  return keys[Math.floor(Math.random() * keys.length)];
}
function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const taskWrapper = document.getElementById('task-wrapper');
  taskWrapper.querySelectorAll('.draggable').forEach(el => el.remove());

  const isMobile = window.innerWidth < 768;
  const colLeft = isMobile ? -160 : -140;
  const colRight = isMobile ? -80 : -75;
  const rowHeight = 50;
  let rowLeft = 0;
  let rowRight = 0;

  for (let i = 0; i < speakers.length; i++) {
    const initials = speakers[i];
    const speakerDiv = createSpeakerDiv(initials);
    speakerDiv.style.position = 'absolute';
    speakerDiv.style.zIndex = '10';

    if (i % 2 === 0) {
      speakerDiv.style.left = `${colLeft}px`;
      speakerDiv.style.top = `${60 + rowLeft * rowHeight}px`;
      rowLeft++;
    } else {
      speakerDiv.style.left = `${colRight}px`;
      speakerDiv.style.top = `${60 + rowRight * rowHeight}px`;
      rowRight++;
    }

    taskWrapper.appendChild(speakerDiv);
  }

  interact('.draggable').draggable({
    inertia: false,
    modifiers: [],
    autoScroll: false,
    delay: 0,
    listeners: {
      start(event) {
        event.target.classList.add('dragging');
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
        event.target.classList.remove('dragging');
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

function checkOrientationWarning() {
  const rotateWarning = document.getElementById('rotate-warning');
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  const isTaskActive = document.body.classList.contains('task-active');
  if (rotateWarning) {
    rotateWarning.style.display = (isPortrait && isTaskActive) ? 'flex' : 'none';
  }
}

// 🔄 Recheck orientation on screen resize or rotation
window.addEventListener('resize', checkOrientationWarning);
window.addEventListener('orientationchange', checkOrientationWarning);

document.addEventListener('DOMContentLoaded', () => {
  hideError();

  const hideBtn = document.getElementById('hide-instructions');
  const showBtn = document.getElementById('show-instructions');
  const instructions = document.getElementById('instructions');

  if (hideBtn && showBtn && instructions) {
    hideBtn.addEventListener('click', () => {
      instructions.classList.add('hide');
      hideBtn.style.display = 'none';
      showBtn.style.display = 'inline-block';
    });
    showBtn.addEventListener('click', () => {
      instructions.classList.remove('hide');
      hideBtn.style.display = 'inline-block';
      showBtn.style.display = 'none';
    });
  }

  const submitBtn = document.getElementById('submit-button');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to submit the task?")) {
        html2canvas(document.getElementById('task-wrapper')).then(canvas => {
          const screenshotData = canvas.toDataURL('image/png');
          sessionStorage.setItem('submissionScreenshot', screenshotData);
          sessionStorage.setItem('assignedCondition', cond);
          window.location.href = `thankyou.html?cond=${cond}`;
        });
      }
    });
  }
});

