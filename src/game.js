import { Scene } from "./scene.js";


export class GameScene extends Scene {


    constructor(ev) {

        super(ev);
    }


    refresh(ev) {

        // ...
    }


    redraw(c) {

        c.clear(0.70, 0.70, 0.70);

        c.toggle2DMode();
        c.toggleTexturing(false);

        c.setColor(1, 0, 0, 1);
        c.fillRect(16, 8, 64, 32);

        c.toggleTexturing(true);

        c.drawText(c.fontDefault, "Hello world!",
            2, 2, -8, 0, false);

    }
}