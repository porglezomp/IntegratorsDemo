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

let runningAnimations = [];
setInterval(performAnimations, 1000/30);
function performAnimations() {
    canvas.width = canvas.width;
    for (let anim of runningAnimations) {
        anim();
    }
}

function animate(points, duration, map=undefined, color="black") {    
    let time = 0;

    const ps = points.map(a => a[0]);
    const min = arrayMin(ps), max = arrayMax(ps);

    const mapper = map || makeMapper(min, max);
    function frame () {
        ctx.lineWidth = 4;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = ctx.fillStyle = color;

        let s = time/duration;
        if (s >= 1) s = 1;

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
    runningAnimations.push(frame);
}

const integratorFns = {
    "euler": euler,
    "euler2": euler2,
    "midpoint": midpoint,
    "midpoint2": midpoint2,
    "rk4": rk4,
    "rk42": rk42,
    "leapfrog2": leapfrog2
};

const integratorColors = {
    "euler": "red",
    "midpoint": "blue",
    "rk4": "green",
    "leapfrog": "orange"
};

let t0 = $("#t0num")[0].value = 0;
$("#t0num").change(function() { t0 = Number(this.value); });

let t1 = $("#t1num")[0].value = 6;
$("#t1num").change(function() { t1 = Number(this.value); });

let n = $("#steps")[0].value = 10;
$("#steps").change(function() { n = Number(this.value); });

let currentIntegrators = new Set([$("input[name=integrator]:checked")[0].value]);
$("input[name=integrator]:checkbox").change(function() {
    if (this.checked) {
        currentIntegrators.add(this.value);
    } else {
        currentIntegrators.delete(this.value);
    }
    restart();
});

let currentProblem = $("input[name=problem]:checked")[0].value;
function setIntegratorVisibility() {
    $("#exact, #leapfrog").show();
    if (currentProblem === "gravity") {
        $("#exact").hide();
    } else if (currentProblem === "decay") {
        $("#leapfrog").hide();
    }
}
setIntegratorVisibility();
$("input[name=problem]:radio").change(function() {
    currentProblem = this.value;
    setIntegratorVisibility();
    restart();
});

$("#restart").click(restart);
function restart() {
    runningAnimations = [];
    let animationList = [];
    for (let currentIntegrator of currentIntegrators) {
        if (currentProblem === "decay" || currentProblem === "spring") {
            let color = integratorColors[currentIntegrator];
            if (currentIntegrator === "exact") {
                console.log(t0, t1, n);
                const times = Array.from(range(0, n+1)).map(i => (t1 - t0)/n * i);
                let points;
                if (currentProblem === "decay") {
                    points = times.map(t => [Math.exp(-t)]);    
                } else {
                    points = times.map(t => [Math.cos(t)]);    
                }
                
                animationList.push({points, color});
            } else {
                let problemArgs, integratorFn;
                if (currentProblem === "decay") {
                    // The leapfrog integrator only makes sense for x'' = F(x),
                    // and the decay problem isn't in that form.
                    if (currentIntegrator === "leapfrog") continue;

                    problemArgs = [x => -x, 1, t0, t1, n];
                    integratorFn = integratorFns[currentIntegrator];
                } else {
                    problemArgs = [(_, v) => v, (x, _) => -x, 1, 0, t0, t1, n];
                    integratorFn = integratorFns[currentIntegrator + "2"];
                }
                
                let points = integratorFn(...problemArgs);
                animationList.push({points, color});
            }
        }
    }

    let min = Infinity, max = -Infinity;
    for (let {points} of animationList) {
        let amax = arrayMax(points.map(x => x[0])),
            amin = arrayMin(points.map(x => x[0]));
        max = Math.max(max, amax);
        min = Math.min(min, amin);
    }

    const mapper = makeMapper(min, max);
    for (let {points, color} of animationList) {
        animate(points, 2, mapper, color);
    }
}

}); // End jQuery