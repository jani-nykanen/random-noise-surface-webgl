import { Mesh } from "./mesh";


export class Canvas {


    constructor(w, h) {

        this.ctx = null;
        this.canvas = null;

        this.width = w;
        this.height = h;

        this.createRenderingContext(w, h);
        this.initOpenGL();
        this.resize(window.innerWidth, window.innerHeight);
        
        // this.buildDefaultShaders();
        // this.activeShader = this.shaders.textured;
        // this.activeShader.use();

        // this.create2DRenderingObjects();

        this.boundMesh = null;
        this.boundTexture = null;

        this.mRect = this.createRectangleMesh();
    }


    createRectangleMesh() {

        return new Mesh(
            this.gl,
            [
             0, 0, 0,
             1, 0, 0,
             1, 1, 0,
             0, 1, 0
            ],
            [
             0, 0,
             1, 0,
             1, 1,
             0, 1
            ],
            [
             0, 0, -1,
             0, 0, -1,
             0, 0, -1,
             0, 0, -1
            ],
            [
             1, 1, 1,
             1, 1, 1,
             1, 1, 1,
             1, 1, 1
            ]
            [
             0, 1, 2, 
             2, 3, 0
            ],
        );
    }


    createRenderingContext(w, h) {

        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", 
            "position: absolute; top: 0; left: 0; z-index: -1;");

        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;

        this.canvas.setAttribute(
            "style", 
            "position: absolute; top: 0; left: 0; z-index: -1;" + 
            "image-rendering: optimizeSpeed;" + 
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;"
            );
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        this.gl = this.canvas.getContext("webgl", 
            {alpha:false, antialias: false});
    }


    initOpenGL() {

        let gl = this.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, 
            gl.ONE_MINUS_SRC_ALPHA, gl.ONE, 
            gl.ONE_MINUS_SRC_ALPHA);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.viewport(0, 0, this.width, this.height);
    }


    resize(w, h) {

        let c = this.canvas;
        let x, y;
        let width, height;

        // Find the best multiplier for
        // square pixels
        let mul = Math.min(
            (w / c.width) | 0, 
            (h / c.height) | 0);
            
        width = c.width * mul;
        height = c.height * mul;
        x = w/2 - width/2;
        y = h/2 - height/2;
        
        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";

        c.style.height = String(height | 0) + "px";
        c.style.width = String(width | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    }


    clear(r, g, b) {

        let gl = this.gl;

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearColor(r, g, b, 1.0);
    }
}
