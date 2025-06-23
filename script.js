let cond = null; // Global condition holder
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
  "4-6": { F_SSEvsL1: 4, F_SSEvsL2: 3, F_SSEvsP1: 2, F_SSEvsP2: 2, M_SSEvsL1: 4, M_SSEvsL2: 3, M_SSEvsP1: 3, M_SSEvsP2: 2 },
  "7-8": { F_SSEvsL1: 1, F_SSEvsL2: 0, F_SSEvsP1: 2, F_SSEvsP2: 2, M_SSEvsL1: 1, M_SSEvsL2: 2, M_SSEvsP1: 2, M_SSEvsP2: 0 },
  "9-10": { M_SSEvsL1: 2 },
  "11-12": { F_SSEvsL1: 2, F_SSEvsP1: 2, F_SSEvsP2: 2, M_SSEvsL2: 3, M_SSEvsP1: 2, M_SSEvsP2: 2 },
  "13-15": { F_SSEvsL1: 5, F_SSEvsL2: 3, F_SSEvsP1: 5, F_SSEvsP2: 5, M_SSEvsL1: 3, M_SSEvsL2: 5, M_SSEvsP1: 5, M_SSEvsP2: 4 },
  "16-17": { F_SSEvsL1: 3, F_SSEvsL2: 4, F_SSEvsP1: 4, F_SSEvsP2: 4, M_SSEvsL1: 3, M_SSEvsL2: 3, M_SSEvsP1: 3, M_SSEvsP2: 1 }
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
  if (!selectedRange || !ageConditionTargets[selectedRange]) return getRandomCondition();

  const pool = ageConditionTargets[selectedRange];
  const max = Math.max(...Object.values(pool));

  // ✅ NEW safety check: if all values are 0
  if (max === 0) return getRandomCondition();

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
      const prev = audioPlaying.parentElement?.querySelector('.speaker-button');
      if (prev) prev.classList.remove('playing');
    }

    if (audio.paused) {
      audio.play();
      audioPlaying = audio;
      btn.classList.add('playing');
    } else {
      audio.pause();
      audioPlaying = null;
      btn.classList.remove('playing');
    }

    audio.onended = () => {
      btn.classList.remove('playing');
      if (audioPlaying === audio) audioPlaying = null;
    };
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
    autoScroll: true,
    delay: 0,
    touchAction: 'none',
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

  // ✅ FORM SUBMISSION HANDLER
  const form = document.getElementById('age-gender-form');
  if (form) {
    form.addEventListener('submit', (e) => {
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

      sessionStorage.setItem('taskStartTime', Date.now());

      document.getElementById('intro-box').style.display = 'none';
      document.getElementById('sorting-section').style.display = 'flex';
      document.body.classList.add('task-active');
      checkOrientationWarning();

      cond = getConditionByAgePriority(age);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initSorting(cond);
        });
      });
    });
  }

// ✅ SUBMIT TASK HANDLER
const submitBtn = document.getElementById('submit-button');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    const grid = document.getElementById('sorting-container');
    const icons = document.querySelectorAll('.draggable');
    const gridRect = grid.getBoundingClientRect();

    let allInside = true;

    icons.forEach(icon => {
      const iconRect = icon.getBoundingClientRect();
      const isInside =
        iconRect.left >= gridRect.left &&
        iconRect.right <= gridRect.right &&
        iconRect.top >= gridRect.top &&
        iconRect.bottom <= gridRect.bottom;

      icon.classList.toggle('out-of-bounds', !isInside);
      if (!isInside) allInside = false;
    });

    if (!allInside) {
      alert('Oops! Please place all icons fully inside the grid before submitting.');
      return;
    }

    if (confirm("Are you sure you want to submit the task?")) {
      html2canvas(document.getElementById('task-wrapper')).then(canvas => {
        const screenshotData = canvas.toDataURL('image/png');
        const age = parseInt(document.getElementById('age').value.trim());
        const gender = document.getElementById('gender').value;
        const taskStart = Number(sessionStorage.getItem('taskStartTime'));
        const taskDuration = Math.round((Date.now() - taskStart) / 1000);
        const timestamp = new Date().toISOString();

        db.collection("submissions").add({
          age,
          gender,
          condition: cond,
          timestamp,
          duration_seconds: taskDuration,
          completion: "complete"
        })
        .then(docRef => {
          return fetch(screenshotData)
            .then(res => res.blob())
            .then(blob => {
              const fileRef = storage.ref().child(`screenshots/${docRef.id}.png`);
              return fileRef.put(blob);
            })
            .then(() => docRef.id);
        })
        .then(docId => {
          sessionStorage.setItem('submissionScreenshot', screenshotData);
          sessionStorage.setItem('assignedCondition', cond);
          console.log("✅ Submission complete — ID:", docId);
          window.location.href = `thankyou.html?cond=${cond}`;
        })
        .catch(error => {
          console.error("❌ Firebase submission failed:", error);
          alert("There was a problem submitting your task. Please try again.");
        });
      });
    }
  });
}




