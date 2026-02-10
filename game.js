// 2048-style Game
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
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
  4096: '#3c3c2f',
  8192: '#3c3c2f',
  16384: '#3c3c2f',
};

function init() {
  grid = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    grid[i] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      grid[i][j] = 0;
    }
  }
  maxScore = 0;
  addNewTile();
  addNewTile();
  render();
}

function addNewTile() {
  const empty = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 0) empty.push({i, j});
    }
  }
  if (empty.length === 0) return;
  const {i, j} = empty[Math.floor(Math.random() * empty.length)];
  grid[i][j] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  gameBoard.innerHTML = '';
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const value = grid[i][j];
      const tile = document.createElement('div');
      tile.className = 'tile';
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
  // Check if any empty cells exist
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 0) return true;
    }
  }
  // Check for possible merges
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const val = grid[i][j];
      if ((j < GRID_SIZE - 1 && val === grid[i][j + 1]) ||
          (i < GRID_SIZE - 1 && val === grid[i + 1][j])) {
        return true;
      }
    }
  }
  return false;
}

function move(direction) {
  // Save current state before moving
  previousGrid = grid.map(row => [...row]);
  previousMaxScore = maxScore;
  
  let moved = false;
  
  if (direction === 'up' || direction === 'down') {
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = [];
      for (let i = 0; i < GRID_SIZE; i++) {
        if (grid[i][j] !== 0) col.push(grid[i][j]);
      }
      const merged = mergeLine(col);
      if (col.length !== merged.length || merged.some((v, i) => v !== col[i])) moved = true;
      
      for (let i = 0; i < GRID_SIZE; i++) {
        grid[i][j] = merged[i] || 0;
      }
    }
    if (direction === 'up') {
      // Already correct
    } else {
      // Reverse for down
      for (let j = 0; j < GRID_SIZE; j++) {
        const col = [];
        for (let i = GRID_SIZE - 1; i >= 0; i--) col.push(grid[i][j]);
        const merged = mergeLine(col);
        for (let i = 0; i < GRID_SIZE; i++) {
          grid[GRID_SIZE - 1 - i][j] = merged[i] || 0;
        }
      }
    }
  } else {
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] !== 0) row.push(grid[i][j]);
      }
      const merged = mergeLine(row);
      if (row.length !== merged.length || merged.some((v, i) => v !== row[i])) moved = true;
      
      for (let j = 0; j < GRID_SIZE; j++) {
        grid[i][j] = merged[j] || 0;
      }
    }
    if (direction === 'left') {
      // Already correct
    } else {
      // Reverse for right
      for (let i = 0; i < GRID_SIZE; i++) {
        const row = [];
        for (let j = GRID_SIZE - 1; j >= 0; j--) row.push(grid[i][j]);
        const merged = mergeLine(row);
        for (let j = 0; j < GRID_SIZE; j++) {
          grid[i][GRID_SIZE - 1 - j] = merged[j] || 0;
        }
      }
    }
  }
  
  if (moved) {
    addNewTile();
    render();
    if (!canMove()) {
      setTimeout(() => alert(`Game Over! Final Score: ${maxScore}`), 100);
    }
  }
}

function mergeLine(line) {
  // Remove zeros
  let result = line.filter(v => v !== 0);
  // Merge adjacent equal values
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i] === result[i + 1]) {
      result[i] *= 2;
      if (result[i] > maxScore) maxScore = result[i];
      result.splice(i + 1, 1);
    }
  }
  // Pad with zeros
  while (result.length < GRID_SIZE) result.push(0);
  return result;
}

// Controls
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') { e.preventDefault(); move('up'); }
  if (e.key === 'ArrowDown') { e.preventDefault(); move('down'); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); move('left'); }
  if (e.key === 'ArrowRight') { e.preventDefault(); move('right'); }
});

mobileButtons.forEach(b => {
  b.addEventListener('click', () => {
    const dir = b.dataset.dir;
    if (dir === 'up') move('up');
    if (dir === 'down') move('down');
    if (dir === 'left') move('left');
    if (dir === 'right') move('right');
  });
});

undoBtn.addEventListener('click', () => {
  if (previousGrid.length > 0) {
    grid = previousGrid.map(row => [...row]);
    maxScore = previousMaxScore;
    render();
  }
});

restartBtn.addEventListener('click', () => init());

// Init game
init();

