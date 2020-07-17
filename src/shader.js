import { Matrix4 } from "./vector.js";


export class Shader {


    constructor(gl, vertexSrc, fragSrc) {

        this.gl = gl;
        this.unif = {};
        this.program = this.buildShader(vertexSrc, fragSrc);
        this.getUniformLocations();
    }


    getUniformLocations() {

        let gl = this.gl;

        const NAMES = [
            "transform", 
            "rotation",

            "color",
            "t0",

            "fogColor",
            "fogDensity",
            "lightDir",
            "lightMag",

            "pos",
            "size",
            "texPos",
            "texSize"
        ];

        // Get uniform locations for the each name
        for (let n of NAMES) {

            this.unif[n] = gl.getUniformLocation(
                this.program, n);
        }
    }


    createShader(src, type) {

        let gl = this.gl
    
        let shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
    
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    
            throw "Shader error:\n" + 
                gl.getShaderInfoLog(shader);
                
        }
    
        return shader;
    }


    buildShader(vertexSrc, fragSrc) {

        let gl = this.gl;
    
        let vertex = this.createShader(vertexSrc, 
                gl.VERTEX_SHADER);
        let frag = this.createShader(fragSrc, 
                gl.FRAGMENT_SHADER);
    
        let program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, frag);
    
        this.bindLocations(program);

        gl.linkProgram(program);
    
        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    
            throw "Shader error: " + 
                gl.getProgramInfoLog(program);
        }
        
        return program;
    }

    
    bindLocations(program) {

        let gl = this.gl;

        gl.bindAttribLocation(program, 0, "vertexPos");
        gl.bindAttribLocation(program, 1, "vertexUV");
        gl.bindAttribLocation(program, 2, "vertexNormal");
        gl.bindAttribLocation(program, 3, "vertexColor");
    }


    use() {

        let gl = this.gl;
    
        gl.useProgram(this.program);

        let id = Matrix4.identity();

        // Set default uniforms
        gl.uniform1i(this.unif["t0"], 0);
        this.setVertexTransform(
            0, 0, 0, 
            1, 1, 1);
        this.setFragTransform(0, 0, 1, 1);
        this.setRotationMatrix(id);
        this.setTransformMatrix(id);
        this.setColor(1, 1, 1, 1);
    }


    setVertexTransform(x, y, z, w, h, d) {

        let gl = this.gl;

        gl.uniform3f(this.unif["pos"], x, y, z);
        gl.uniform3f(this.unif["size"], w, h, d);
    }


    setFragTransform(x, y, w, h) {

        let gl = this.gl;

        gl.uniform2f(this.unif["texPos"], x, y);
        gl.uniform2f(this.unif["texSize"], w, h);
    }


    setColor(r, g, b, a) {

        let gl = this.gl;
        gl.uniform4f(this.unif["color"], r, g, b, a);
    }


    setTransformMatrix(mat) {

        let gl = this.gl;

        gl.uniformMatrix4fv(this.unif["transform"], 
            false, mat.transpose().m);
    }


    setRotationMatrix(mat) {

        let gl = this.gl;

        gl.uniformMatrix4fv(this.unif["rotation"], 
            false, mat.transpose().m);
    }


    setFog(d, r, g, b) {

        let gl = this.gl;
    
        gl.uniform4f(this.unif["fogColor"], r, g, b, 1.0);
        gl.uniform1f(this.unif["fogDensity"], d);
    }


    setLighting(mag, x, y, z) {

        let gl = this.gl;
    
        gl.uniform3f(this.unif["lightDir"], x, y, z);
        gl.uniform1f(this.unif["lightMag"], mag);
    }
}
