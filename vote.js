import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  runTransaction,
  onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const contestants = [
  { id: "chili-1", name: "Chili #1" },
  { id: "chili-2", name: "Chili #2" },
  { id: "chili-3", name: "Chili #3" },
  { id: "chili-4", name: "Chili #4" },
  { id: "chili-5", name: "Chili #5" },
  { id: "chili-6", name: "Chili #6" }
];

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const votesRef = ref(db, "votes");
const voteGrid = document.getElementById("vote-grid");
const voteStatus = document.getElementById("vote-status");
const submitBtn = document.getElementById("submit-vote");
let selectedContestantId = null;

function createContestantCard(contestant, count = 0) {
  const card = document.createElement("article");
  card.className = "vote-card";
  card.dataset.contestant = contestant.id;

  card.innerHTML = `
    <label class="vote-option">
      <input type="radio" name="selected-contestant" value="${contestant.id}" />
      <div class="vote-content">
        <h2>${contestant.name}</h2>
        <div class="vote-count">Votes: <span>${count}</span></div>
      </div>
    </label>
  `;

  const radio = card.querySelector('input[type="radio"]');
  radio.addEventListener('change', (e) => {
    selectedContestantId = e.target.value;
    if (submitBtn) submitBtn.disabled = false;
  });

  return card;
}

function renderContestants(voteCounts = {}) {
  voteGrid.innerHTML = "";

  contestants.forEach((contestant) => {
    const count = typeof voteCounts[contestant.id] === "number" ? voteCounts[contestant.id] : 0;
    voteGrid.appendChild(createContestantCard(contestant, count));
  });
}

function updateVoteCounts(voteCounts = {}) {
  contestants.forEach((contestant) => {
    const card = voteGrid.querySelector(`.vote-card[data-contestant="${contestant.id}"]`);
    if (!card) return;
    const countEl = card.querySelector(".vote-count span");
    countEl.textContent = voteCounts[contestant.id] || 0;
  });
}

function showStatus(message, isError = false) {
  voteStatus.textContent = message;
  voteStatus.style.color = isError ? "#c21d14" : "#0f3f6c";
}

async function castVote(contestantId) {
  if (!contestantId) {
    showStatus("No contestant selected.", true);
    return false;
  }

  if (submitBtn) submitBtn.disabled = true;
  showStatus("Submitting your vote...");

  try {
    const voteRef = ref(db, `votes/${contestantId}`);
    await runTransaction(voteRef, (current) => {
      return (current || 0) + 1;
    });

    showStatus("Thanks for voting! Your choice has been saved.");
    return true;
  } catch (error) {
    console.error("Vote failed:", error);
    showStatus("Unable to submit vote. Please try again.", true);
    return false;
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

onValue(votesRef, (snapshot) => {
  const voteCounts = snapshot.exists() ? snapshot.val() : {};
  if (voteGrid.children.length === 0) {
    renderContestants(voteCounts);
  } else {
    updateVoteCounts(voteCounts);
  }
});

renderContestants();
showStatus("Loading current vote counts...");

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    if (!selectedContestantId) {
      showStatus('Please select a contestant to vote for.', true);
      return;
    }

    const ok = await castVote(selectedContestantId);
    if (ok) {
      window.location.href = 'thankyou.html';
    }
  });
}
