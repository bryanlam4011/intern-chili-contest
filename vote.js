import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  runTransaction,
  onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const contestants = [
  {
    id: "spicy-sunrise",
    name: "Spicy Sunrise",
    description: "A bold chili entry with smoky peppers and bright citrus notes."
  },
  {
    id: "lava-lobster",
    name: "Lava Lobster",
    description: "Rich, savory flavors balanced by a spicy lobster-inspired twist."
  },
  {
    id: "fiery-flora",
    name: "Fiery Flora",
    description: "Herb-forward chili with a floral finish and a spicy punch."
  },
  {
    id: "blazing-breeze",
    name: "Blazing Breeze",
    description: "Creamy heat with a fresh, uplifting chili aroma and texture."
  }
];

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const votesRef = ref(db, "votes");
const voteGrid = document.getElementById("vote-grid");
const voteStatus = document.getElementById("vote-status");

function createContestantCard(contestant, count = 0) {
  const card = document.createElement("article");
  card.className = "vote-card";
  card.dataset.contestant = contestant.id;

  card.innerHTML = `
    <h2>${contestant.name}</h2>
    <p>${contestant.description}</p>
    <div class="vote-count">Votes: <span>${count}</span></div>
    <button class="vote-btn" type="button">Vote</button>
  `;

  const button = card.querySelector(".vote-btn");
  button.addEventListener("click", () => castVote(contestant.id, button));

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

async function castVote(contestantId, button) {
  button.disabled = true;
  showStatus("Submitting your vote...");

  try {
    const voteRef = ref(db, `votes/${contestantId}`);
    await runTransaction(voteRef, (current) => {
      return (current || 0) + 1;
    });

    showStatus("Thanks for voting! Your choice has been saved.");
  } catch (error) {
    console.error("Vote failed:", error);
    showStatus("Unable to submit vote. Please try again.", true);
  } finally {
    button.disabled = false;
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
