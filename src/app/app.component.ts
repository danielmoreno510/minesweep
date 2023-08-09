import { Component, OnInit } from '@angular/core';
import { CellComponent as Cell } from './shared/components/cell/cell.component';
import { randNumber } from './shared/utils/randomUtils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  lost = false;
  rows: number = 10;
  cols: number = 10;
  mines: number = 1;
  minesLeft: number = 0;
  opened: number = 0;
  cells: Cell[][] = [];
  movePositions = [
    { row: -1, col: -1 },
    { row: -1, col: 0 },
    { row: -1, col: 1 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: 1, col: -1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
  ];
  games: number = 0

  ngOnInit() {
    this.games = Number(localStorage.getItem('games')) || 0
    this.setGame(this.rows, this.cols, this.mines);
  }

  restartGame(rows?: number, cols?: number, mines?: number) {
    this.cells = [];
    this.lost = false;
    this.opened = 0;
    this.setGame(rows || this.rows, cols || this.cols, mines || this.mines);
    this.setGames()
  }

  setGame(rows: number, cols: number, mines: number) {
    this.rows = rows;
    this.cols = cols;

    for (let row = 0; row < rows; row++) {
      this.cells.push([]);
      for (let col = 0; col < cols; col++) {
        this.cells[row].push(new Cell(row, col));
      }
    }

    for (let i = 0; i < mines; i++) {
      let row = randNumber(rows - 1),
        col = randNumber(cols - 1);
      let randCell = this.cells[row][col];
      while (randCell.hasMine) {
        (row = randNumber(rows - 1)), (col = randNumber(cols - 1));
        randCell = this.cells[row][col];
      }
      randCell.setMine(true);
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.cells[row][col].setCount(this.countMines(row, col));
      }
    }
    (this.minesLeft = mines), (this.mines = mines);
  }

  setGames() {
    this.games = this.games + 1
    localStorage.setItem('games', String(this.games))
  }

  checkWin() {
    let allOpened = this.opened === this.rows * this.cols - this.mines;
    let allFlags = this.minesLeft === 0;
    return allOpened && allFlags;
  }

  countMines(row: number, col: number): number {
    return (
      this.hasMineCount(row - 1, col - 1) +
      this.hasMineCount(row - 1, col) +
      this.hasMineCount(row - 1, col + 1) +
      this.hasMineCount(row, col + 1) +
      this.hasMineCount(row, col - 1) +
      this.hasMineCount(row + 1, col - 1) +
      this.hasMineCount(row + 1, col) +
      this.hasMineCount(row + 1, col + 1)
    );
  }

  hasMineCount(row: number, col: number): number {
    let validPos = row >= 0 && col >= 0 && row < this.rows && col < this.cols;
    return validPos ? (this.cells[row][col].hasMine ? 1 : 0) : 0;
  }

  openMine(cell: Cell): boolean {
    if (this.lost || this.checkWin()) return false;
    if (cell.isOpened || cell.hasFlag) return true;
    cell.isOpened = true;
    this.opened += 1;
    if (cell.hasMine) {
      this.lost = true;
      return false;
    } else if (cell.minecount === 0) {
      let neighbours = this.getNotMineNeighbours(cell);
      for (let neighbour of neighbours) {
        this.openMine(neighbour);
      }
    }
    return true;
  }

  setFlag(cell: Cell) {
    if (this.lost || this.checkWin()) return false;
    if (cell.isOpened) return false;
    if (this.minesLeft === 0 && !cell.hasFlag) return false;
    cell.hasFlag = !cell.hasFlag;
    this.minesLeft += cell.hasFlag ? -1 : 1;
    return false;
  }

  getNotMineNeighbours(cell: Cell): Cell[] {
    let row = cell.row;
    let col = cell.col;
    let arr: number | Cell[] = [];
    for (let pos of this.movePositions) {
      let validPos =
        row + pos.row >= 0 &&
        col + pos.col >= 0 &&
        row + pos.row < this.rows &&
        col + pos.col < this.cols;
      if (!validPos) continue;
      let neighbour = this.cells[row + pos.row][col + pos.col];
      if (!neighbour.hasMine) {
        arr = [...arr, neighbour];
      }
    }
    return arr;
  }
}
