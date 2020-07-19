import { Vector2 } from "./vector.js";
import { lerp } from "./util.js";


class RNG {

    constructor(mod, a, c, seed) {

        this.mod = mod;
        this.a = a;
        this.c = c;
        this.seed = seed;
    }


    next() {
        
        return (this.seed = (this.a * this.seed + this.c) % this.mod);
    }
}


let constructGradient = function(rng, count) {

    let grad = new Array(count);

    for (let i = 0; i < count; ++ i) {

        grad[i] = Vector2.normalize(
            new Vector2(
                (rng.next() % 2000) / 1000.0 - 1.0,
                (rng.next() % 2000) / 1000.0 - 1.0,
            ), true
        );
    }

    return grad;
}


let computeValue = function(gradient, ix, iy, x, y, w, h) {

    let dx = x - ix;
    let dy = y - iy;

    let g = gradient[(iy % h) * w + (ix % w)];

    return dx * g.x + dy * g.y;
}


export function perlinNoise(w, h, jump, seed, gradientCount) {

    const DIV = Math.SQRT2 / 2.0;

    let rng = new RNG( (1 << 31)-1, 1103515245, 12345, seed) 

    let gradientBasis = constructGradient(rng, gradientCount);
    let hash = k => {

        return (k * (k + 3)) % gradientCount;
    }

    let gw = (w / jump) | 0;
    let gh = (h / jump) | 0;

    // Fill array with gradients
    let gradient = new Array(gw * gh);
    for (let i = 0; i < gradient.length; ++ i) {

        gradient[i] = gradientBasis[hash(i)].clone();
    }

    let out = new Array(w * h);

    let n0, n1, ix0, ix1;
    let px, py;
    let dx, dy;
    for (let y = 0; y < h; ++ y) {

        for (let x = 0; x < w; ++ x) {

            dx = x / jump;
            dy = y / jump;

            px = dx | 0;
            py = dy | 0;

            n0 = computeValue(gradient, px, py, dx, dy, gw, gh);
            n1 = computeValue(gradient, px+1, py, dx, dy, gw, gh);
            ix0 = lerp(n0, n1, dx - px);

            n0 = computeValue(gradient, px, py+1, dx, dy, gw, gh);
            n1 = computeValue(gradient, px+1, py+1, dx, dy, gw, gh);
            ix1 = lerp(n0, n1, dx - px);

            out[y * w + x] = lerp(ix0, ix1, dy - py) / DIV;
        }
    }

    return out;
}
