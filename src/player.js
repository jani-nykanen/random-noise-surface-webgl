import { State } from "./input.js";
import { Vector3 } from "./vector.js";
import { updateSpeedAxis } from "./util.js";


export class Player {


    constructor(pos) {

        this.pos = pos.clone();
        this.startPos = pos.clone();

        this.angle = 0.0;
        this.angleSpeed = 0.0;
        this.angleTarget = 0.0;
        this.angleFriction = 0.0075;

        this.speed = new Vector3();
        this.target = this.speed.clone();
        this.friction = new Vector3(0.0033, 0.0033, 0.0033);

        this.radius = 0.225;
    }

        
    control(ev) {   

        const TURN_SPEED = 0.050;
        const MOVE_SPEED = 0.033;

        this.angleTarget = 0.0;
        if (ev.input.actions["left"].state & State.DownOrPressed) {

            this.angleTarget = 1;
        }
        else if (ev.input.actions["right"].state & State.DownOrPressed) {

            this.angleTarget = -1;
        }
        this.angleTarget *= TURN_SPEED;

        let speed = 0.0;
        if (ev.input.actions["up"].state & State.DownOrPressed) {

            speed = 1;
        }
        else if (ev.input.actions["down"].state & State.DownOrPressed) {

            speed = -1;
        }
        speed *= MOVE_SPEED;

        this.target.x = Math.cos(this.angle + Math.PI/2) * speed;
        this.target.z = Math.sin(this.angle + Math.PI/2) * speed;
    }



    move(ev) {

        this.angleSpeed = updateSpeedAxis(this.angleSpeed,
            this.angleTarget, this.angleFriction);

        this.speed.x = updateSpeedAxis(this.speed.x, 
            this.target.x, this.friction.x);
        this.speed.y = updateSpeedAxis(this.speed.y, 
            this.target.y, this.friction.y);
        this.speed.z = updateSpeedAxis(this.speed.z, 
            this.target.z, this.friction.z);

        this.angle += this.angleSpeed * ev.step;

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
        this.pos.z += this.speed.z * ev.step;
    }


    update(ev) {

        this.control(ev);
        this.move(ev);
    }


    positionCamera(c) {

        let dir = this.getDirectionalVector();

        c.transf.setView(
            this.pos, 
            new Vector3(
                this.pos.x + dir.x,
                this.pos.y + dir.y,
                this.pos.z + dir.z
            )
        );
    }


    getDirectionalVector() {

        return new Vector3(
            Math.cos(this.angle + Math.PI/2.0),
            0.0,
            Math.sin(this.angle + Math.PI/2.0)
        );
    }
}