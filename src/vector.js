
export class Vector3 {


	constructor(x, y, z) {
		
		this.x = x == undefined ? 0 : x;
        this.y = y == undefined ? 0 : y;
        this.z = z == undefined ? 0 : z;
	}
	
	
	length() {
		
		return Math.hypot(this.x, this.y, this.z);
	}
	
	
	normalize(forceUnit) {
		
		const EPS = 0.0001;
		
		let l = this.length();
		if (l < EPS) {
			
			this.x = forceUnit ? 1 : 0;
            this.y = 0;
            this.z = 0;

			return;
		}
		
		this.x /= l;
        this.y /= l;
        this.z /= l;
	}
	
	
	clone() {
		
		return new Vector3(this.x, this.y, this.z);
	}
	
	
	add(x, y, z) {
		
		if (typeof(x) == "object") {
			
			this.x += x.x;
            this.y += x.y;
            this.z += x.z;
		}
		else  {
			
			this.x += x;
            this.y += y;
            this.z += z;
		}
	}
	
	
	multiply(scalar) {
		
		this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
	}
	
	
	//
	// In the case the user does not want to
	// modify the values of the original vector
	//
	
	static normalize(v, forceUnit) {
		
		let out = v.clone();
		out.normalize(forceUnit);
		
		return out;
	}
	
	
	static multiply(v, scalar) {
		
		let out = v.clone();
		out.multiply(scalar);
		
		return out;
	}
	
	
	static add(v, x, y, z) {
		
		let out = v.clone();
		out.add(x, y, z);
		
		return out;
	}


	static cross(u, v) {

		return new Vector3(
			u.y * v.z - v.y * u.z,
			-(u.x * v.z - v.x * u.z),
			u.x * v.y - v.x * u.y
		);
	}
}


export class Matrix4 {
	
	
	constructor() {
			
        this.m = new Float32Array(4 * 4);
        this.m.fill(0.0);
        
        for (let i = 0; i < Math.min(this.m.length, arguments.length); ++ i) {

            this.m[i] = arguments[i];
        }
	}
    
    
    multiply(B) {
		
		let out = new Matrix4();
		
		for (let i = 0; i < 4; ++ i) {

			for (let j = 0; j < 4; ++ j) {

				for(let k = 0; k < 4; ++ k) {

					out.m[i*4 + j] += this.m[i*4 + k] * B.m[k*4 + j];
				}
			}
		}
		
		return out;
    }
    

    multiplyVector3(v) {
		
		return new Vector3(
			this.m[0]  * v.x + this.m[1]  * v.y + this.m[2]  * v.z + this.m[3],
			this.m[4]  * v.x + this.m[5]  * v.y + this.m[6]  * v.z + this.m[7],
			this.m[8]  * v.x + this.m[9]  * v.y + this.m[10] * v.z + this.m[11]
		);
	}
    

    transpose() {
		
		let out = new Matrix4();
		
		for (let j = 0; j < 4; ++ j) {
			
			for (let i = 0; i < 4; ++ i) {
				
				out.m[i * 4 + j] = this.m[j * 4 + i];
			}
		}
		
		return out;
	}
	
	
	clone() {
		
		let out = new Matrix4();
        out.m = Float32Array.from(this.m);
		
		return out;
	}


	static identity() {
		
		return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
	}
	
	
	static translate(x, y, z) {
		
		return new Matrix4(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        );
	}
	
	
	static scale(x, y, z) {
		
		return new Matrix4(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
	}
	
	
	static rotate(angle, v) {

		let ca = Math.cos(angle*v.x);
		let sa = Math.sin(angle*v.x);

		let cb = Math.cos(angle*v.y);
		let sb = Math.sin(angle*v.y);

		let cc = Math.cos(angle*v.z);
		let sc = Math.sin(angle*v.z);
		
		let A = Matrix4.identity();

		A.m[0] = cb * cc; 
		A.m[1] = -cb * sc; 
		A.m[2] = sb;

		A.m[4] = sa * sb * cc + ca * sc; 
		A.m[4 + 1] = -sa * sb * sc + ca * cc; 
		A.m[4 + 2] = -sa * cb;

		A.m[8] = -ca * sb * cc; 
		A.m[8 + 1] = ca * sb * sc + sa * cc; 
        A.m[8 + 2] = ca * cb;   
		
		return A;
	}
    
    
    static multiply(A, B) {

        return A.multiply(B);
    }


    static multiplyVector3(A, v) {

        return A.multiplyVector3(v);
    }

	
	static lookAt(eye, target, upDir) {
		
		let A = Matrix4.identity();
		
		let forward = Vector3.normalize( 
			Vector3.add(eye, new Vector3(-target.x, -target.y, -target.z))
		);
			
		let left = Vector3.normalize(Vector3.cross(forward, upDir));
		let up = Vector3.cross(forward, left);

		A.m[0] = left.x; A.m[1] = left.y; A.m[2] = left.z;
		A.m[4] = up.x; A.m[5] = up.y; A.m[6] = up.z;
		A.m[8] = forward.x; A.m[9] = forward.y; A.m[10] = forward.z;

		A.m[3] = -left.x * eye.x - left.y * eye.y - left.z * eye.z;
		A.m[7] = -up.x * eye.x - up.y * eye.y - up.z * eye.z;
		A.m[11] = -forward.x * eye.x - forward.y * eye.y - forward.z * eye.z;
		
		return A;
	}
	
	
	static perspective(fovY, aspectRatio, near, far) {
		
		let A = new Matrix4();
		
		let f = 1.0 / Math.tan(fovY / 2);

		A.m[0] = f / aspectRatio;
		A.m[5] = f;
		A.m[10] = -(far + near) / (far - near);
		A.m[11] = -2 * far * near / (far - near);
		A.m[14] = -1;
		
		return A;
	}
	
	
	static ortho(left, right, bottom, top, near, far) {
		
		let A = Matrix4.identity();
		
		A.m[0] = 2.0 / (right - left);
		A.m[3] = -(right + left) / (right - left);

		A.m[4 + 1] = 2.0 / (top - bottom);
		A.m[4 + 3] = -(top + bottom) / (top-bottom);

		A.m[8 + 2] = -2.0 / (far - near);
		A.m[8 + 3] = -(far + near) / (far - near);

		A.m[12 + 3] = 1.0;
		
		return A;
	}
	
	
	static ortho2D(left, right, bottom, top) {
		
		return Matrix4.ortho(left, right, bottom, top, -1, 1);
	}

}
