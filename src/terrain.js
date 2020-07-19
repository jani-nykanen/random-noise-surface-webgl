import { Vector3 } from "./vector.js";
import { Mesh } from "./mesh.js";
import { negMod, clamp } from "./util.js";


export class TerrainGenerator {

    constructor(width, depth, quality) {

        this.genX = new Array(width*quality);
        this.genZ = new Array(depth*quality);

        this.width = width * quality;
        this.depth = depth * quality;

        this.quality = quality;
    }


    genTestSurface(height) {

        let latitude = (Math.PI*4) / this.quality;
        for (let x = 0; x < this.width; ++ x) {

            this.genX[x] = height * (Math.cos(x * latitude ));
            
        }
        for (let z = 0; z < this.depth; ++ z) {

            this.genZ[z] = height * (Math.sin(z * latitude));
        }

        return this;
    }


    getHeightValue(x, z) {

        return 0.5 * (this.genX[negMod(x, this.width)] + this.genZ[negMod(z, this.depth)]);
    }
}


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


    static generate(generator, startX, startZ) {
        
        let hmap = new Heightmap(generator.quality, generator.quality);
        for (let z = startZ; z < startZ+hmap.height; ++ z) {

            for (let x = startX; x < startX+hmap.width; ++ x) {

                hmap.data[z*hmap.width+x] = generator.getHeightValue(x, z);
            }
        }

        return hmap;
    }
}


export class Terrain {

    constructor(scale, terrainGen, color) {

        this.width = terrainGen.quality;
        this.depth = terrainGen.quality;

        this.hmap = Heightmap.generate(terrainGen, 0, 0);

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
