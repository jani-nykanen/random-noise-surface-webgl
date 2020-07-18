import { Vector3 } from "./vector.js";
import { Mesh } from "./mesh.js";
import { negMod } from "./util.js";


export class Heightmap {

    constructor(w, h) {

        this.data = new Array(w*h);
        this.data.fill(0);

        this.width = w;
        this.height = h;
    }


    // For testing only
    randomize(h) {

        for (let i = 0; i < this.data.length; ++ i) {

            this.data[i] = Math.random() * h;
        }

        return this;
    }
    testWaves(h) {

        let v;
        for (let y = 0; y < this.height; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                v = 0.5 * (Math.cos(x/this.width * Math.PI*4) +
                    Math.sin(y/this.height * Math.PI*4)) * h;

                this.data[y * this.width + x] = v;
            }
        }

        return this;
    }


    getHeightValue(x, y) {

        return this.data[negMod(y, this.height)*this.width + negMod(x, this.width)];
    }


    clone() {

        let out = new Heightmap(this.width, this.height);
        out.data = Array.from(this.data);

        return out;
    }
}


export class Terrain {

    constructor(heightmap, color) {

        this.width = heightmap.width;
        this.depth = heightmap.height;
        // this.height = ... max height or something?
        
        this.hmap = heightmap.clone();

        this.mesh = null;
        this.color = color.clone();
    }


    /*
    generateMeshAlternative(gl, color) {

        let sx = 1.0 / this.width;
        let sy = 1.0 / this.depth;

        let vertices = new Array();
        let uvs = new Array();
        let normals = new Array();
        let colors = new Array();
        let indices = new Array();

        let A = new Vector3(0, 0, 0);
        let B = new Vector3(0, 0, 0);
        let C = new Vector3(0, 0, 0);
        let D = new Vector3(0, 0, 0);
        let n = new Vector3(0, 0, 0);
        for (let y = 0; y < this.depth-1; ++ y) {

            for (let x = 0; x < this.width-1; ++ x) {

                A = new Vector3(sx * x,
                    this.hmap.getHeightValue(x, y), sy * y);
                B = new Vector3(sx * (x+1),
                    this.hmap.getHeightValue(x+1, y), sy * y);
                C = new Vector3(sx * (x+1),
                    this.hmap.getHeightValue(x+1, y+1), sy * (y+1));    
                D = new Vector3(sx * x,
                    this.hmap.getHeightValue(x, y+1), sy * (y+1));   

                vertices.push(A.x, A.y, A.z);
                vertices.push(B.x, B.y, B.z);
                vertices.push(C.x, C.y, C.z);

                vertices.push(C.x, C.y, C.z);
                vertices.push(D.x, D.y, D.z);
                vertices.push(A.x, A.y, A.z);

                uvs.push(A.x, A.z);
                uvs.push(B.x, B.z);
                uvs.push(C.x, C.z);

                uvs.push(C.x, C.z);
                uvs.push(D.x, D.z);
                uvs.push(A.x, A.z);

                n = Vector3.cross(
                    Vector3.add(B, Vector3.multiply(A, -1)),
                    Vector3.add(C, Vector3.multiply(A, -1))
                );
                n.normalize();

                for (let i = 0; i < 3; ++ i) {

                    normals.push(n.x, n.y, n.z);
                }

                n = Vector3.cross(
                    Vector3.add(B, Vector3.multiply(D, -1)),
                    Vector3.add(C, Vector3.multiply(D, -1))
                );
                n.normalize();

                for (let i = 0; i < 3; ++ i) {

                    normals.push(n.x, n.y, n.z);
                }
            }
        }

        for (let i = 0; i < vertices.length/3; ++ i) {

            colors.push(color.x, color.y, color.z);
            indices.push(indices.length);
        }

        return new Mesh(gl, 
            vertices, uvs, normals, colors, indices);
    }
    */


    generateMesh(gl, color) {

        let stepx = 1.0 / this.width;
        let stepy = 1.0 / this.depth;

        let vertices = new Array();
        let uvs = new Array();
        let normals = new Array();
        let colors = new Array();
        let indices = new Array();

        let n;

        // Vertices & colors
        for (let y = 0; y < this.depth; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                vertices.push(
                    stepx * x,
                    this.hmap.getHeightValue(x, y),
                    stepy * y);

                colors.push(color.x, color.y, color.z);

                uvs.push(x, y);
            }
        }
        
        // Indices
        for (let y = 0; y < this.depth-1; ++ y) {

            for (let x = 0; x < this.width-1; ++ x) {

                indices.push(   

                    y * this.width + x,
                    y * this.width + x + 1,
                    (y+1) * this.width + x + 1,

                    (y+1) * this.width + x + 1,
                    (y+1) * this.width + x,
                    y * this.width + x,
                );
            }
        }

        // Normals
        for (let y = 0; y < this.depth; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                if (x == this.width-1 && y == this.depth-1) {

                    normals.push(
                        normals[((y-1)*this.width+x-1)*3],
                        normals[((y-1)*this.width+x-1)*3 +1],
                        normals[((y-1)*this.width+x-1)*3 +2]
                    );
                }
                if (x == this.width-1) {

                    normals.push(
                        normals[(y*this.width+x-1)*3],
                        normals[(y*this.width+x-1)*3 +1],
                        normals[(y*this.width+x-1)*3 +2]
                        );
                }
                else if(y == this.depth-1) {

                    normals.push(
                        normals[((y-1)*this.width+x)*3],
                        normals[((y-1)*this.width+x)*3 +1],
                        normals[((y-1)*this.width+x)*3 +2]
                        );
                }
                else {

                    n = this.computeSurfaceNormal(vertices, x, y);
                    normals.push(n.x, n.y, n.z);
                }
            }
        }

        return new Mesh(gl, 
            vertices, uvs, normals, colors, indices);
    }


    computeSurfaceNormal(data, x, y) {

        let i = y*this.width + x;
        let j = y*this.width + x + 1;
        let k = (y+1)*this.width + x + 1;
        // let l = (y+1)*this.width + x;

        // TODO: We approximate two surface
        // normals with just the other normal.
        // There is something fishy in it...

        let ox = data[i*3];
        let oy = data[i*3 + 1];
        let oz = data[i*3 + 2];

        let v1 = Vector3.normalize(
            new Vector3(
                data[j*3] - ox, 
                data[j*3 + 1] - oy, 
                data[j*3 + 2] - oz
        ), false);

        // TODO: What if k == l ?
        let v2 = Vector3.normalize(
            new Vector3(
                data[k*3] - ox, 
                data[k*3 + 1] - oy, 
                data[k*3 + 2] - oz
        ), false);

        return  Vector3.cross(v1, v2);

    }



    draw(c) {

        if (this.mesh == null) {

            this.mesh = this.generateMesh(c.gl, this.color);
        }

        c.transf.push();
        
        c.transf.scale(10, 1, 10);
        c.transf.translate(-0.5, 0, -0.5);
        c.useTransform();

        c.drawMesh(this.mesh, null);

        c.transf.pop();
        c.useTransform();
    }
}
