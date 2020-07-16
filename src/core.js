import { Scene } from "./scene.js";
import { InputManager } from "./input.js";
import { Canvas } from "./canvas.js";


export class ApplicationCore {


    constructor(canvasWidth, canvasHeight) {

        this.timeSum = 0;
        this.oldTime = 0;

        this.ev = {

            step: 1,

            input: new InputManager()
                .addAction("left", "ArrowLeft")
                .addAction("up", "ArrowUp")
                .addAction("right", "ArrowRight")
                .addAction("down", "ArrowDown")
                .addAction("start", "Enter")
        };

        this.canvas = new Canvas(canvasWidth, canvasHeight);

        this.activeScene = new Scene(this.ev);
    }


    loop(ts) {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        let firstFrame = true;
        while ((refreshCount --) > 0) {

            this.activeScene.refresh(this.ev);

            if (firstFrame) {

                this.ev.input.update();
                firstFrame = false;
            }

            this.timeSum -= FRAME_WAIT;
        } 

        this.activeScene.redraw(this.canvas);

        window.requestAnimationFrame(
            (ts) => this.loop(ts)
        );
    }


    run(initialScene) {

        this.activeScene = new initialScene.prototype.constructor(this.ev);

        this.loop(0);
    }
}