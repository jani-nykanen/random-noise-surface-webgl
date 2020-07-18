import { Texture } from "./canvas.js";


export function generateFontTexture(gl, type, size, offset, bold, alphaLimit) {

    const EPS = 64;

    if (alphaLimit == undefined)
        alphaLimit = EPS;

    let w = offset * 16;
    let h = w;

    let cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    let ctx = cv.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    let fontStr = (bold ? "bold " : "") + String(size | 0) + "px " + type;
    ctx.font = fontStr;
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";

    let x, y;
    for (let c = 0; c < 255; ++ c) {

        x = (c % 16) * offset + offset/2;
        y = Math.floor(c / 16) * offset + size;
        
        ctx.fillText(String.fromCharCode(c), x, y);
    }

    // Make the image "monochrome" (only white and alpha)
    /*
    let imageData = ctx.getImageData(0, 0, w, h);
    let data = imageData.data;
    for (let i = 0; i < data.length/4; ++ i) {

        data[i*4] = 255;
        data[i*4 +1] = 255;
        data[i*4 +2] = 255;
        data[i*4 + 3] = data[i*4 + 3] < alphaLimit ? 0 : 255;
    }

    ctx.putImageData(imageData, 0, 0);
    */

    return new Texture(gl, cv);
}
