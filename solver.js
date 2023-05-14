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
function solution(input) {
    class Num {
        static id = 1;
        id;
        n;
        constructor(n = 0, id = Num.id++) {
            this.n = n;
            this.id = id;
        }
    }
    class Queue {
        q;
        f;
        r;
        constructor(q = []) {
            this.q = q;
            this.f = 0;
            this.r = this.q.length;
        }
        push(n) {
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
        visited;
        constructor(y, x) {
            if (y !== undefined && x !== undefined)
                this.visited = new Map([[y, new Map([[x, 1]])]]);
            else
                this.visited = new Map();
        }
        push(y, x) {
            if (this.visited.has(y))
                this.visited.get(y)?.set(x, 1);
            else
                this.visited.set(y, new Map([[x, 1]]));
        }
        has(y, x) {
            if (this.visited.get(y)?.has(x))
                return true;
            else
                return false;
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
    const grids = input
        .split(/\d+ \d+/g)
        .slice(1, -1)
        .map((grid) => grid
        .trim()
        .split("\n")
        .map((v) => v
        .match(/\d+|\./g)
        ?.map((x) => (x === "." ? [new Num(0, 0)] : [new Num(Number(x))]))));
    const iniGrids = [];
    for (let i = 0; i < grids.length; i++) {
        iniGrids.push([]);
        for (let y = 0; y < grids[i].length; y++)
            for (let x = 0; x < grids[i][y].length; x++)
                if (grids[i][y][x][0].id !== 0)
                    iniGrids[i].push([[y, x], grids[i][y][x][0]]);
    }
    const idToPos = new Map();
    iniGrids.forEach((x) => x.forEach((y) => idToPos.set(y[1].id, y[0])));
    (function initialize(grids, iniGrids) {
        grids.forEach((grid, i) => {
            const iniGrid = iniGrids[i];
            for (const [[y, x], target] of iniGrid) {
                const q = new Queue();
                const visited = new Visited();
                q.push([y, x, target.n]);
                visited.push(y, x);
                while (q.size()) {
                    const [y, x, d] = q.pop();
                    if (d === 1)
                        continue;
                    moves.forEach((m) => {
                        const [my, mx, md] = [y + m[0], x + m[1], d - 1];
                        if (grid[my]?.[mx] &&
                            !visited.has(my, mx) &&
                            grid[my][mx].some((xx) => xx.id === 0)) {
                            q.push([my, mx, md]);
                            grid[my][mx].push(target);
                            visited.push(my, mx);
                        }
                    });
                }
            }
        });
    })(grids, iniGrids);
    function solve(grid, iniGrid, idToPos) {
        /**
         * grid[i][j]칸이 확정된 칸이면 그 칸의 id를 반환하는 함수.
         * @param i 칸의 y좌표
         * @param j 칸의 x좌표
         * @param grid
         * @returns id 혹은 false
         */
        const getId = (i, j, grid) => grid[i]?.[j] && grid[i][j].length === 1 ? grid[i][j][0].id : false;
        /**
         * grid[i][j]칸이 확정된 칸이면 그 칸의 N을 반환하는 함수.
         * @param i 칸의 y좌표
         * @param j 칸의 x좌표
         * @param grid
         * @returns id 혹은 false
         */
        const getN = (i, j, grid) => grid[i]?.[j] && grid[i][j].length === 1 ? grid[i][j][0].n : false;
        /**
         * 확정된 칸의 넓이를 반환하는 함수. 확정된 칸이 아니라면 false
         * @param i 칸의 y좌표
         * @param j 칸의 x좌표
         * @param grid
         * @returns number 또는 false
         */
        const getArea = (i, j, grid) => {
            const targetId = getId(i, j, grid);
            if (targetId === false)
                return false;
            const q = new Queue([[i, j]]);
            const visited = new Visited(i, j);
            while (q.size()) {
                const [y, x] = q.pop();
                moves.forEach((m) => {
                    const [my, mx] = [y + m[0], x + m[1]];
                    if (getId(my, mx, grid) === targetId && !visited.has(my, mx)) {
                        q.push([my, mx]);
                        visited.push(my, mx);
                    }
                });
            }
            return visited.area();
        };
        /**
         * 확정된 숫자칸에서 다른 칸으로 가는 최단거리를 반환하는 함수. 최소 1을 반환한다.
         * @param i 확정된 칸의 y좌표
         * @param j 확정된 칸의 x좌표
         * @param k 목적지의 y좌표
         * @param l 목적지의 x좌표
         * @param grid
         * @returns 거리 이내로 도달할 수 없거나, 조건에 맞는 입력이 아니면 false
         */
        const getDistance = (i, j, k, l, grid) => {
            const targetId = getId(i, j, grid);
            const targetN = getN(i, j, grid);
            if (targetId === false || targetN === false)
                return false;
            const q = new Queue([[i, j, 1]]);
            const visited = new Visited(i, j);
            while (q.size()) {
                const [y, x, d] = q.pop();
                if (y === k && x === l)
                    return d;
                if (d === targetN)
                    continue;
                moves.forEach((m) => {
                    const [my, mx, md] = [y + m[0], x + m[1], d + 1];
                    if (grid[my]?.[mx] &&
                        grid[my][mx].some((xx) => xx.id === targetId) &&
                        !visited.has(my, mx)) {
                        q.push([my, mx, md]);
                        visited.push(my, mx);
                    }
                });
            }
            return false;
        };
        /**
         * 숫자와 숫자 사이를 바다로 확정해주는 함수
         * @param grid
         * @returns 변한 숫자가 있으면 true
         */
        function sol1(grid) {
            /**
             * 숫자 2개이상과 근접한 빈칸인지 확인하는 함수
             * @param i 빈칸의 y좌표
             * @param j 빈칸의 x좌표
             * @param grid
             * @returns 2개 이상과 근접했다면 true
             */
            const isBetween = (i, j, grid) => {
                if (grid[i][j].length > 1) {
                    const s = new Set();
                    moves.forEach((m) => {
                        const [mi, mj] = [i + m[0], j + m[1]];
                        if (grid[mi]?.[mj] &&
                            grid[mi][mj].length === 1 &&
                            grid[mi][mj][0].id !== 0)
                            s.add(grid[mi][mj][0].id);
                    });
                    if (s.size > 1)
                        return true;
                    else
                        return false;
                }
                else
                    return false;
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
        function sol2(grid) {
            let bool = false;
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[i].length; j++) {
                    if (getId(i, j, grid) === 0) {
                        const v = moves.filter((m) => grid[i + m[0]]?.[j + m[1]]?.some((xx) => xx.id === 0));
                        if (v.length === 1 && getId(i + v[0][0], j + v[0][1], grid) !== 0) {
                            bool = true;
                            grid[i + v[0][0]][j + v[0][1]] = [new Num(0, 0)];
                        }
                    }
                }
            }
            return bool;
        }
        /**
         * 입력받은 칸이 완성되었으면 주변을 둘러주는 함수
         * @param i 칸의 y좌표
         * @param j 칸의 x좌표
         */
        function sol3(i, j, grid, iniGrid) {
            const targetId = getId(i, j, grid);
            const targetN = getN(i, j, grid);
            if (targetId === false || targetN === false)
                return false;
            const a = getArea(i, j, grid);
            // 오류 검출용 코드
            if (typeof a === "number" && a > targetN)
                throw new Error("sol3");
            if (a !== targetN)
                return false;
            const q = new Queue([[i, j]]);
            const visited = new Visited(i, j);
            while (q.size()) {
                const [y, x] = q.pop();
                moves.forEach((m) => {
                    const [my, mx] = [y + m[0], x + m[1]];
                    if (grid[my]?.[mx]) {
                        if (getId(my, mx, grid) === targetId && !visited.has(my, mx)) {
                            q.push([my, mx]);
                            visited.push(my, mx);
                        }
                        else {
                            grid[my][mx] = [new Num(0, 0)];
                        }
                    }
                });
            }
            return true;
        }
        /**
         * 거리가 안 닿는 숫자들의 가능성을 제거하는 함수
         * @param grid
         * @param iniGrid
         */
        function sol4(grid, iniGrid, idToPos) {
            let bool = false;
            for (let k = 0; k < grid.length; k++) {
                for (let l = 0; l < grid[k].length; l++) {
                    if (grid[k][l].length === 1)
                        continue;
                    for (const target of grid[k][l]) {
                        if (target.id === 0)
                            continue;
                        if (!idToPos.has(target.id))
                            throw new Error("sol4");
                        const [i, j] = idToPos.get(target.id);
                        const d = getDistance(i, j, k, l, grid);
                        if (!d || d > target.n) {
                            bool = true;
                            grid[k][l] = grid[k][l].filter((xx) => xx.id !== target.id);
                        }
                    }
                }
            }
            return bool;
        }
        /**
         * L자형 바다의 안쪽을 숫자로 확정시켜주는 함수
         * @param grid
         */
        function sol5(grid) {
            let bool = false;
            const L = [
                [
                    [0, 1],
                    [1, 1],
                    [1, 1],
                ],
                [
                    [0, -1],
                    [1, -1],
                    [1, 0],
                ],
                [
                    [-1, 0],
                    [-1, 1],
                    [0, 1],
                ],
                [
                    [0, -1],
                    [-1, -1],
                    [-1, 0],
                ], // 우하단
            ];
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[0].length; j++) {
                    if (grid[i][j].length === 1 || grid[i][j].every((xx) => xx.id !== 0))
                        continue;
                    for (const l of L) {
                        if (l.every((v) => {
                            const [vi, vj] = [i + v[0], j + v[1]];
                            if (getId(vi, vj, grid) === 0)
                                return true;
                            else
                                return false;
                        })) {
                            bool = true;
                            grid[i][j] = grid[i][j].filter((xx) => xx.id !== 0);
                            break;
                        }
                    }
                }
            }
            return bool;
        }
        function cycle(grid, iniGrid) { }
        function pByC(grid, iniGrid) { }
        const solved = (grid) => grid.every((a) => a.every((b) => b.length === 1));
        while (!solved(grid)) {
            if (!cycle(grid, iniGrid))
                pByC(grid, iniGrid);
        }
        const numList = grid.map((v) => v.map((x) => (x[0].id == 0 ? "#" : ".")));
        for (const [[y, x], target] of iniGrid)
            numList[y][x] = target.n.toString();
        return numList.map((v) => v.join("")).join("\n");
        //sol8: 최대거리, 사각형, 가능성 제거
    }
    const returnString = Array.from({ length: grids.length }, (_, i) => solve(grids[i], iniGrids[i], idToPos)).join("\n\n");
    return returnString;
}
solution(input);
console.timeEnd();
