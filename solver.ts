// const input = require('fs').readFileSync('/dev/stdin').toString().trim();
console.time();

const input = `3 4
3...
....
.4..
5 5
2.5..
.....
.....
.....
..4.3
0 0`;
function solution(input: string): string {
  class Num {
    static id = 1;
    id: number;
    n: number;
    constructor(n = 0, id = Num.id++) {
      this.n = n;
      this.id = id;
    }
  }

  class Queue<T = number> {
    q: T[];
    f: number;
    r: number;
    constructor(q = []) {
      this.q = q;
      this.f = 0;
      this.r = this.q.length;
    }

    push(n: T) {
      this.q[this.r++] = n;
    }

    pop() {
      const poped = this.q[this.f++];
      if (this.f > 10000) {
        this.q = this.q.slice(this.f);
        this.r -= this.f;
        this.f = 0;
      }
      return poped;
    }

    size() {
      return this.r - this.f;
    }
  }

  class Visited {
    visited: Map<number, Map<number, number>>;
    constructor(y?: number, x?: number) {
      if (y !== undefined && x !== undefined)
        this.visited = new Map([[y, new Map([[x, 1]])]]);
      else this.visited = new Map();
    }

    push(y: number, x: number) {
      if (this.visited.has(y)) this.visited.get(y)?.set(x, 1);
      else this.visited.set(y, new Map([[x, 1]]));
    }

    has(y: number, x: number) {
      if (this.visited.get(y)?.has(x)) return true;
      else return false;
    }

    area() {
      return [...this.visited.values()].reduce((a, c) => a + c.size, 0);
    }
  }

  const moves = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
  ];

  type gridsType = Num[][][][];
  type gridType = Num[][][];
  type iniGridsType = [[number, number], Num][][];
  type iniGridType = [[number, number], Num][];

  const grids: gridsType = input
    .split(/\d+ \d+/g)
    .slice(1, -1)
    .map((grid) =>
      grid
        .trim()
        .split("\n")
        .map((v) =>
          v
            .match(/\d+|\./g)!
            ?.map((x) => (x === "." ? [new Num(0, 0)] : [new Num(Number(x))]))
        )
    );

  const iniGrids: iniGridsType = [];
  for (let i = 0; i < grids.length; i++) {
    iniGrids.push([]);
    for (let y = 0; y < grids[i].length; y++)
      for (let x = 0; x < grids[i][y].length; x++)
        if (grids[i][y][x][0].id !== 0)
          iniGrids[i].push([[y, x], grids[i][y][x][0]]);
  }

  (function initialize(grids: gridsType, iniGrids: iniGridsType) {
    grids.forEach((grid, i) => {
      const iniGrid = iniGrids[i];
      for (const [[y, x], target] of iniGrid) {
        const q = new Queue<[number, number, number]>();
        const visited = new Visited();
        q.push([y, x, target.n]);
        visited.push(y, x);
        while (q.size()) {
          const [y, x, d] = q.pop();
          if (d === 1) continue;
          moves.forEach((m) => {
            const [my, mx, md] = [y + m[0], x + m[1], d - 1];
            if (
              grid[my]?.[mx] &&
              !visited.has(my, mx) &&
              grid[my][mx].some((xx) => xx.id === 0)
            ) {
              q.push([my, mx, md]);
              grid[my][mx].push(target);
              visited.push(my, mx);
            }
          });
        }
      }
    });
  })(grids, iniGrids);

  function solve(grid: gridType, iniGrid: iniGridType): string {
    /**
     * grid[i][j]칸이 확정된 칸이면 그 칸의 id를 반환하는 함수.
     * @param i 칸의 y좌표
     * @param j 칸의 x좌표
     * @param grid
     * @returns id 혹은 false
     */
    const getId = (i: number, j: number, grid: gridType) =>
      grid[i]?.[j] && grid[i][j].length === 1 ? grid[i][j][0].id : false;

    /**
     * 숫자와 숫자 사이를 바다로 확정해주는 함수
     * @param grid
     * @returns 변한 숫자가 있으면 true
     */
    function sol1(grid: gridType): boolean {
      /**
       * 숫자 2개이상과 근접한 빈칸인지 확인하는 함수
       * @param i 빈칸의 y좌표
       * @param j 빈칸의 x좌표
       * @param grid
       * @returns 2개 이상과 근접했다면 true
       */
      const isBetween = (i: number, j: number, grid: gridType) => {
        if (grid[i][j].length > 1) {
          const s = new Set();
          moves.forEach((m) => {
            const [mi, mj] = [i + m[0], j + m[1]];
            if (
              grid[mi]?.[mj] &&
              grid[mi][mj].length === 1 &&
              grid[mi][mj][0].id !== 0
            )
              s.add(grid[mi][mj][0].id);
          });
          if (s.size > 1) return true;
          else return false;
        } else return false;
      };

      let bool = false;
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          if (isBetween(i, j, grid)) {
            grid[i][j] = [new Num(0, 0)];
            bool = true;
          }
        }
      }
      return bool;
    }

    /**
     * 바다 1칸이 확장할 수 있는 방향이 하나뿐이면 그 방향으로 확장
     * @param grid
     * @returns 변한 숫자가 있으면 true
     */
    function sol2(grid: gridType): boolean {
      let bool = false;
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          if (getId(i, j, grid) === 0) {
            const v = moves.filter((m) =>
              grid[i + m[0]]?.[j + m[1]]?.some((xx) => xx.id === 0)
            );
            if (v.length === 1 && getId(i + v[0][0], j + v[0][1], grid) !== 0) {
              bool = true;
              grid[i + v[0][0]][j + v[0][1]] = [new Num(0, 0)];
            }
          }
        }
      }
      return bool;
    }

    function cycle(grid: gridType, iniGrid: iniGridType): boolean {}
    function pByC(grid: gridType, iniGrid: iniGridType): void {}
    const solved = (grid: gridType): boolean =>
      grid.every((a) => a.every((b) => b.length === 1));
    while (!solved(grid)) {
      if (!cycle(grid, iniGrid)) pByC(grid, iniGrid);
    }
    const numList: string[][] = grid.map((v) =>
      v.map((x) => (x[0].id == 0 ? "#" : "."))
    );
    for (const [[y, x], target] of iniGrid) numList[y][x] = target.n.toString();
    return numList.map((v) => v.join("")).join("\n");
    //sol8: 최대거리, 사각형, 가능성 제거
  }

  const returnString = Array.from({ length: grids.length }, (_, i) =>
    solve(grids[i], iniGrids[i])
  ).join("\n\n");
  return returnString;
}
solution(input);

console.timeEnd();
