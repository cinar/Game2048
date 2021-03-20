'use strict';

const CELL_START = 2;
const CELL_EMPTY = '';
const CONTAINER_ID = 'game';
const DEFAULT_SIZE = 4;

/**
 * Clear element.
 *
 * @param {HTMLElement} element object.
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Cell value.
 *
 * @param {HTMLTableDataCellElement} cell cell element.
 * @param {number|string} value cell value.
 */
function cellValue(cell, value) {
  cell.innerHTML = value;

  if (value === CELL_EMPTY) {
    cell.className = 'empty';
  } else if (value < 1024) {
    cell.className = 'value' + value;
  } else {
    cell.className = 'value1024';
  }
}

/**
 * Inits the game table.
 *
 * @param {HTMLDivElement} game game div.
 * @param {number} size table size.
 * @return {HTMLTableDataCellElement[]} cell elements.
 */
function initTable(game, size) {
  const cells = [];

  clearElement(game);

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  for (let i = 0; i < size; i++) {
    const tr = document.createElement('tr');

    for (let j = 0; j < size; j++) {
      const td = document.createElement('td');
      cellValue(td, CELL_EMPTY);
      tr.appendChild(td);
      cells.push(td);
    }

    tbody.appendChild(tr);
  }

  game.appendChild(table);

  return cells;
}

/**
 * Step by adding the next value.
 *
 * @param {HTMLTableDataCellElement[]} cells cell elements.
 */
function step(cells) {
  const empty = cells.filter((cell) => cell.innerHTML === CELL_EMPTY);
  if (empty.length > 0) {
    const index = Math.floor(Math.random() * empty.length);
    cellValue(empty[index], CELL_START);
  } else {
    console.log('Game over');
  }
}

/**
 * Merge cells.
 *
 * @param {HTMLTableDataCellElement[]} cells cell elements.
 * @param {number} size table size.
 * @param {number} topIterate top iterate.
 * @param {number} bottomIterate bottom iterate.
 * @param {boolean} backward backward flow.
 */
function merge(cells, size, topIterate, bottomIterate, backward) {
  for (let i = 0; i < size; i++) {
    const begin = i * topIterate;
    let values = [];

    for (let j = 0; j < size; j++) {
      values.push(cells[begin + (j * bottomIterate)]);
    }

    values = values.map((cell) => cell.innerHTML);

    if (backward) {
      values = values.reverse();
    }

    values = values.reduce((filled, value) => {
      if (value !== CELL_EMPTY) {
        if ((filled.length > 0) && (value === filled[filled.length - 1])) {
          filled[filled.length - 1] *= 2;
        } else {
          filled.push(value);
        }
      }

      return filled;
    }, []);

    const pad = size - values.length;
    if (pad > 0) {
      values = Array(pad).fill(CELL_EMPTY).concat(values);
    }

    if (backward) {
      values = values.reverse();
    }

    for (let j = 0; j < size; j++) {
      cellValue(cells[begin + (j * bottomIterate)], values[j]);
    }
  }
}

/**
 * Game 2048.
 *
 * @author Onur Cinar
 */
class Game2048 {
  /**
   * Constructor.
   *
   * @param {number} size table size default 4.
   */
  constructor(size = DEFAULT_SIZE) {
    this.game = document.getElementById(CONTAINER_ID);
    this.reset(size);
  }

  /**
   * Reset game with size.
   *
   * @param {number} size table size default 4.
   */
  reset(size = DEFAULT_SIZE) {
    this.size = size;
    this.cells = initTable(this.game, size);
    step(this.cells);
  }

  /**
   * Up combine.
   */
  up() {
    merge(this.cells, this.size, 1, this.size, true);
    step(this.cells);
  }

  /**
   * Down combine.
   */
  down() {
    merge(this.cells, this.size, 1, this.size, false);
    step(this.cells);
  }

  /**
   * Left combine.
   */
  left() {
    merge(this.cells, this.size, this.size, 1, true);
    step(this.cells);
  }

  /**
   * Right combine.
   */
  right() {
    merge(this.cells, this.size, this.size, 1, false);
    step(this.cells);
  }
}

window.addEventListener('load', () => {
  const game2048 = new Game2048();
  let touchX = 0;
  let touchY = 0;

  document.getElementById('button4').addEventListener('click', () => {
    game2048.reset(4);
  });

  document.getElementById('button5').addEventListener('click', () => {
    game2048.reset(5);
  });

  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        game2048.up();
        break;

      case 'ArrowDown':
        game2048.down();
        break;

      case 'ArrowLeft':
        game2048.left();
        break;

      case 'ArrowRight':
        game2048.right();
        break;
    }
  });

  document.addEventListener('touchstart', (event) => {
    touchX = event.changedTouches[0].clientX;
    touchY = event.changedTouches[0].clientY;
  });

  document.addEventListener('touchend', (event) => {
    const deltaX = event.changedTouches[0].clientX - touchX;
    const deltaY = event.changedTouches[0].clientY - touchY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        game2048.left();
      } else {
        game2048.right();
      }
    } else {
      if (deltaY < 0) {
        game2048.up();
      } else {
        game2048.down();
      }
    }
  });
});
