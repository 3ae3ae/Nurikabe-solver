class Visited {
  constructor(y, x) {
    if (y !== undefined && x !== undefined)
      this.visited = new Map([[y, new Map([[x, 1]])]]);
    else this.visited = new Map();
  }

  push(y, x) {
    if (this.visited.has(y)) this.visited.get(y)?.set(x, 1);
    else this.visited.set(y, new Map([[x, 1]]));
  }

  has(y, x) {
    if (this.visited.get(y)?.has(x)) return true;
    else return false;
  }

  area() {
    return [...this.visited.values()].reduce((a, c) => a + c.size, 0);
  }

  entries() {
    return [...this.visited.keys()].flatMap((y) =>
      [...this.visited.get(y).keys()].map((x) => [y, x])
    );
  }
}

const v = new Visited(1, 2);
v.push(3, 4);
v.push(1, 5);
v.push(2, 0);
v.push(2, 10);
console.log(v.entries());
console.log(v.area());
