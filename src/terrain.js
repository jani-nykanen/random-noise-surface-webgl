import { Vector3 } from "./vector.js";
import { Mesh } from "./mesh.js";
import { negMod, clamp } from "./util.js";


export class Heightmap {

    constructor(w, h) {

        this.data = new Array(w*h);
        this.data.fill(0);

        this.width = w;
        this.height = h;
    }


    getHeightValue(x, y) {

        return this.data[negMod(y, this.height)*this.width + negMod(x, this.width)];
    }


    clone() {

        let out = new Heightmap(this.width, this.height);
        out.data = Array.from(this.data);

        return out;
    }


    static upperHalfSphereSurface(width, depth, radius, height) {


        let hmap = new Heightmap(width, depth);

        let y;
        for (let z = 0; z < depth; ++ z) {

            for (let x = 0; x < width; ++ x) {

                if (Math.hypot(x - width/2, z - depth/2) >= radius) {

                    y = 0.0;
                }
                else {

                    y = height * Math.sqrt(1 - Math.pow((x-width/2)/radius, 2)) * 
                                 Math.sqrt(1 - Math.pow((z-depth/2)/radius, 2));
                }
                hmap.data[z*width+x] = y;
            }
        }

        return hmap;
    }


    static fromNoise(noise, width, depth, height) {

        let hmap = new Heightmap(width, depth);

        hmap.data = Array.from(noise);
        for (let i = 0; i < hmap.data.length; ++ i) {

            hmap.data[i] *= -height;
        }

        return hmap;
    }


    static multiply(h1, h2) {

        if (h1.width != h2.width || h1.height != h2.height) {

            throw "Heightmaps must have equal size!";
        }

        let hmap = new Heightmap(h1.width, h1.height);

        for (let i = 0; i < h1.data.length; ++ i) {

            hmap.data[i] = h1.data[i] * h2.data[i];
        }

        return hmap;
    }
}


export class Terrain {

    constructor(scale, heightmap, color) {

        this.width = heightmap.width;
        this.depth = heightmap.height;

        this.hmap = heightmap.clone();

        this.mesh = null;
        this.color = color.clone();
        this.scale = scale;
    }


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

                uvs.push(x * stepx, y * stepy);
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
        // let k = (y+1)*this.width + x + 1;
        let l = (y+1)*this.width + x;

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
                data[l*3] - ox, 
                data[l*3 + 1] - oy, 
                data[l*3 + 2] - oz
        ), false);

        return  Vector3.cross(v1, v2);

    }



    draw(c) {

        if (this.mesh == null) {

            this.mesh = this.generateMesh(c.gl, this.color);
        }

        c.transf.push();
        
        c.transf.scale(this.scale, this.scale, this.scale);
        c.transf.translate(-0.5, 0, -0.5);
        c.useTransform();

        c.drawMesh(this.mesh, null);

        c.transf.pop();
        c.useTransform();
    }


    playerCollision(o) {

        let stepx = this.scale / this.width;
        let stepz = this.scale / this.depth;

        let tx = Math.floor((o.pos.x + this.scale/2) / stepx);
        let tz = Math.floor((o.pos.z + this.scale/2) / stepz);

        /*
        if (tx < 0 || tz < 0 || tx >= this.width || tz >= this.depth)
            return false;
*/

        let px = tx*stepx - this.scale/2;
        let pz = tz*stepz - this.scale/2;

        let topLeft = new Vector3(
            px, 
            this.hmap.getHeightValue(tx, tz) * this.scale, 
            pz);

        let topRight = new Vector3(
            px + stepx, 
            this.hmap.getHeightValue(tx+1, tz) * this.scale, 
            pz);

        let bottomRight = new Vector3(
            px + stepx, 
            this.hmap.getHeightValue(tx+1, tz+1) * this.scale, 
            pz + stepz);

        let bottomLeft = new Vector3(
            px, 
            this.hmap.getHeightValue(tx, tz+1) * this.scale, 
            pz + stepz);

        return o.planeCollision(topLeft, topRight, bottomRight) ||
               o.planeCollision(bottomRight, bottomLeft, topLeft);
    }
}
