// const input = require('fs').readFileSync('/dev/stdin').toString().trim();
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
15 15
.....1...2.1.1.
...............
..3....2..2...3
.....4..1......
............3..
.....1....1....
...........1...
..5.2.1.5.2.2..
...4...........
...............
..10....2....3..
......8..4.....
1......1....4..
..........6....
.2.1.2.........
24 14
2....1.......1......2...
........2...3....1......
.....1.......1..3......6
.1......5...............
......4......1........3.
...............7.7.3....
.....2..................
..9.....................
.7.1...4.....2....1.....
..........5.........1...
...4.4.............2....
....8.................7.
......1......5....11....5
........6.2.....5.......
2 4
.2
..
..
4.
0 0`;
function solution(input) {
    class Num {
        static id = 1;
        id;
        n;
        approach;
        constructor(n = 0, id = Num.id++) {
            this.n = n;
            this.id = id;
            this.approach = 0;
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
        entries() {
            return [...this.visited.keys()].flatMap((y) => [...this.visited.get(y).keys()].map((x) => [y, x]));
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
                            grid[my][mx].push(new Num(target.n, target.id));
                            visited.push(my, mx);
                        }
                    });
                }
            }
        });
    })(grids, iniGrids);
    function solve(grid, iniGrid) {
        /**
         * grid[i][j]칸이 확정된 칸이면 그 칸의 id를 반환하는 함수.
         * @returns id 혹은 false
         */
        const getId = (i, j, grid) => grid[i]?.[j] && grid[i][j].length === 1 ? grid[i][j][0].id : false;
        /**
         * grid[i][j]칸이 확정된 칸이면 그 칸의 N을 반환하는 함수.
         * @returns id 혹은 false
         */
        const getN = (i, j, grid) => grid[i]?.[j] && grid[i][j].length === 1 ? grid[i][j][0].n : false;
        /**
         * 확정된 칸의 넓이를 반환하는 함수
         * @returns number. 확정된 칸이 아니라면 false
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
         * 전체가 아닌 바다가 확장할 수 있는 방향이 하나뿐이면 그 방향으로 확장
         */
        function sol2(grid) {
            let bool = false;
            const sol2Grid = grid.map((a) => a.map(() => 0));
            let count = grid.reduce((a, c, i, grid) => a + c.reduce((a, _, j) => a + (getId(i, j, grid) === 0 ? 1 : 0), 0), 0);
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[0].length; j++) {
                    const targetId = getId(i, j, grid);
                    if (targetId !== 0 || sol2Grid[i][j] === 1)
                        continue;
                    if (getArea(i, j, grid) === count)
                        continue;
                    const q = new Queue([[i, j]]);
                    const visited = new Visited(i, j);
                    const around = new Visited();
                    while (q.size()) {
                        const [y, x] = q.pop();
                        sol2Grid[y][x] = 1;
                        moves.forEach((m) => {
                            const [my, mx] = [y + m[0], x + m[1]];
                            if (grid[my]?.[mx] &&
                                !visited.has(my, mx) &&
                                getId(my, mx, grid) === 0) {
                                q.push([my, mx]);
                                visited.push(my, mx);
                            }
                            else if (grid[my]?.[mx] &&
                                !visited.has(my, mx) &&
                                !around.has(my, mx) &&
                                grid[my][mx].some((xx) => xx.id === 0)) {
                                around.push(my, mx);
                            }
                        });
                    }
                    if (around.area() === 1) {
                        bool = true;
                        const [y, x] = around.entries()[0];
                        grid[y][x] = [new Num(0, 0)];
                        count++;
                    }
                }
            }
            return bool;
        }
        /**
         * 숫자칸이 확장할 수 있는 방향이 하나뿐이라면 그 방향으로 확장
         */
        function sol2Extra(grid) {
            let bool = false;
            const sol2Grid = grid.map((a) => a.map(() => 0));
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[0].length; j++) {
                    const targetId = getId(i, j, grid);
                    const targetN = getN(i, j, grid);
                    if (!targetId || !targetN || sol2Grid[i][j] === 1)
                        continue;
                    if (getArea(i, j, grid) === targetN)
                        continue;
                    const q = new Queue([[i, j]]);
                    const visited = new Visited(i, j);
                    const around = new Visited();
                    while (q.size()) {
                        const [y, x] = q.pop();
                        sol2Grid[y][x] = 1;
                        moves.forEach((m) => {
                            const [my, mx] = [y + m[0], x + m[1]];
                            if (grid[my]?.[mx] &&
                                !visited.has(my, mx) &&
                                getId(my, mx, grid) === targetId) {
                                q.push([my, mx]);
                                visited.push(my, mx);
                            }
                            else if (grid[my]?.[mx] &&
                                !around.has(my, mx) &&
                                !visited.has(my, mx) &&
                                grid[my][mx].some((xx) => xx.id === targetId))
                                around.push(my, mx);
                        });
                    }
                    if (around.area() === 1) {
                        bool = true;
                        const [y, x] = around.entries()[0];
                        grid[y][x] = [new Num(targetN, targetId)];
                    }
                }
            }
            return bool;
        }
        /**
         * 입력받은 칸이 완성되었으면 주변을 둘러주는 함수
         */
        function sol3(i, j, grid) {
            const targetId = getId(i, j, grid);
            const targetN = getN(i, j, grid);
            if (targetId === 0 || targetId === false || targetN === false)
                return false;
            const a = getArea(i, j, grid);
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
                        else if (!visited.has(my, mx)) {
                            grid[my][mx] = [new Num(0, 0)];
                        }
                    }
                });
            }
            return true;
        }
        /**
         * 거리가 안 닿는 숫자들의 가능성을 제거하는 함수
         */
        function sol4(grid) {
            let bool = false;
            const sol4Map = new Map();
            for (let k = 0; k < grid.length; k++) {
                for (let l = 0; l < grid[k].length; l++) {
                    if (grid[k][l].length === 1)
                        continue;
                    for (const target of grid[k][l]) {
                        const targetId = target.id;
                        const targetN = target.n;
                        if (targetId === 0)
                            continue;
                        if (!sol4Map.has(target.id)) {
                            const count = grid.reduce((a, c, i, grid) => a +
                                c.reduce((a, _, j) => a + (getId(i, j, grid) === targetId ? 1 : 0), 0), 0);
                            sol4Map.set(target.id, count);
                        }
                        const q = new Queue([[k, l, targetN]]);
                        const visited = new Visited(k, l);
                        let count2 = 0;
                        while (q.size()) {
                            const [y, x, d] = q.pop();
                            if (getId(y, x, grid) === targetId)
                                count2++;
                            if (d === 1)
                                continue;
                            moves.forEach((m) => {
                                const [my, mx] = [y + m[0], x + m[1]];
                                if (grid[my]?.[mx] &&
                                    !visited.has(my, mx) &&
                                    grid[my][mx].some((xx) => xx.id === targetId)) {
                                    q.push([my, mx, d - 1]);
                                    visited.push(my, mx);
                                }
                            });
                        }
                        if (sol4Map.get(target.id) !== count2) {
                            bool = true;
                            grid[k][l] = grid[k][l].filter((xx) => xx.id !== targetId);
                        }
                    }
                }
            }
            return bool;
        }
        /**
         * L자형 바다의 안쪽을 숫자로 확정시켜주는 함수
         */
        function sol5(grid) {
            let bool = false;
            const L = [
                [
                    [0, 1],
                    [1, 1],
                    [1, 0],
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
                            if (getId(i, j, grid))
                                sol3(i, j, grid);
                            break;
                        }
                    }
                }
            }
            return bool;
        }
        /**
         * 확정된 숫자칸 주변에 그 숫자랑 0만 올 수 있게 하는 함수
         */
        function sol6(grid) {
            let bool = false;
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[0].length; j++) {
                    const targetId = getId(i, j, grid);
                    if (targetId !== false &&
                        targetId !== 0 &&
                        grid[i][j][0].approach === 0) {
                        bool = true;
                        grid[i][j][0].approach = 1;
                        moves.forEach((m) => {
                            const [mi, mj] = [i + m[0], j + m[1]];
                            if (grid[mi]?.[mj]) {
                                grid[mi][mj] = grid[mi][mj].filter((xx) => xx.id === 0 || xx.id === targetId);
                                if (getId(mi, mj, grid))
                                    sol3(mi, mj, grid);
                            }
                        });
                    }
                }
            }
            return bool;
        }
        /**
         * 숫자에게 허용된 공간과 숫자 요구치가 딱 맞으면 공간을 숫자로 가득 채우는 함수
         */
        function sol7(grid, iniGrid) {
            let bool = false;
            for (const [[i, j], target] of iniGrid) {
                if (getArea(i, j, grid) === target.n)
                    continue; // 수정 필요
                const q = new Queue([[i, j]]);
                const visited = new Visited(i, j);
                while (q.size()) {
                    const [y, x] = q.pop();
                    moves.forEach((m) => {
                        const [my, mx] = [y + m[0], x + m[1]];
                        if (grid[my]?.[mx] &&
                            !visited.has(my, mx) &&
                            grid[my][mx].some((xx) => xx.id === target.id)) {
                            q.push([my, mx]);
                            visited.push(my, mx);
                        }
                    });
                }
                if (visited.area() === target.n) {
                    bool = true;
                    for (const [y, x] of visited.entries()) {
                        grid[y][x] = [new Num(target.n, target.id)];
                    }
                }
            }
            return bool;
        }
        function cycle(grid, iniGrid) {
            return (sol6(grid) ||
                sol5(grid) ||
                sol1(grid) ||
                sol2Extra(grid) ||
                sol2(grid) ||
                sol7(grid, iniGrid) ||
                sol4(grid));
        }
        /**
         * Proof by contradiction
         */
        function pByC(grid, iniGrid) {
            /**
             * 2*2 사각형이 있으면 true
             */
            function check1(grid) {
                const box = [
                    [-1, -1],
                    [-1, 0],
                    [0, -1],
                    [0, 0],
                ];
                for (let i = 1; i < grid.length; i++) {
                    for (let j = 1; j < grid.length; j++) {
                        if (box.every((b) => getId(i + b[0], j + b[1], grid) === 0))
                            return true;
                    }
                }
                return false;
            }
            /**
             * 고립된 바다가 있으면 true
             */
            function check2(grid) {
                const count1 = grid.reduce((a, c, i, grid) => a + c.reduce((a, _, j) => a + (getId(i, j, grid) === 0 ? 1 : 0), 0), 0);
                if (count1 === 0)
                    return false;
                const index = grid
                    .flat(1)
                    .findIndex((v) => v.length === 1 && v[0].id === 0);
                const [i, j] = [
                    Math.floor(index / grid[0].length),
                    index % grid[0].length,
                ];
                let count2 = 0;
                const q = new Queue([[i, j]]);
                const visited = new Visited(i, j);
                while (q.size()) {
                    const [y, x] = q.pop();
                    if (getId(y, x, grid) === 0)
                        count2++;
                    moves.forEach((m) => {
                        const [my, mx] = [y + m[0], x + m[1]];
                        if (grid[my]?.[mx] &&
                            !visited.has(my, mx) &&
                            grid[my][mx].some((xx) => xx.id === 0)) {
                            visited.push(my, mx);
                            q.push([my, mx]);
                        }
                    });
                }
                if (count1 !== count2)
                    return true;
                else
                    return false;
            }
            /**
             * 공간이 모자른 숫자가 있으면 true
             */
            function check3(grid) {
                for (let i = 0; i < grid.length; i++) {
                    for (let j = 0; j < grid[0].length; j++) {
                        const targetId = getId(i, j, grid);
                        const targetN = getN(i, j, grid);
                        if (!targetId || !targetN)
                            continue;
                        const q = new Queue([[i, j]]);
                        const visited = new Visited(i, j);
                        while (q.size() && visited.area() < targetN) {
                            const [y, x] = q.pop();
                            moves.forEach((m) => {
                                const [my, mx] = [y + m[0], x + m[1]];
                                if (grid[my]?.[mx] &&
                                    !visited.has(my, mx) &&
                                    grid[my][mx].some((xx) => xx.id === targetId)) {
                                    q.push([my, mx]);
                                    visited.push(my, mx);
                                }
                            });
                        }
                        if (visited.area() < targetN)
                            return true;
                    }
                }
                return false;
            }
            /**
             * 공간이 넘치는 숫자가 있으면 true
             */
            function check4(grid, iniGrid) {
                for (const [[i, j], target] of iniGrid) {
                    const a = getArea(i, j, grid);
                    if (!a)
                        throw new Error("check4");
                    if (a > target.n)
                        return true;
                }
                return false;
            }
            /**
             * 서로 안 닿는 숫자가 있으면 true
             */
            function check5(grid, iniGrid) {
                /**
                 * L에서 n개씩 뽑는 조합을 뱉는 함수
                 */
                function combination(L, n) {
                    if (n === 1) {
                        return L.map((l) => [l]);
                    }
                    let retrn = [];
                    L.forEach((l, i, L) => {
                        const rest = L.filter((_, j) => j > i);
                        const comb = combination(rest, n - 1);
                        const result = comb.map((c) => [l, ...c]);
                        retrn.push(...result);
                    });
                    return retrn;
                }
                for (const [[_, __], target] of iniGrid) {
                    const targetPos = grid.flatMap((v, i, grid) => v.reduce((a, c, j) => getId(i, j, grid) === target.id ? (a.push([i, j]), a) : a, []));
                    const comb = combination(targetPos, 2);
                    for (const [[i, j], [k, l]] of comb) {
                        const d = getDistance(i, j, k, l, grid);
                        if (!d)
                            return true;
                        if (d > target.n)
                            return true;
                    }
                }
                return false;
            }
            const len2 = new Visited();
            const others = new Visited();
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[0].length; j++) {
                    if (grid[i][j].length === 2)
                        len2.push(i, j);
                    if (grid[i][j].length > 2)
                        others.push(i, j);
                }
            }
            if (len2.area()) {
                for (const [y, x] of len2.entries()) {
                    for (const target of grid[y][x]) {
                        const tempGrid = JSON.parse(JSON.stringify(grid));
                        tempGrid[y][x] = [new Num(target.n, target.id)];
                        let n = true;
                        while (n) {
                            n = cycle(tempGrid, iniGrid);
                            if (check1(tempGrid) ||
                                check2(tempGrid) ||
                                check3(tempGrid) ||
                                check4(tempGrid, iniGrid) ||
                                check5(tempGrid, iniGrid)) {
                                grid[y][x] = grid[y][x].filter((xx) => xx.id !== target.id);
                                return;
                            }
                        }
                    }
                }
            }
            if (others.area()) {
                for (const [y, x] of others.entries()) {
                    for (const target of grid[y][x]) {
                        if (y === 11 && x === 17) {
                            if (y === 11 && x === 17)
                                0;
                        }
                        const tempGrid = JSON.parse(JSON.stringify(grid));
                        tempGrid[y][x] = [new Num(target.n, target.id)];
                        let n = true;
                        while (n) {
                            n = cycle(tempGrid, iniGrid);
                            if (check1(tempGrid) ||
                                check2(tempGrid) ||
                                check3(tempGrid) ||
                                check4(tempGrid, iniGrid) ||
                                check5(tempGrid, iniGrid)) {
                                grid[y][x] = grid[y][x].filter((xx) => xx.id !== target.id);
                                return;
                            }
                        }
                    }
                }
            }
            console.log([len2.area(), others.area()]);
            throw new Error("pByc");
        }
        const solved = (grid) => grid.every((a) => a.every((b) => b.length === 1));
        while (!solved(grid)) {
            if (!cycle(grid, iniGrid))
                pByC(grid, iniGrid);
        }
        const numList = grid.map((v) => v.map((x) => (x[0].id == 0 ? "#" : ".")));
        for (const [[y, x], target] of iniGrid)
            numList[y][x] = target.n.toString();
        return numList.map((v) => v.join("")).join("\n");
    }
    const returnString = Array.from({ length: grids.length }, (_, i) => solve(grids[i], iniGrids[i])).join("\n\n");
    return returnString;
}
console.log(solution(input));
