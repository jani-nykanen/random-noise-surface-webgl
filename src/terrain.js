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
        let l = (y+1)*this.width + x;

        // TODO: This is from an old project, might be 
        // a good idea to refactor a things or two...

        // Compute two different normals and
        // take their mean, which is a sufficient
        // approximation for the surface normals

        let ox = data[i*3];
        let oy = data[i*3 + 1];
        let oz = data[i*3 + 2];

        let v1 = Vector3.normalize(
            new Vector3(
                data[j*3] - ox, 
                data[j*3 + 1] - oy, 
                data[j*3 + 2] - oz
        ), false);

        let v2 = Vector3.normalize(
            new Vector3(
                data[k*3] - ox, 
                data[k*3 + 1] - oy, 
                data[k*3 + 2] - oz
        ), false);

        ox = data[l*3];
        oy = data[l*3 + 1];
        oz = data[l*3 + 2];

        let v3 = Vector3.normalize(
            new Vector3(
                data[j*3] - ox, 
                data[j*3 + 1] - oy, 
                data[j*3 + 2] - oz
        ), false);

        let v4 = Vector3.normalize(
            new Vector3(
                data[k*3] - ox, 
                data[k*3 + 1] - oy, 
                data[k*3 + 2] - oz
        ), false);
        v4.normalize();

        let n1 = Vector3.cross(v1, v2);
        let n2 = Vector3.cross(v3, v4);

        // Compute the mean vector. We can safely
        // assume that this is not 0
        // TODO: Oh dear god no
        return Vector3.normalize(new Vector3(
            -0.5 * (n1.x+n2.y),
            -0.5 * (n1.x+n2.y),
            -0.5 * (n1.x+n2.y)));
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
