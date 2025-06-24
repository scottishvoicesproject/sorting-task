// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase Config & Initialization
const firebaseConfig = {
  apiKey: "AIzaSyAdWaaaC7z8NK8kd1sBiu6RIS6-BSt4r7I",
  authDomain: "github-b374d.firebaseapp.com",
  projectId: "github-b374d",
  storageBucket: "github-b374d-storage-001.appspot.com"
  messagingSenderId: "48472764273",
  appId: "1:48472764273:web:491df1cfe8aa57ee2590d0",
  measurementId: "G-YN6NKG5NH2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app, "gs://github-b374d-storage-001.appspot.com");

let cond = null;
let audioPlaying = null;

// Speaker Condition Mapping
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

// Age-based Assignment
const ageConditionTargets = {
  "4-6": { F_SSEvsL1: 8, F_SSEvsL2: 6, F_SSEvsP1: 4, F_SSEvsP2: 4, M_SSEvsL1: 8, M_SSEvsL2: 6, M_SSEvsP1: 6, M_SSEvsP2: 4 },
  "7-8": { F_SSEvsL1: 2, F_SSEvsL2: 0, F_SSEvsP1: 4, F_SSEvsP2: 4, M_SSEvsL1: 2, M_SSEvsL2: 4, M_SSEvsP1: 4, M_SSEvsP2: 0 },
  "9-10": { M_SSEvsL1: 4 },
  "11-12": { F_SSEvsL1: 4, F_SSEvsP1: 4, F_SSEvsP2: 4, M_SSEvsL2: 6, M_SSEvsP1: 4, M_SSEvsP2: 4 },
  "13-15": { F_SSEvsL1: 10, F_SSEvsL2: 6, F_SSEvsP1: 10, F_SSEvsP2: 10, M_SSEvsL1: 6, M_SSEvsL2: 10, M_SSEvsP1: 10, M_SSEvsP2: 8 },
  "16-17": { F_SSEvsL1: 6, F_SSEvsL2: 8, F_SSEvsP1: 8, F_SSEvsP2: 8, M_SSEvsL1: 6, M_SSEvsL2: 6, M_SSEvsP1: 6, M_SSEvsP2: 2 }
};

function getConditionByAgePriority(age) {
  const selectedRange = Object.keys(ageConditionTargets).find(range =>
    age >= parseInt(range.split('-')[0]) && age <= parseInt(range.split('-')[1])
  );
  const pool = selectedRange && ageConditionTargets[selectedRange];
  if (!pool) return getRandomCondition();

  const available = Object.entries(pool).filter(([_, count]) => count > 0).map(([key]) => key);
  if (available.length === 0) return getRandomCondition();

  const chosen = available[Math.floor(Math.random() * available.length)];
  ageConditionTargets[selectedRange][chosen]--;
  return chosen;
}

function getRandomCondition() {
  const all = Object.keys(conditions);
  return all[Math.floor(Math.random() * all.length)];
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
      const lastBtn = audioPlaying.parentElement?.querySelector('.speaker-button');
      if (lastBtn) lastBtn.classList.remove('playing');
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
  const wrapper = document.getElementById('task-wrapper');
  wrapper.querySelectorAll('.draggable').forEach(el => el.remove());

  const isMobile = window.innerWidth < 768;
  const left = isMobile ? -160 : -140;
  const right = isMobile ? -80 : -75;
  const step = 50;
  let leftRow = 0;
  let rightRow = 0;

  speakers.forEach((initials, i) => {
    const speaker = createSpeakerDiv(initials);
    speaker.style.position = 'absolute';
    speaker.style.zIndex = '10';
    const x = i % 2 === 0 ? left : right;
    const y = 60 + (i % 2 === 0 ? leftRow++ : rightRow++) * step;
    speaker.style.left = `${x}px`;
    speaker.style.top = `${y}px`;
    wrapper.appendChild(speaker);
  });

  interact('.draggable').draggable({
    inertia: false,
    modifiers: [],
    autoScroll: true,
    touchAction: 'none',
    listeners: {
      start(event) { event.target.classList.add('dragging'); },
      move(event) {
        const el = event.target;
        let x = (parseFloat(el.getAttribute('data-x')) || 0) + event.dx;
        let y = (parseFloat(el.getAttribute('data-y')) || 0) + event.dy;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.setAttribute('data-x', x);
        el.setAttribute('data-y', y);
      },
      end(event) { event.target.classList.remove('dragging'); }
    }
  });
}
function hideError() {
  const errEl = document.getElementById('error-message');
  errEl.textContent = '';
  errEl.style.display = 'none';
}

function showError(msg) {
  const errEl = document.getElementById('error-message');
  errEl.textContent = msg;
  errEl.style.display = 'block';
}

function checkOrientationWarning() {
  const rotateWarning = document.getElementById('rotate-warning');
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  const isActive = document.body.classList.contains('task-active');
  if (rotateWarning) {
    rotateWarning.style.display = (isPortrait && isActive) ? 'flex' : 'none';
  }
}

window.addEventListener('resize', checkOrientationWarning);
window.addEventListener('orientationchange', checkOrientationWarning);

document.addEventListener('DOMContentLoaded', () => {
  hideError();
  setupInstructionToggles();
  handleAutoStartFromURL();
  setupManualFormFlow();
  setupSubmissionHandler();
});

function setupInstructionToggles() {
  const hideBtn = document.getElementById('hide-instructions');
  const showBtn = document.getElementById('show-instructions');
  const instructions = document.getElementById('instructions');
  if (!hideBtn || !showBtn || !instructions) return;

  hideBtn.onclick = () => {
    instructions.classList.add('hide');
    hideBtn.style.display = 'none';
    showBtn.style.display = 'inline-block';
  };

  showBtn.onclick = () => {
    instructions.classList.remove('hide');
    hideBtn.style.display = 'inline-block';
    showBtn.style.display = 'none';
  };
}

function handleAutoStartFromURL() {
  const params = new URLSearchParams(window.location.search);
  const age = parseInt(params.get("age"));
  const gender = params.get("gender");

  if (age && gender) {
    cond = getConditionByAgePriority(age);
    if (!conditions[cond]) {
      showError("Something went wrong assigning your task. Please refresh and try again.");
      return;
    }

    sessionStorage.setItem('taskStartTime', Date.now());
    document.getElementById('intro-box').style.display = 'none';
    document.getElementById('sorting-section').style.display = 'flex';
    document.body.classList.add('task-active');
    checkOrientationWarning();
    requestAnimationFrame(() => requestAnimationFrame(() => initSorting(cond)));
  }
}

function setupManualFormFlow() {
  const form = document.getElementById('age-gender-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideError();

    const age = parseInt(document.getElementById('age').value.trim());
    const gender = document.getElementById('gender').value;

    if (!age || age < 4 || age > 17) {
      showError("Please enter a valid age between 4 and 17.");
      return;
    }

    if (!gender) {
      showError("Please select a gender.");
      return;
    }

    cond = getConditionByAgePriority(age);
    if (!conditions[cond]) {
      showError("Something went wrong assigning your task. Please refresh and try again.");
      return;
    }

    sessionStorage.setItem('taskStartTime', Date.now());
    document.getElementById('intro-box').style.display = 'none';
    document.getElementById('sorting-section').style.display = 'flex';
    document.body.classList.add('task-active');
    checkOrientationWarning();
    requestAnimationFrame(() => requestAnimationFrame(() => initSorting(cond)));
  });
}

