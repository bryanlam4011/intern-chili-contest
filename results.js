import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const voteStorageKey = "internChiliContestVote";
const savedVote = localStorage.getItem(voteStorageKey);

// Prevent access if the user hasn't voted
if (!savedVote) {
  window.location.href = 'vote.html';
}

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

const winnerNameEl = document.getElementById('winner-name');
const winnerCountEl = document.getElementById('winner-count');
const winnerTextEl = document.getElementById('winner-text');
const resultsListEl = document.getElementById('results-list');

async function fetchResults() {
  try {
    const snap = await get(ref(db, 'votes'));
    const votes = snap.exists() ? snap.val() : {};

    let winner = null;
    let max = -1;

    contestants.forEach(c => {
      const count = votes[c.id] || 0;
      if (count > max) {
        max = count;
        winner = { ...c, count };
      }

      const li = document.createElement('li');
      li.textContent = `${c.name}: ${count} vote${count !== 1 ? 's' : ''}`;
      resultsListEl.appendChild(li);
    });

    if (winner) {
      winnerTextEl.textContent = 'Winner:';
      winnerNameEl.textContent = winner.name;
      winnerCountEl.textContent = `${winner.count} vote${winner.count !== 1 ? 's' : ''}`;
    } else {
      winnerTextEl.textContent = 'No votes yet.';
      winnerNameEl.textContent = '';
      winnerCountEl.textContent = '';
    }
  } catch (err) {
    console.error('Failed to load results', err);
    winnerTextEl.textContent = 'Unable to load results.';
  }
}

fetchResults();
