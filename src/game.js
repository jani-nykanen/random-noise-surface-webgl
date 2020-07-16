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
    }
}