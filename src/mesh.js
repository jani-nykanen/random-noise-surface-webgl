
export class Mesh {

    constructor(gl, vertices, uvs, normals, colors, indices) {

        this.elementCount = indices.length;

        this.vertexBuffer = gl.createBuffer();
        this.uvBuffer = uvs == null ? null : gl.createBuffer();
        this.normalBuffer = normals == null ? null : gl.createBuffer();
        this.colorBuffer = colors == null ? null : gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        
        // Pass data to the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 
            new Float32Array(vertices),
            gl.STATIC_DRAW);

        if (uvs != null) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, 
                    new Float32Array(uvs),
                    gl.STATIC_DRAW);
        }

        if (normals != null) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, 
                    new Float32Array(normals),
                    gl.STATIC_DRAW);   
        }

        if (colors != null) {
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, 
                    new Float32Array(colors),
                    gl.STATIC_DRAW);  
        }
                
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
                new Uint16Array(indices),
                gl.STATIC_DRAW);
    }


    bind(gl) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer( 0, 3, gl.FLOAT, gl.FALSE,0, 0);

        if (this.uvBuffer != null) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, gl.FALSE,0, 0);
        }


        if (this.normalBuffer != null) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(2, 3, gl.FLOAT, gl.FALSE,0, 0);
        }

        if (this.colorBuffer != null) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(3, 3, gl.FLOAT, gl.FALSE,0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
    }


    draw(gl) {

        gl.drawElements(gl.TRIANGLES,
            this.elementCount, 
            gl.UNSIGNED_SHORT, 0);
    }
}
