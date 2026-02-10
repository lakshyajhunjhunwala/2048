// 2048-style Game (Mobile Optimized)
const gameBoard = document.getElementById('gameBoard');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const undoBtn = document.getElementById('undoBtn');
const mobileButtons = document.querySelectorAll('.mobile-controls [data-dir]');

const GRID_SIZE = 4;
let grid = [];
let maxScore = 0;
let previousGrid = [];
let previousMaxScore = 0;

// Tile color scheme
const colorMap = {
  2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
  32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
  512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
  4096: '#3c3c2f', 8192: '#3c3c2f', 16384: '#3c3c2f'
};

function init() {
  grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  maxScore = 0;
  addNewTile();
  addNewTile();
  render();
}

function addNewTile() {
  const empty = [];
  for (let i = 0; i < GRID_SIZE; i++)
    for (let j = 0; j < GRID_SIZE; j++)
      if (grid[i][j] === 0) empty.push({ i, j });

  if (!empty.length) return;
  const { i, j } = empty[Math.floor(Math.random() * empty.length)];
  grid[i][j] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  gameBoard.innerHTML = '';
  const boardSize = Math.min(window.innerWidth, window.innerHeight) - 40;
  gameBoard.style.width = `${boardSize}px`;
  gameBoard.style.height = `${boardSize}px`;
  const tileSize = boardSize / GRID_SIZE - 10;

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const value = grid[i][j];
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;
      tile.style.lineHeight = `${tileSize}px`;
      tile.style.fontSize = `${tileSize / 2.5}px`;

      if (value !== 0) {
        tile.textContent = value;
        tile.style.backgroundColor = colorMap[value] || '#3c3c2f';
        tile.style.color = value <= 4 ? '#776e65' : '#f9f6f2';
        tile.style.boxShadow = `0 4px 8px rgba(0,0,0,0.3)`;
      } else {
        tile.style.backgroundColor = 'rgba(255,255,255,0.08)';
      }
      gameBoard.appendChild(tile);
    }
  }
  scoreEl.textContent = `Highest: ${maxScore}`;
}

function canMove() {
  for (let i = 0; i < GRID_SIZE; i++)
    for (let j = 0; j < GRID_SIZE; j++)
      if (grid[i][j] === 0) return true;

  for (let i = 0; i < GRID_SIZE; i++)
    for (let j = 0; j < GRID_SIZE; j++)
      if ((j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) ||
          (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j])) return true;

  return false;
}

function move(direction) {
  previousGrid = grid.map(row => [...row]);
  previousMaxScore = maxScore;
  let moved = false;

  const mergeColumn = (col) => mergeLine(col);
  const mergeRow = (row) => mergeLine(row);

  const handleVertical = (reverse = false) => {
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = [];
      for (let i = 0; i < GRID_SIZE; i++)
        col.push(grid[reverse ? GRID_SIZE - 1 - i : i][j]);
      const merged = mergeColumn(col);
      for (let i = 0; i < GRID_SIZE; i++)
        grid[reverse ? GRID_SIZE - 1 - i : i][j] = merged[i] || 0;
      if (col.join() !== merged.join()) moved = true;
    }
  };

  const handleHorizontal = (reverse = false) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < GRID_SIZE; j++)
        row.push(grid[i][reverse ? GRID_SIZE - 1 - j : j]);
      const merged = mergeRow(row);
      for (let j = 0; j < GRID_SIZE; j++)
        grid[i][reverse ? GRID_SIZE - 1 - j : j] = merged[j] || 0;
      if (row.join() !== merged.join()) moved = true;
    }
  };

  switch (direction) {
    case 'up': handleVertical(false); break;
    case 'down': handleVertical(true); break;
    case 'left': handleHorizontal(false); break;
    case 'right': handleHorizontal(true); break;
  }

  if (moved) {
    addNewTile();
    render();
    if (!canMove()) showGameOver();
  }
}

function mergeLine(line) {
  const result = line.filter(v => v !== 0);
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i] === result[i + 1]) {
      result[i] *= 2;
      if (result[i] > maxScore) maxScore = result[i];
      result.splice(i + 1, 1);
    }
  }
  while (result.length < GRID_SIZE) result.push(0);
  return result;
}

// Game Over overlay instead of alert
function showGameOver() {
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.innerHTML = `<p>Game Over!</p><p>Final Score: ${maxScore}</p><button id="restartOverlay">Restart</button>`;
  document.body.appendChild(overlay);
  document.getElementById('restartOverlay').addEventListener('click', () => {
    document.body.removeChild(overlay);
    init();
  });
}

// Controls
window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp': e.preventDefault(); move('up'); break;
    case 'ArrowDown': e.preventDefault(); move('down'); break;
    case 'ArrowLeft': e.preventDefault(); move('left'); break;
    case 'ArrowRight': e.preventDefault(); move('right'); break;
  }
});

mobileButtons.forEach(b => {
  b.addEventListener('click', () => move(b.dataset.dir));
});

// Touch/swipe support
let touchStartX = 0, touchStartY = 0;
gameBoard.addEventListener('touchstart', e => {
  const touch = e.changedTouches[0];
  touchStartX = touch.screenX;
  touchStartY = touch.screenY;
});
gameBoard.addEventListener('touchend', e => {
  const touch = e.changedTouches[0];
  const dx = touch.screenX - touchStartX;
  const dy = touch.screenY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move('right');
    else if (dx < -30) move('left');
  } else {
    if (dy > 30) move('down');
    else if (dy < -30) move('up');
  }
});

undoBtn.addEventListener('click', () => {
  if (previousGrid.length) {
    grid = previousGrid.map(row => [...row]);
    maxScore = previousMaxScore;
    render();
  }
});

restartBtn.addEventListener('click', init);

// Initialize game
init();
