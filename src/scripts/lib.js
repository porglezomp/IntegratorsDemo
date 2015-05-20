function* enumerate(iter) {
    var i = 0;
    for (var item of iter)
       yield [i++, item];
}

var floor = Math.floor;
function fract(n) {
    return n - floor(n);
}

function arrayMin(arr) {
    let min = Infinity;
    for (let n of arr) { if (n < min) min = n; }
    return min;
}

function arrayMax(arr) {
    let max = -Infinity;
    for (let n of arr) { if (n > max) max = n; }
    return max;
}

function* range(begin, end, interval = 1) {
    for (let i = begin; i < end; i += interval) {
        yield i;
    }
}

function* take(n, gen) {
    gen = intoGenerator(gen);
    for (let i = 0; i < n; i++) {
        let x = gen.next();
        if (x.done) break;
        yield x.value;
    }
}

function* intoGenerator(a) {
    for (let i of a) {
        yield i;
    }
}

function* zip(...args) {
    args = args.map(a => intoGenerator(a));
    while (true) {
        let res = args.map(a => a.next());
        if (res.reduce((a, b, i, l) => a.done || b.done)) break;
        // let [an, bn] = [a.next(), b.next()];
        // if (an.done || bn.done) break;

        // yield [an.value, bn.value];
        yield res.map(a => a.value);
    }
}

const margin = 10;