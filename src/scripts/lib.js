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