function euler(f, x0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0;
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
    for (let i = 0; i < n; i++) {
        [x, v] = [x + h*f(x, v),
                  v + h*g(x, v)];
        t += h;
        results.push([x, v]);
    }
    return results;
}

function midpoint(f, x0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0;
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

function leapfrog2(_, F, x0, v0, t0, t1, n) {
    const h = (t1 - t0)/n;
    let results = [], t = t0, x = x0, v = v0;
    for (let i = 0; i < n; i++) {
        const a = F(x);
        x += (v + a*h/2)*h;
        v += (a + F(x))*h/2;
        t += h;
        results.push([x, v]);
    }
    return results;
}