import { Vector3 } from "./vector.js";


export const State = {

    Up : 0, 
    Released : 2,

    Down : 1, 
    Pressed : 3, 

    DownOrPressed : 1,
    UpOrReleased : 0,
}


class Action {

    constructor(key1, key2) {

        this.key1 = key1;
        this.key2 = key2;
        this.state = State.Up;
    }
}


export class InputManager {


    constructor(c) {

        this.keyStates = {};
        this.prevent = {};
        this.actions = {};

        this.anyPressed = false;

        this.locked = false;

        this.mouseDelta = new Vector3(0, 0, 0);

        window.addEventListener("keydown", 
            (e) => {

                if (this.keyPressed(e.code)) 
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e) => {

                if (this.keyReleased(e.code))
                    e.preventDefault();
            });   
    

        // Disable context menu
        window.addEventListener("contextmenu", (e) => {

            e.preventDefault();
        });

        // To get the focus when embedded to an iframe
        window.addEventListener("mousemove", (e) => {

            if (!this.locked)
                window.focus();
            else {

               this.mouseMove(e.movementX, e.movementY);
            }
        });
        window.addEventListener("mousedown", (e) => {

            if (!this.locked)
                window.focus();

            c.canvas.requestPointerLock();
        });

        document.addEventListener("pointerlockchange", e => {

            this.locked = document.pointerLockElement == c.canvas;
        });
    }


    addAction(name, key1, key2) {

        this.actions[name] = new Action(key1, key2);
        this.prevent[key1] = true;
        if (key2 != undefined) {

            this.prevent[key2] = true;
        }

        return this;
    }


    mouseMove(dx, dy) {

        this.mouseDelta.x += dx;
        this.mouseDelta.y += dy;
    }


    keyPressed(key) {

        if (this.keyStates[key] != State.Down) {

            this.anyPressed = true;
            this.keyStates[key] = State.Pressed;
        }

        return this.prevent[key];
    }


    keyReleased(key) {

        if (this.keyStates[key] != State.Up)
            this.keyStates[key] = State.Released;

        return this.prevent[key];
    }


    updateStateArray(arr) {

        for (let k in arr) {

            if (arr[k] == State.Pressed)
                arr[k] = State.Down;
            else if(arr[k] == State.Released) 
                arr[k] = State.Up;
        }
    }


    update() {

        for (let k in this.actions) {

            this.actions[k].state = this.getKeyState(this.actions[k].key1);

            if (this.actions[k].key2 != undefined &&
                this.actions[k].state == State.Up) {

                this.actions[k].state = this.getKeyState(this.actions[k].key2);
            }
        }

        this.updateStateArray(this.keyStates);
    }


    postUpdate() {

        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
    }


    preventDefault(key) {

        this.prevent[key] = true;
    }


    getKeyState(key) {

        return this.keyStates[key] | State.Up;
    }
}
