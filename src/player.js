import { State } from "./input.js";
import { Vector3 } from "./vector.js";
import { updateSpeedAxis, clamp, negMod, isInsideTriangle } from "./util.js";


export class Player {


    constructor(pos) {

        this.pos = pos.clone();

        this.angle = new Vector3(Math.PI/2.0, Math.PI/2.0, 0);

        this.speed = new Vector3();
        this.target = this.speed.clone();
        this.friction = new Vector3(0.0033, 0.0033, 0.0033);

        this.radius = 0.225;
        
        this.height = 0.5;

        this.jumpTimer = 0;
        this.canJump = false;
    }

        
    control(ev) {   
        
        const TURN_SPEED = 0.010;
        const MOVE_SPEED = 0.033;
        const GRAVITY = 0.1;
        const JUMP_TIME = 15;

        this.target.y = GRAVITY;

        this.angle.y += -ev.input.mouseDelta.x * TURN_SPEED;
        this.angle.x += -ev.input.mouseDelta.y * TURN_SPEED;
        
        let dir, angle, speed;
        let jumpButtonState = ev.input.actions["fire1"].state;
        if (this.canJump) {
            
            dir = new Vector3(0, 0, 0);
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

            angle = (this.angle.y-Math.PI/2) + Math.atan2(dir.z, dir.x);
            speed = dir.length() * MOVE_SPEED;

            this.target.x = Math.cos(angle) * speed;
            this.target.z = Math.sin(angle) * speed;

            if (this.canJump &&
                jumpButtonState == State.Pressed) {

                this.jumpTimer = JUMP_TIME;
                this.canJump = false;

                this.speed = this.target.clone();
            }
        }
        else {

            if (jumpButtonState == State.Released ||
                jumpButtonState == State.Up) {

                this.jumpTimer = 0;
            }
        }
    }


    move(ev) {

        const ANGLE_LIMIT = Math.PI/3;
        const JUMP_SPEED = -0.05;

        this.speed.x = updateSpeedAxis(this.speed.x, 
            this.target.x, this.friction.x * ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y, 
            this.target.y, this.friction.y * ev.step);
        this.speed.z = updateSpeedAxis(this.speed.z, 
            this.target.z, this.friction.z * ev.step);

        if (this.jumpTimer > 0) {

            this.jumpTimer -= ev.step;
            this.speed.y = JUMP_SPEED;
        }

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
        this.pos.z += this.speed.z * ev.step;

        this.angle.x = clamp(this.angle.x, 
            Math.PI/2 - ANGLE_LIMIT,
            Math.PI/2 + ANGLE_LIMIT);
        
        this.angle.y = negMod(this.angle.y, Math.PI*2);
        
    }


    update(ev) {

        this.control(ev);
        this.move(ev);

        this.canJump = false;
    }


    positionCamera(c) {

        let dir = this.getDirectionalVector();

        c.transf.setView(
            Vector3.add(this.pos, new Vector3(0, -this.height, 0)), 
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


    planeCollision(A, B, C) {

        const EPS = 0.0001;
        const TOP_MARGIN = 0.1;

        if(!isInsideTriangle(this.pos.x, this.pos.z,
            A.x, A.z, B.x,B.z, C.x,C.z)) 
            return false;
    
        let v1 = new Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
        let v2 = new Vector3(C.x-A.x, C.y-A.y, C.z-A.z);
    
        let n = Vector3.cross(v1, v2);
        // If too steep
        if(Math.abs(n.y) < EPS ) return false;
        
        n.normalize();
   
        // Check if below the plane
        let cy = -(this.pos.x*n.x + this.pos.z*n.z - Vector3.dot(A, n)) / n.y;
        if(this.pos.y > cy - TOP_MARGIN &&
            this.speed.y > 0.0) {
    
            this.speed.y = 0.0;
            this.pos.y = cy;

            this.canJump = true;
            this.jumpTimer = 0;

            return true;
        }

        return false;
    }
}
