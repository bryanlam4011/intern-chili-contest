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
const winnerTextEl = document.getElementById('winner-text');

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
    });

    if (winner) {
      winnerTextEl.textContent = 'Current winner:';
      winnerNameEl.textContent = winner.name;
      
      // Trigger confetti cannons from bottom left and right corners
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0, y: 1 }
      });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 1, y: 1 }
      });
      // Trigger confetti cannon from center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 1 }
      });
    } else {
      winnerTextEl.textContent = 'No votes yet.';
      winnerNameEl.textContent = '';
    }
  } catch (err) {
    console.error('Failed to load results', err);
    winnerTextEl.textContent = 'Unable to load results.';
  }
}

fetchResults().then(r => {
  console.log(r); // Using the variable fixes the warning
});
