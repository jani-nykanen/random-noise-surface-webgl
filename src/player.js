import { State } from "./input.js";
import { Vector3 } from "./vector.js";
import { updateSpeedAxis, clamp, negMod } from "./util.js";


export class Player {


    constructor(pos) {

        this.pos = pos.clone();
        this.startPos = pos.clone();

        this.angle = new Vector3(Math.PI/2.0, Math.PI/2.0, 0);
        this.angleTarget = new Vector3(0, 0, 0);
        this.angleSpeed = this.angleTarget.clone();
        this.angleFriction = new Vector3(0.02, 0.02, 0.02);

        this.speed = new Vector3();
        this.target = this.speed.clone();
        this.friction = new Vector3(0.0033, 0.0033, 0.0033);

        this.radius = 0.225;
    }

        
    control(ev) {   
        
        const TURN_SPEED = 0.025;
        const MOVE_SPEED = 0.033;

        this.angleTarget.y = -ev.input.mouseDelta.x * TURN_SPEED;
        this.angleTarget.x = -ev.input.mouseDelta.y * TURN_SPEED;

        let dir = new Vector3(0, 0, 0);
        if (ev.input.actions["up"].state & State.DownOrPressed) {

            dir.z = 1;
        }
        else if (ev.input.actions["down"].state & State.DownOrPressed) {

            dir.z = -1;
        }
        if (ev.input.actions["left"].state & State.DownOrPressed) {

            dir.x = -1;
        }
        else if (ev.input.actions["right"].state & State.DownOrPressed) {

            dir.x = 1;
        }
        dir.normalize(false);

        let angle = (this.angle.y-Math.PI/2) + Math.atan2(dir.z, dir.x);
        let speed = dir.length() * MOVE_SPEED;

        this.target.x = Math.cos(angle) * speed;
        this.target.z = Math.sin(angle) * speed;
    }



    move(ev) {

        const ANGLE_LIMIT = Math.PI/4;

        this.speed.x = updateSpeedAxis(this.speed.x, 
            this.target.x, this.friction.x);
        this.speed.y = updateSpeedAxis(this.speed.y, 
            this.target.y, this.friction.y);
        this.speed.z = updateSpeedAxis(this.speed.z, 
            this.target.z, this.friction.z);

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
        this.pos.z += this.speed.z * ev.step;

        this.angleSpeed.x = updateSpeedAxis(this.angleSpeed.x, 
            this.angleTarget.x, this.angleFriction.x);
        this.angleSpeed.y = updateSpeedAxis(this.angleSpeed.y, 
            this.angleTarget.y, this.angleFriction.y);
        this.angleSpeed.z = updateSpeedAxis(this.angleSpeed.z, 
            this.angleTarget.z, this.angleFriction.z);

        this.angle.x += this.angleSpeed.x * ev.step;
        this.angle.y += this.angleSpeed.y * ev.step;
        this.angle.z += this.angleSpeed.z * ev.step;

        if (Math.abs(this.angle.x - Math.PI/2) > ANGLE_LIMIT) {
        
            this.angle.x = clamp(this.angle.x, 
                Math.PI/2 - ANGLE_LIMIT,
                Math.PI/2 + ANGLE_LIMIT);
            this.angleSpeed.x = 0;
        }
        this.angle.y = negMod(this.angle.y, Math.PI*2);
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
            Math.sin(this.angle.x) * Math.cos(this.angle.y),
            Math.cos(this.angle.x),
            Math.sin(this.angle.x) * Math.sin(this.angle.y)
        );
    }
}