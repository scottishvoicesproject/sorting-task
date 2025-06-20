// 🧩 All condition mappings
const conditions = {
  M_SSEvsP1: ['GI','PX','TV','BF','MB','CQ','KN','UI','EQ','TE','DM','EW'],
  M_SSEvsP2: ['TD','DG','WI','QE','HY','XU','VO','EL','JG','WR','UN','HZ'],
  M_SSEvsL1: ['US','TK','MB','KN','EQ','MF','GI','TV','QN','FI','DM','RU'],
  M_SSEvsL2: ['TD','DG','KD','EK','QE','XU','VI','HS','WI','EL','PP','WW'],
  F_SSEvsP1: ['XL','WN','KY','GQ','YR','VW','RX','BN','KX','BK','MP','PM'],
  F_SSEvsP2: ['IT','KZ','JS','RN','MW','XN','RF','LM','ZY','DI','PR','HG'],
  F_SSEvsL1: ['YR','FN','WN','BK','XL','OS','BN','GQ','ZP','SJ','KL','VG'],
  F_SSEvsL2: ['MC','MM','ZY','KP','KK','JY','MW','RF','XN','RN','PR','JT'],
};

// 🔍 Get condition from URL (e.g. ?cond=M_SSEvsP1)
const urlParams = new URLSearchParams(window.location.search);
const condition = urlParams.get('cond');

const speakerContainer = document.getElementById('speakers');

// Age gating
document.getElementById("age-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const age = parseInt(document.getElementById("age").value);
  if (age >= 3 && age <= 17) {
    document.getElementById("age-form").style.display = "none";
    document.getElementById("task").style.display = "block";
    loadCondition();
  } else {
    alert("Sorry, only participants aged 3–17 can take part.");
  }
});

// 🧱 Build speaker boxes for condition
function loadCondition() {
  const speakers = conditions[condition];
  if (!speakers) {
    speakerContainer.innerHTML = `<p>Invalid or missing condition: ${condition}</p>`;
    return;
  }

  speakers.forEach(initials => {
    const div = document.createElement('div');
    div.className = 'draggable';
    div.dataset.id = initials;
    div.textContent = initials;
    div.addEventListener('click', () => {
      new Audio(`audio/${initials}.wav`).play();
    });
    speakerContainer.appendChild(div);
  });

  setupDrag();
}

// 🎯 Drag and drop functionality using Interact.js
function setupDrag() {
  interact('.draggable').draggable({
    inertia: true,
    autoScroll: true,
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  });

  interact('.dropzone').dropzone({
    accept: '.draggable',
    overlap: 0.75,
    ondrop(event) {
      event.target.appendChild(event.relatedTarget);
    }
  });
}

// 🔄 Submit button (just placeholder for now)
function submitData() {
  alert(`Thanks! (Condition: ${condition}). Data saving coming next.`);
}