function setupSubmissionHandler() {
  const submitBtn = document.getElementById('submit-button');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const grid = document.getElementById('sorting-container');
    const icons = document.querySelectorAll('.draggable');
    const gridRect = grid.getBoundingClientRect();

    let allInside = true;
    icons.forEach(icon => {
      const rect = icon.getBoundingClientRect();
      const inside = rect.left >= gridRect.left &&
                     rect.right <= gridRect.right &&
                     rect.top >= gridRect.top &&
                     rect.bottom <= gridRect.bottom;
      icon.classList.toggle('out-of-bounds', !inside);
      if (!inside) allInside = false;
    });

    if (!allInside) {
      alert("Oops! Please place all icons fully inside the grid before submitting.");
      return;
    }

    if (!confirm("Are you sure you want to submit the task?")) return;

    html2canvas(document.getElementById('task-wrapper')).then(canvas => {
      const screenshotData = canvas.toDataURL('image/png');
      const age = parseInt(document.getElementById('age').value.trim());
      const gender = document.getElementById('gender').value;
      const start = Number(sessionStorage.getItem('taskStartTime')) || Date.now();
      const duration = Math.round((Date.now() - start) / 1000);
      const timestamp = new Date().toISOString();

      console.log("📸 Screenshot captured, size:", screenshotData.length);

      addDoc(collection(db, "submissions"), {
        age,
        gender,
        condition: cond,
        timestamp,
        duration_seconds: duration,
        completion: "complete"
      })
      .then(docRef => {
        const filePath = `screenshots/${docRef.id}.png`;
        const fileRef = ref(storage, filePath);

        const byteString = atob(screenshotData.split(',')[1]);
        const intArray = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([intArray], { type: 'image/png' });
        console.log("⬆️ Uploading to Firebase Storage:", filePath);

        return uploadBytes(fileRef, blob)
          .then(snapshot => {
            console.log("✅ Upload complete:", snapshot.metadata.fullPath);

            // Try updating Firestore with path
            return updateDoc(doc(db, "submissions", docRef.id), { screenshot: filePath })
              .catch(updateErr => {
                console.warn("⚠️ Could not update Firestore with screenshot path:", updateErr);
              })
              .then(() => getDownloadURL(fileRef));
          });
      })
      .then(downloadURL => {
        console.log("🌐 Screenshot accessible at:", downloadURL);
        sessionStorage.setItem('assignedCondition', cond);
        window.location.href = `thankyou.html?cond=${cond}&screenshot=${encodeURIComponent(downloadURL)}`;
      })
      .catch(err => {
        console.error("❌ Final submission step failed:", err);
        alert("There was a problem saving your work. Please check your connection and try again.");
      });
    });
  });
}

