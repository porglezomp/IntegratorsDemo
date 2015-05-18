$(function() { // Begin jQuery
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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
    return id;
}

// const list = euler(x => -x, 1, 0, 21, 20);
// const list2 = rk42((_, v) => v, (x, _) => -x, 1, 0, 0, 21, 80);
// const list3 = euler2((_, v) => v, (x, _) => -x, 1, 0, 0, 21, 80);
// const ps = list2.map(a => a[0]);
// const ps2 = list3.map(a => a[0]);
// const min = Math.min(arrayMin(ps), arrayMin(ps2)),
//       max = Math.max(arrayMax(ps), arrayMax(ps2));

const integratorFns = {
    "euler": euler,
    "euler2": euler2,
    "midpoint": midpoint,
    "midpoint2": midpoint2,
    "rk4": rk4,
    "rk42": rk42,
    "leapfrog2": leapfrog2
};

let id;
let t0 = $("#t0num")[0].value = 0;
$("#t0num").change(function() { t0 = this.value; });

let t1 = $("#t1num")[0].value = 6;
$("#t1num").change(function() { t1 = this.value; });

let n = $("#steps")[0].value = 10;
$("#steps").change(function() { n = this.value; });

let currentIntegrator = $("input[name=integrator]:checked")[0].value;
console.log(currentIntegrator);
$("input[name=integrator]:radio").change(function() {
    currentIntegrator = this.value;
    restart();
});

let currentProblem = $("input[name=problem]:checked")[0].value;
console.log(currentProblem);
$("input[name=problem]:radio").change(function() {
    currentProblem = this.value;
    restart();
});

$("#restart").click(restart);
function restart() {
    clearInterval(id);
    console.log(t0, t1, n);
    if (currentProblem === "decay" || currentProblem === "spring") {
        if (currentIntegrator === "exact") {
            const times = Array.from(range(0, n)).map(i => (t1 - t0)/n * i);
            let points;
            if (currentProblem === "decay") {
                points = times.map(t => [Math.exp(-t)]);    
            } else {
                points = times.map(t => [Math.cos(t)]);    
            }
            
            id = animate(points, 2);
        } else {
            let problemArgs, integratorFn;
            if (currentProblem === "decay") {
                problemArgs = [x => -x, 1, t0, t1, n];
                integratorFn = integratorFns[currentIntegrator];
            } else {
                problemArgs = [(_, v) => v, (x, _) => -x, 1, 0, t0, t1, n];
                integratorFn = integratorFns[currentIntegrator + "2"];
            }
            
            const points = integratorFn(...problemArgs);
            id = animate(points, 2);
        }
    }
}

}); // End jQuery