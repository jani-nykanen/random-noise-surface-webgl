import { negMod, clamp } from "./util.js";


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

/*
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
*/

function blurPixel(pixels, x, y, w, h) {
	
	let blurArr = new Array(3*3);
	blurArr.fill(0);
	
	let weight;
	let middle = y * w + x;
	for (let j = -1; j <= 1; ++ j) {
		
		for (let i = -1; i <= 1; ++ i) {
			
			if (i == j && i == 0) continue;
			
			weight = Math.abs(i) == Math.abs(j) ? 1.0/Math.SQRT2 : 0.5;
			
			blurArr[(j+1)*3 + (i+1)] = 
				(1.0-weight) * pixels[middle] +
				weight * pixels[negMod(y+j, h) * w + negMod(x + i, w)];
		}
	}
	
	let v;
	for (let j = -1; j <= 1; ++ j) {
		
		for (let i = -1; i <= 1; ++ i) {
		
			v = blurArr[(j+1)*3+(i+1)];
			pixels[negMod(y+j, h) * w + negMod(x + i, w)] = v;
		}
	}
}


function scalePixelArray(pixels, w, h, scale) {
	
	let nw = w * scale;
	let nh = h * scale;
	
	let out = new Array(nw * nh);
	out.fill(0);
	
	let step = 1.0 / scale;
	
	let dx = 0.0;
	let dy = 0.0;
	
	let tl, tr, bl, br;
	
    let w1, w2;
    let px, py;
	
	for (let y = 0; y < nh; ++ y) {
		
		for (let x = 0; x < nw; ++ x) {
			
			px = dx | 0;
			py = dy | 0;
			
			w1 = 1.0 - (dx - px);
			w2 = 1.0 - (dy - py);
			
			tl = pixels[py * w + px];
			tr = pixels[py * w + negMod(px+1,w)];
			bl = pixels[negMod(py+1, h) * w + px];
			br = pixels[negMod(py+1, h) * w + negMod(px+1,w)];
			
			out[y * nw + x] = 
				w2 * (w1 * tl + (1-w1) * tr) +
				(1-w2) * (w2 * bl + (1-w2) * br);
			
			dx += step;
		}
		
		dy += step;
		dx = 0;
	}
	
	return out;
}


export function generateNoise(w, h, scale, blurRepeat, seed) {
    
    const RAND_MAX = 256;

    let rand = new RNG( (1 << 31)-1, 1103515245, 12345, seed);

	// Generate the random base noise
	let raw = (new Array((w+2)*(h+2))).fill(
        null).map(() => (rand.next() % RAND_MAX)/RAND_MAX );
	
	// Blur
	for (let repeat = 0; repeat < blurRepeat; ++ repeat) {
		
		for (let y = 0; y < h+2; ++ y) {
			
			for (let x = 0; x < w+2; ++ x) {
				
				blurPixel(raw, x, y, w+2, h+2);
			}
		}
	}
	
	// Remove edges
	let out = new Array(w*h);
	for (let y = 1; y < h+1; ++ y) {
		
		for (let x = 1; x < w+1; ++ x) {
			
			out[(y-1)*w + x-1] = raw[y*(w+2)+x];
		}
	}
	
	scale = scale | 0;
	if (scale > 1) {
		
		out = scalePixelArray(out, w, h, scale);
	}
	out = out.map(x => clamp(x, 0, 1));
	
	return out;
}


class Noise {


	constructor (w, h, seed) {
		
		this.w = w;
		this.h = h;
		
		let rand = new RNG( (1 << 31)-1, 1103515245, 12345, seed);

		this.data = (new Array(w*h)).fill(null).map(
			() => (rand.next() % 1024)/1024
		);
	}
	
		
	f(x, y) {
		
		return this.data[negMod(y, this.h) * this.w + negMod(x, this.w)];
	}
	
}


export function bilinearInterpolation(x, y, noise) {
	
	x = negMod(x, noise.w);
	y = negMod(y, noise.h);
	
	let x1 = x | 0;
	let y1 = y | 0;
	let x2 = x1 + 1;
	let y2 = y1 + 1;
	
	return  noise.f(x1, y1) * (x2 - x) * (y2 - y) + 
			noise.f(x2, y1) * (x - x1) * (y2 - y) +
			noise.f(x1, y2) * (x2 - x) * (y - y1) +
		    noise.f(x2, y2) * (x - x1) * (y - y1);
}


export function generateNoise2(w, h, scale, seed) {

	let noise = new Noise(w, h, seed);

	let sw = w*scale;
	let sh = h*scale;
	let noiseMap = new Array(sw, sh);
	
	let dx, dy;
	for (let y = 0; y < sw; ++ y) {
		
		for (let x = 0; x < sh; ++ x) {
			
			
			dx = x / sw * noise.w;
			dy = y / sh * noise.h;
			
			noiseMap[y * sw + x] = 
				bilinearInterpolation(dx, dy, noise);
		}
	}

	return noiseMap;
}