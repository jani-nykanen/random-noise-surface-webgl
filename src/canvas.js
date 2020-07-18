import { Mesh } from "./mesh.js";
import { Transformations } from "./transformations.js";
import { composeShader } from "./shadersrc.js";
import { generateFontTexture } from "./texturegen.js";


export class Texture {


    constructor(gl, img) {

        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
        gl.texImage2D(gl.TEXTURE_2D, 
            0, gl.RGBA, gl.RGBA, 
            gl.UNSIGNED_BYTE, img);

        this.width = img.width;
        this.height = img.height;
    }


    bind(gl) {

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
}


export class Canvas {


    constructor(w, h) {

        this.ctx = null;
        this.canvas = null;
        this.gl = null;

        this.width = w;
        this.height = h;

        this.createRenderingContext(w, h);
        this.initOpenGL();
        this.resize(window.innerWidth, window.innerHeight);
        
        this.shaders = new Array();
        this.buildDefaultShaders();
        this.activeShader = this.shaders.noTexture;
        this.activeShader.use();

        this.boundMesh = null;
        this.boundTexture = null;

        this.mRect = this.createRectangleMesh();

        this.transf = new Transformations();

        this.fontDefault = generateFontTexture(this.gl,
            "Arial", 24, 32, true, 100);

        window.addEventListener("resize", 
            () => this.resize(window.innerWidth, window.innerHeight));
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
            ],
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

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        /*
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
            */
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        this.gl = this.canvas.getContext("webgl", 
            {alpha:false, antialias: true});
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


    buildDefaultShaders() {

        this.shaders.noTexture = composeShader(this.gl, 
            "noTexture", "noTexture");
        this.shaders.textured = composeShader(this.gl, 
            "texturedNoLight", "textured");
        this.shaders.fogAndLight = composeShader(this.gl, 
            "noTextureLight", "fogAndLightNoTexture");
        this.shaders.fog = composeShader(this.gl, 
            "texturedNoLight", "fogNoTexture");
        this.shaders.light = composeShader(this.gl, 
            "noTextureLight", "lightNoTexture");    
    }


    resize(w, h) {
/*
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
        */

        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, w, h);

        this.width = w;
        this.height = h;
    }


    clear(r, g, b) {

        let gl = this.gl;

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearColor(r, g, b, 1.0);
    }


    bindMesh(m) {

        if (m != this.boundMesh) {

            this.boundMesh = m;
            m.bind(this.gl);
        }
    }


    bindTexture(t) {

        if (t != this.boundTexture) {

            this.boundTexture = t;
            t.bind(this.gl);
        }
    }


    setColor(r, g, b, a) {

        if (r == undefined) {

            r = 1; 
            g = 1; 
            b = 1;
        }
        else if (g == undefined) {

            g = r; 
            b = r;
        }

        if (a == undefined) a = 1.0;

        this.activeShader.setColor(
            r, g, b, a
        );
    }


    fillRect(x, y, w, h) {

        this.activeShader.setVertexTransform(
            x, y, 0, 
            w, h, 0
        );
        
        this.bindMesh(this.mRect);
        this.mRect.draw(this.gl);
    }


    drawBitmap(bmp, dx, dy, dw, dh) {

        this.drawBitmapRegion(bmp, 
            0, 0, bmp.width, bmp.height,
            dx, dy, dw, dh);
    }


    drawBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, dw, dh) {

        if (dw == null) dw = sw;
        if (dh == null) dh = sh;

        if (dw < 0) {

            dx -= dw;
        }
        if (dh < 0) {

            dy -= dh;
        }

        this.activeShader.setVertexTransform(
            dx, dy, 0, 
            dw, dh, 0);
        this.activeShader.setFragTransform(
            sx/bmp.width, sy/bmp.height, 
            sw/bmp.width, sh/bmp.height);

        this.bindMesh(this.mRect);
        this.bindTexture(bmp);

        this.mRect.draw(this.gl);
    }


    drawMesh(mesh, bmp) {

        this.bindTexture(bmp);
        this.bindMesh(mesh);
        mesh.draw(this.gl);
    }


    drawText(font, str, dx, dy, xoff, yoff, center) {

        let s = font.width/16;

        this.drawScaledText(
            font, str, dx, dy, xoff, yoff, s, s, center);
    }


    drawScaledText(font, str, dx, dy, xoff, yoff, sx, sy, center) {

        let cw = font.width / 16;
        let ch = cw;

        let x = dx;
        let y = dy;
        let c;

        let usx = sx / cw;
        let usy = sy / cw;

        if (center) {

            dx -= (str.length * (cw + xoff) * usx)/ 2.0 ;
            x = dx;
        }

        for (let i = 0; i < str.length; ++ i) {

            c = str.charCodeAt(i);
            if (c == '\n'.charCodeAt(0)) {

                x = dx;
                y += (ch + yoff) * usy;
                continue;
            }

            this.drawBitmapRegion(
                font, 
                (c % 16) * cw, ((c/16)|0) * ch,
                cw, ch, x, y, sx, sy
            );

            x += (cw + xoff) * usx;
        }
    }


    toggleTexturing(state) {

        let shader = null;
        if (!state) {

            shader = this.shaders.noTexture;
        }
        else {

            shader = this.shaders.textured;
        }

        if (shader == this.activeShader) return;
        this.activeShader = shader;

        this.activeShader.use();
        this.setColor(1, 1, 1, 1);
        this.useTransform();
    }


    toggleFogAndLighting(fogState, lightState) {

        let shader = null;

        if (fogState && lightState) 
            shader = this.shaders.fogAndLight;
        else if (fogState)
            shader = this.shaders.fog;
        else if (lightState)
            shader = this.shaders.light;
        else
            shader = this.shaders.textured;   

        if (shader == this.activeShader) return;
        this.activeShader = shader;

        this.activeShader.use();
        this.setColor(1, 1, 1, 1);
        this.useTransform();
    }


    toggle2DMode() {

        this.toggleDepthTest(false);
        this.resetCoordinateTransition();

        this.transf.loadIdentity();
        this.transf.setView2D(this.width, this.height);

        this.useTransform();
    }


    toggleDepthTest(state) {

        if (state)
            this.gl.enable(this.gl.DEPTH_TEST);
        else
            this.gl.disable(this.gl.DEPTH_TEST);
    }


    resetCoordinateTransition() {

        this.activeShader.setVertexTransform(
            0, 0, 0, 1, 1, 1);
        this.activeShader.setFragTransform(0, 0, 1, 1);
    }


    setFog(density, r, g, b) {

        this.activeShader.setFog(density, r, g, b);
    }


    setLighting(mag, dir) {

        this.activeShader.setLight(mag, 
            dir.x, dir.y, dir.z);
    }


    useTransform() {

        this.transf.use(this.activeShader);
    }
}
