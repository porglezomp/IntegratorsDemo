const ALPHA = 0.6;

function animate(points, duration, canvas, map=undefined, color="black") {    
    let ctx = canvas.getContext("2d");
    const rightMargin = canvas.width - margin;
    const safeWidth = canvas.width - 2*margin;
    const safeHeight = canvas.height - 2*margin;
    const bottomMargin = canvas.height - margin;

    let time = 0;

    const mapper = map || (function() {
        const ps = points.map(a => a[0]);
        const min = arrayMin(ps), max = arrayMax(ps);
        return makeMapper(min, max);
    }());

    function frame () {
        ctx.globalAlpha = ALPHA;
        ctx.lineWidth = 4;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = ctx.fillStyle = color;

        let s = time/duration;
        let stale = s - 1;
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

        if (stale < 1) {
            ctx.globalAlpha = ALPHA*saturate(1 - stale*5);
            ctx.beginPath();
            for (let n = 1; n < items.length; n++) {
                let start = (items[n] > 0) ? pos-margin : pos+margin;
                ctx.moveTo(rightMargin - margin*(n-1), start);
                ctx.lineTo(rightMargin - margin*(n-1), start - 50*items[n]);
            }
            ctx.stroke();
            ctx.globalAlpha = ALPHA;
        }

        ctx.beginPath();
        for (let n = 0; n <= i; n++) {
            const item = points[n]; const [y] = item;
            const offset = n*safeWidth/(points.length-1) - s*safeWidth + rightMargin;
            ctx.lineTo(offset, mapper(y));
        }
        ctx.lineTo(rightMargin, pos);
        ctx.stroke();

        time += 1/30;
    }
    return frame;
}

function animateGravity(points, duration, canvas, mpx=undefined, mpy=undefined, color="black") {
    let ctx = canvas.getContext("2d");
    const rightMargin = canvas.width - margin;
    const safeWidth = canvas.width - 2*margin;
    const safeHeight = canvas.height - 2*margin;
    const bottomMargin = canvas.height - margin;

    let time = 0;

    const mapx = mpx || (function() {
        const px = points.map(a => a.x);
        const minx = arrayMin(px), maxx = arrayMax(px);
        return makeMapper(minx, miny);
    }());

    const mapy = mpy || (function() {
        const py = points.map(a => a.y);
        const miny = arrayMin(py), maxy = arrayMax(py);
        return makeMapper(miny, maxy);
    }());

    // Transpose the points array for drawing lines
    let inverted = [];
    for (let j = 0; j < points[0].length; j++) {
        inverted.push(points.map(p => p[j]));
    }

    function frame() {
        ctx.globalAlpha = ALPHA;
        ctx.lineWidth = 4;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = ctx.fillStyle = color;

        let s = time / duration;
        if (s > 1) s = 1;

        let index = s*(points.length-1);
        let [i, f] = [floor(index), fract(index)];

        let pos = [];
        // more is used to extend the range unless you're at the very end
        let more = ((s<1)?1:0);
        for (let [{x, y}, {x: x1, y: y1}] of zip(points[i], points[i+more])) {
            pos.push({x: x + (x1 - x)*f, y: y + (y1 - y)*f});
        }
        for (let [pointList, end] of zip(inverted, pos)) {
            ctx.beginPath();
            for (let {x, y} of take(i+more, pointList)) {
                ctx.lineTo(mapx(x), mapy(y));
            }
            ctx.lineTo(mapx(end.x), mapy(end.y));
            ctx.stroke();
        }

        for (let {x, y} of pos) {
            ctx.beginPath();
            ctx.arc(mapx(x), mapy(y), 8, 0, 6.2831853072, false);
            ctx.fill();
        }

        time += 1/30;
    }
    return frame;
}