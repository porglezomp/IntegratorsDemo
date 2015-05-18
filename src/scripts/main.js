const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function euler(f, x0, t0, t1, n) {
    let h = (t1 - t0)/n, t = t0, x = x0;
    let results = [];
    for (let i = 0; i < n; i++) {
        x += f(x)*h;
        t += h;
        results.push([x]);
    }
    return results;
}

function euler2(f, g, x0, v0, t0, t1, n) {
    let h = (t1 - t0)/n, t = t0, x = x0, v = v0;
    let results = [];
    for (let i = 0; i < n; i++) {
        [x, v] = [x + h*f(x, v),
                  v + h*g(x, v)];
        t += h;
        results.push([x, v]);
    }
    return results;
}

function rk42(f, g, x0, v0, t0, t1, n) {
    let h = (t1 - t0)/n, t = t0, x = x0, v = v0;
    let results = [];
    for (let i = 0; i < n; i++) {
        const k1 = h*f(x, v),
              l1 = h*g(x, v);
        const k2 = h*f(x + k1/2, v + l1/2),
              l2 = h*g(x + k1/2, v + l1/2);
        const k3 = h*f(x + k2/2, v + l2/2),
              l3 = h*g(x + k2/2, v + l2/2);
        const k4 = h*f(x + k3, v + l3),
              l4 = g(x + k3, v + l3);
        [x, v] = [x + (k1 + 2*(k2 + k3) + k4)/6,
                  v + (l1 + 2*(l2 + l3) + l4)/6];
        t += h;
        results.push([x, v]);
    }
    return results;
}

const margin = 10;
const rightMargin = canvas.width - margin;
const safeWidth = canvas.width - 2*margin;
const safeHeight = canvas.height - 2*margin;
const bottomMargin = canvas.height - margin;

function makeMapper(min, max) {
    return function(n) {
        const x = (n - min)/(max - min);
        return bottomMargin - safeHeight*x;
    };
}

function animate(points, duration, map=undefined) {    
    let time = 0;

    const ps = points.map(a => a[0]);
    const min = arrayMin(ps), max = arrayMax(ps);

    const mapper = map || makeMapper(min, max);
    function frame () {
        canvas.width = canvas.width;
        ctx.lineWidth = 4;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.lineColor = "black";

        let s = time/duration;
        if (s >= 1) {
            clearInterval(id);
            s = 1;
        }

        const index = (points.length - 1) * s;
        const [i, f] = [floor(index), fract(index)];
        let items = points[i].slice();
        const [y0] = points[i];
        let pos = y0;
        let items1 = items;
        if (f > 0) {
            items1 = points[i+1];
            let [y1] = points[i+1];
            pos = y0 + (y1 - y0)*f;
            for (let n = 0; n < items.length; n++) {
                items[n] = items[n]+(items1[n] - items[n])*f;
            }
        }
        pos = mapper(pos);
        ctx.beginPath();
        ctx.arc(rightMargin, pos, 8, 0, 6.2831853072, false);
        ctx.fill();

        ctx.beginPath();
        for (let n = 1; n < items.length; n++) {
            let start = (items[n] > 0) ? pos-margin : pos+margin;
            ctx.moveTo(rightMargin - margin*(n-1), start);
            ctx.lineTo(rightMargin - margin*(n-1), start - 50*items[n]);
        }
        ctx.stroke();

        ctx.beginPath();
        for (let n = 0; n <= i; n++) {
            const item = points[n]; const [y] = item;
            const offset = n*safeWidth/(points.length-1) - s*safeWidth + rightMargin;
            ctx.lineTo(offset, mapper(y));
        }
        ctx.lineTo(rightMargin, pos);
        ctx.stroke();

        time += 1/60;
    }
    const id = setInterval(frame, 1000/30);
}

const list = euler(x => -x, 1, 0, 21, 20);
const list2 = rk42((_, v) => v, (x, _) => -x, 1, 0, 0, 21, 80);
const list3 = euler2((_, v) => v, (x, _) => -x, 1, 0, 0, 21, 80);
const ps = list2.map(a => a[0]);
const ps2 = list3.map(a => a[0]);
const min = Math.min(arrayMin(ps), arrayMin(ps2)),
      max = Math.max(arrayMax(ps), arrayMax(ps2));
animate(list2, 2, makeMapper(min, max));
animate(list3, 2, makeMapper(min, max));