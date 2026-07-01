import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  runTransaction,
  get
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const contestants = [
  { id: "chili-1", name: "Blazing Bryan's Chili" },
  { id: "chili-2", name: "Smoky Mountain Chili" },
  { id: "chili-3", name: "Three Alarm Chili" },
  { id: "chili-4", name: "Grandma's Secret Chili" },
  { id: "chili-5", name: "Volcano Verde Chili" },
  { id: "chili-6", name: "Backyard BBQ Chili" }
];

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const voteGrid = document.getElementById("vote-grid");
const voteStatus = document.getElementById("vote-status");
const submitBtn = document.getElementById("submit-vote");
const voteStorageKey = "internChiliContestVote";
let selectedContestantId = null;

function getSavedVote() {
  return localStorage.getItem(voteStorageKey);
}

function saveVote(contestantId) {
  localStorage.setItem(voteStorageKey, contestantId);
}

function showStatus(message, isError = false) {
  voteStatus.textContent = message;
  voteStatus.style.color = isError ? "#c21d14" : "#0f3f6c";
}

function applyVoteLock() {
  const savedVote = getSavedVote();
  if (!savedVote) {
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
  }

  voteGrid.querySelectorAll(".vote-card").forEach((card) => {
    const isSelected = card.dataset.contestant === savedVote;
    card.classList.toggle("is-selected", isSelected);
    card.classList.toggle("is-locked", !isSelected);

    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = isSelected;
      radio.disabled = true;
    }
  });

  const selectedContestant = contestants.find((contestant) => contestant.id === savedVote);
  showStatus(`Your vote is already recorded for ${selectedContestant ? selectedContestant.name : "your choice"}.`);
}

function createContestantCard(contestant) {
  const card = document.createElement("article");
  card.className = "vote-card";
  card.dataset.contestant = contestant.id;

  card.innerHTML = `
    <label class="vote-option">
      <input type="radio" name="selected-contestant" value="${contestant.id}" />
      <div class="vote-content">
        <h2>${contestant.name}</h2>
      </div>
    </label>
  `;

  const radio = card.querySelector('input[type="radio"]');
  radio.addEventListener('change', (e) => {
    selectedContestantId = e.target.value;
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  });

  return card;
}

async function clearStaleVoteLock() {
  const savedVote = getSavedVote();
  if (!savedVote) {
    return;
  }

  try {
    const snap = await get(ref(db, 'votes'));
    if (!snap.exists()) {
      // The votes node was cleared out (new contest round) — release the local lock.
      localStorage.removeItem(voteStorageKey);
    }
  } catch (error) {
    console.error("Failed to check vote state:", error);
  }
}

async function renderContestants() {
  voteGrid.innerHTML = "";
  contestants.forEach((contestant) => {
    voteGrid.appendChild(createContestantCard(contestant));
  });
  await clearStaleVoteLock();
  applyVoteLock();
}

async function castVote(contestantId) {
  if (!contestantId) {
    showStatus("Please select a chili to vote for.", true);
    return false;
  }

  if (getSavedVote()) {
    applyVoteLock();
    return false;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
  }
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
  } catch (error) {
    console.error("Vote failed:", error);
    showStatus("Unable to submit vote. Please try again.", true);
    return false;
  } finally {
    if (submitBtn && !getSavedVote()) {
      submitBtn.disabled = false;
    }
  }
}

renderContestants().then(() => {
  if (!getSavedVote()) {
    showStatus("Choose a chili and submit your vote.");
  }
});

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    if (!selectedContestantId) {
      showStatus('Please select a chili to vote for.', true);
      return;
    }

    const ok = await castVote(selectedContestantId);
    if (ok) {
      window.location.href = 'thankyou.html';
    }
  });
}
