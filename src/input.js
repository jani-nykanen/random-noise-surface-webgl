

export const State = {

    Up : 0, 
    Released : 2,

    Down : 1, 
    Pressed : 3, 

    DownOrPressed : 1,
    UpOrReleased : 0,
}


class Action {

    constructor(key) {

        this.key = key;
        this.state = State.Up;
    }
}


export class InputManager {


    constructor() {

        this.keyStates = {};
        this.prevent = {};
        this.actions = {};

        this.anyPressed = false;

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

            window.focus();
        });
        window.addEventListener("mousedown", (e) => {

            window.focus();
        });

    }


    addAction(name, key) {

        this.actions[name] = new Action(key);
        this.prevent[key] = true;

        return this;
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

            this.actions[k].state = this.getKeyState(this.actions[k].key);
        }
    }


    preventDefault(key) {

        this.prevent[key] = true;
    }


    getKeyState(key) {

        return this.keyStates[key] | State.Up;
    }
}