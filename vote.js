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
<<<<<<< Updated upstream
const submitBtn = document.getElementById("submit-vote");
let selectedContestantId = null;
=======
const voteStorageKey = "internChiliContestVote";
const thankYouPage = "thankyou.html";
>>>>>>> Stashed changes

function getSavedVote() {
  return localStorage.getItem(voteStorageKey);
}

function saveVote(contestantId) {
  localStorage.setItem(voteStorageKey, contestantId);
}

function applyVoteLock() {
  const savedVote = getSavedVote();
  const buttons = voteGrid.querySelectorAll(".vote-btn");

  buttons.forEach((button) => {
    const card = button.closest(".vote-card");
    const isSelected = card?.dataset.contestant === savedVote;

    button.disabled = Boolean(savedVote);
    button.textContent = isSelected ? "Voted" : "Locked";
    card?.classList.toggle("is-selected", isSelected);
    card?.classList.toggle("is-locked", Boolean(savedVote) && !isSelected);
  });

  if (savedVote) {
    showStatus("Your vote is locked in. Thanks for choosing your favorite bowl.");
  }
}

function createContestantCard(contestant) {
  const card = document.createElement("article");
  card.className = "vote-card";
  card.dataset.contestant = contestant.id;

  card.innerHTML = `
<<<<<<< Updated upstream
    <label class="vote-option">
      <input type="radio" name="selected-contestant" value="${contestant.id}" />
      <div class="vote-content">
        <h2>${contestant.name}</h2>
        <div class="vote-count">Votes: <span>${count}</span></div>
      </div>
    </label>
=======
    <h2>${contestant.name}</h2>
    <div class="vote-card-footer">
      <button class="vote-btn" type="button">Vote</button>
    </div>
>>>>>>> Stashed changes
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
    voteGrid.appendChild(createContestantCard(contestant));
  });

  applyVoteLock();
}

function updateVoteCounts(voteCounts = {}) {
  applyVoteLock();
}

function showStatus(message, isError = false) {
  voteStatus.textContent = message;
  voteStatus.style.color = isError ? "#c21d14" : "#0f3f6c";
}

<<<<<<< Updated upstream
async function castVote(contestantId) {
  if (!contestantId) {
    showStatus("No contestant selected.", true);
    return false;
  }

  if (submitBtn) submitBtn.disabled = true;
=======
async function castVote(contestantId, button) {
  if (getSavedVote()) {
    applyVoteLock();
    return;
  }

  button.disabled = true;
>>>>>>> Stashed changes
  showStatus("Submitting your vote...");

  try {
    const voteRef = ref(db, `votes/${contestantId}`);
    await runTransaction(voteRef, (current) => {
      return (current || 0) + 1;
    });

    saveVote(contestantId);
    applyVoteLock();
    showStatus("Thanks for voting! Your choice has been saved.");
    return true;
    window.setTimeout(() => {
      window.location.href = thankYouPage;
    }, 700);
  } catch (error) {
    console.error("Vote failed:", error);
    showStatus("Unable to submit vote. Please try again.", true);
    return false;
  } finally {
<<<<<<< Updated upstream
    if (submitBtn) submitBtn.disabled = false;
=======
    if (!getSavedVote()) {
      button.disabled = false;
    }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
if (!getSavedVote()) {
  showStatus("Loading current vote counts...");
>>>>>>> Stashed changes
}
