function euler(f, x0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0;
    results.push([x]);
    for (let i = 0; i < n; i++) {
        x += f(x)*h;
        t += h;
        results.push([x]);
    }
    return results;
}

function euler2(f, g, x0, v0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0, v = v0;
    results.push([x, v]);
    for (let i = 0; i < n; i++) {
        [x, v] = [x + h*f(x, v),
                  v + h*g(x, v)];
        t += h;
        results.push([x, v]);
    }
    return results;
}

function eulerg(objects, t0, t1, n) {
    const G = 1;
    const h = (t1 - t0)/n;
    let results = [];
    results.push(objects.map(o => ({x: o.x, y: o.y})));
    for (let i = 0; i < n; i++) {
        let tmp = [];
        for (let obj of objects) {
            let Fx = 0, Fy = 0;
            for (let other of objects) {
                if (other === obj) continue;

                const dx = other.x - obj.x,
                      dy = other.y - obj.y;
                const r2 = dx*dx + dy*dy;
                const r = Math.sqrt(r2);
                const a = obj.m*other.m*G/r2;
                Fx += dx/r * a; Fy += dy/r * a;
            }
            let vx = obj.vx + Fx*h/obj.m,
                vy = obj.vy + Fy*h/obj.m;
            let x = obj.x + obj.vx*h,
                y = obj.y + obj.vy*h;
            tmp.push({m: obj.m, x, y, vx, vy});
        }
        objects = tmp;
        results.push(objects.map(o => ({x: o.x, y: o.y})));
    }
    return results;
}

function midpointg(objects, t0, t1, n) {
    const G = 1;
    const h = (t1 - t0)/n;
    let results = [];
    results.push(objects.map(o => ({x: o.x, y: o.y})));
    for (let i = 0; i < n; i++) {
        let tmp = [];
        for (let obj of objects) {
            let Fx = 0, Fy = 0;
            for (let other of objects) {
                if (other === obj) continue;

                let dx = other.x - obj.x,
                    dy = other.y - obj.y;
                let r2 = dx*dx + dy*dy;
                let r = Math.sqrt(r2);
                let a = obj.m*other.m*G/r2;
                Fx += dx/r * a; Fy += dy/r * a;
            }
            let vx = obj.vx + Fx*h/obj.m/2,
                vy = obj.vy + Fy*h/obj.m/2;
            let x = obj.x + obj.vx*h/2,
                y = obj.y + obj.vy*h/2;
            tmp.push({m: obj.m, x, y, vx, vy});
        }
        
        // x_{n+1} = x_n + hf(x + hf(x, v)/2, v + hg(x, v)/2)
        // v_{n+1} = v_n + hg(x + hf(x, v)/2, v + hg(x, v)/2)

        // tmp contains x + hf(x, v)/2 and v + hg(x, v)/2
        let tmp2 = [];
        for (let [start, obj] of zip(objects, tmp)) {
            let Fx = 0, Fy = 0;
            for (let other of tmp) {
                if (other === obj) continue;

                let dx = other.x - obj.x,
                    dy = other.y - obj.y;
                let r2 = dx*dx + dy*dy;
                let r = Math.sqrt(r2);
                let a = obj.m*other.m*G/r2;
                Fx += dx/r * a; Fy += dy/r * a;
            }
            let vx = start.vx + Fx*h/obj.m,
                vy = start.vy + Fy*h/obj.m;
            let x = start.x + obj.vx*h,
                y = start.y + obj.vy*h;
            tmp2.push({m: start.m, x, y, vx, vy});
        }
        objects = tmp2;
        results.push(objects.map(o => ({x: o.x, y: o.y})));
    }
    return results;
}

function midpoint(f, x0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0;
    results.push([x]);
    for (let i = 0; i < n; i++) {
        x += h*f(x + h*f(x)/2);
        t += h;
        results.push([x]);
    }
    return results;
}

function midpoint2(f, g, x0, v0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0, v = v0;
    results.push([x, v]);
    for (let i = 0; i < n; i++) {
        [x, v] = [x + h*f(x + h*f(x, v)/2, v + h*g(x, v)/2),
                  v + h*g(x + h*f(x, v)/2, v + h*g(x, v)/2)];

        t += h;
        results.push([x, v]);
    }
    return results;
}

function rk4(f, x0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0;
    results.push([x]);
    for (let i = 0; i < n; i++) {
        const k1 = h*f(x);
        const k2 = h*f(x + k1/2);
        const k3 = h*f(x + k2/2);
        const k4 = h*f(x + k3);
        x += (k1 + 2*(k2 + k3) + k4)/6;
        t += h;
        results.push([x]);
    }
    return results;
}

function rk42(f, g, x0, v0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0, v = v0;
    results.push([x, v]);
    for (let i = 0; i < n; i++) {
        const k1 = h*f(x, v),
              l1 = h*g(x, v);
        const k2 = h*f(x + k1/2, v + l1/2),
              l2 = h*g(x + k1/2, v + l1/2);
        const k3 = h*f(x + k2/2, v + l2/2),
              l3 = h*g(x + k2/2, v + l2/2);
        const k4 = h*f(x + k3, v + l3),
              l4 = h*g(x + k3, v + l3);
        [x, v] = [x + (k1 + 2*(k2 + k3) + k4)/6,
                  v + (l1 + 2*(l2 + l3) + l4)/6];
        t += h;
        results.push([x, v]);
    }
    return results;
}

// let rk4g = leapfrogg;

function leapfrog2(_, F, x0, v0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0, v = v0;
    results.push([x, v]);
    for (let i = 0; i < n; i++) {
        const a = F(x);
        x += (v + a*h/2)*h;
        v += (a + F(x))*h/2;
        t += h;
        results.push([x, v]);
    }
    return results;
}

function leapfrogg(objects, t0, t1, n) {
    const G = 1;
    const h = (t1 - t0)/n;
    let results = [];
    results.push(objects.map(o => ({x: o.x, y: o.y})));

    function calcAccel(objects) {
        let tmp = [];
        for (let obj of objects) {
            let Fx = 0, Fy = 0;
            for (let other of objects) {
                if (other === obj) continue;

                const dx = other.x - obj.x, dy = other.y - obj.y;
                const r2 = dx*dx + dy*dy;
                const a = obj.m*other.m*G/r2/Math.sqrt(r2);
                Fx += dx * a; Fy += dy * a;
            }
            tmp.push({ax: Fx/obj.m, ay: Fy/obj.m});
        }
        return tmp;
    }

    for (let i = 0; i < n; i++) {
        let accel = calcAccel(objects);

        let tmp = [];
        for (let [obj, {ax, ay}] of zip(objects, accel)) {
            tmp.push({
                m: obj.m, vx: obj.vx, vy: obj.vy,
                x: obj.x + (obj.vx + ax*h/2)*h,
                y: obj.y + (obj.vy + ay*h/2)*h
            });
        }
        objects = tmp;

        let accel2 = calcAccel(objects);

        tmp = [];
        for (let [obj, {ax, ay}, {ax: ax2, ay: ay2}] of zip(objects, accel, accel2)) {
            tmp.push({
                m: obj.m, x: obj.x, y: obj.y,
                vx: obj.vx + (ax + ax2)*h/2,
                vy: obj.vy + (ay + ay2)*h/2
            });
        }
        objects = tmp;
        results.push(objects.map(o => ({x: o.x, y: o.y})));
    }
    return results;
}