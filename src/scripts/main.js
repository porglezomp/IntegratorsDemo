$(function() { // Begin jQuery
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function makeMapper(min, max) {
    return function(n) {
        const x = (min - max === 0) ? 0.5 : (n - min)/(max - min);
        return (canvas.height - margin) -
               (canvas.height - 2*margin)*x;
    };
}

function makeXMapper(min, max) {
    return function(n) {
        const x = (min - max === 0) ? 0.5 : (n - min)/(max - min);
        return (canvas.width - margin) -
               (canvas.width - 2*margin)*x;
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

const integratorFns = {
    "euler": euler,
    "euler2": euler2,
    "eulerg": eulerg,
    "midpoint": midpoint,
    "midpoint2": midpoint2,
    "midpointg": midpointg,
    "rk4": rk4,
    "rk42": rk42,
    "leapfrog2": leapfrog2,
    "leapfrogg": leapfrogg,
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
$(document).keypress(function(e) {
    if (e.which == 13) {
        t0 = Number($("#t0num")[0].value);
        t1 = Number($("#t1num")[0].value);
        n = Number($("#steps")[0].value);
        restart();
    }
});
function restart() {
    if (currentProblem === "gravity") {
        restartGravity();
        return;
    }

    runningAnimations = [];
    let animationList = [];

    for (let currentIntegrator of currentIntegrators) {
        if (currentProblem === "decay" || currentProblem === "spring") {
            let color = integratorColors[currentIntegrator];
            if (currentIntegrator === "exact") {
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
        runningAnimations.push(animate(points, 2, canvas, mapper, color));
    }
}

const objs = [
    {m: 10, x: 0, y: 0, vx: 0, vy: Math.sqrt(11/10)/10},
    {m: 1, x: 10, y: 0, vx: 0, vy: Math.sqrt(11/10)},
    {m: 2, x: 10, y: 10, vx: 0.5, vy: 0}
];

function restartGravity() {
    runningAnimations = [];
    let animationList = [];

    for (let currentIntegrator of currentIntegrators) {
        if (currentIntegrator === "rk4") continue;

        let color = integratorColors[currentIntegrator];
        let integratorFn = integratorFns[currentIntegrator + "g"];
        let points = integratorFn(objs, t0, t1, n);

        animationList.push({points, color});
    }

    let minx = Infinity, maxx = -Infinity,
        miny = Infinity, maxy = -Infinity;
    for (let {points} of animationList) {
        let amaxx = arrayMax(points.map(a => arrayMax(a.map(b => b.x)))),
            aminx = arrayMin(points.map(a => arrayMin(a.map(b => b.x)))),
            amaxy = arrayMax(points.map(a => arrayMax(a.map(b => b.y)))),
            aminy = arrayMin(points.map(a => arrayMin(a.map(b => b.y))));
        maxx = Math.max(amaxx, maxx);
        minx = Math.min(aminx, minx);
        maxy = Math.max(amaxy, maxy);
        miny = Math.min(aminy, miny);
    }

    const mapx = makeXMapper(minx, maxx),
          mapy = makeMapper(miny, maxy);
    for (let {points, color} of animationList) {
        runningAnimations.push(
            animateGravity(points, 10, canvas, mapx, mapy, color)
        );
    }
}

}); // End jQuery