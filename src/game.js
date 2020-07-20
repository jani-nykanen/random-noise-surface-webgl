import { Scene } from "./scene.js";
import { Player } from "./player.js";
import { Vector3 } from "./vector.js";
import { Terrain, Heightmap } from "./terrain.js";
import { generateNoise } from "./noise.js";


export class GameScene extends Scene {


    constructor(ev) {

        super(ev);

        this.player = new Player(new Vector3(0.0001, 0.0, 0.0001));
        this.terrain = new Terrain(40.0,
            Heightmap.fromNoise(generateNoise(128, 128, 1, 3, (new Date()).getTime() | 0, 256), 
             128, 128, 1.00), 
            //Heightmap.upperHalfSphereSurface(64, 0.5),
    
            new Vector3(1.5, 1.0, 0.5));
    }


    refresh(ev) {

        this.player.update(ev);
        this.terrain.playerCollision(this.player);
    }


    redraw(c) {

        const FOV_Y = 70.0;

        c.clear(0.0, 0.0, 0.0);
        c.setColor(1, 1, 1, 1);
        c.resetCoordinateTransition();

        c.toggleTexturing(false);
        c.toggleDepthTest(true);

        c.toggleFogAndLighting(true, true);

        c.setLighting(1.0, this.player.getDirectionalVector());
        c.setFog(0.20, 0, 0, 0);

        c.transf.loadIdentity();
        c.transf.setPerspective(FOV_Y, c.width/c.height,
            0.1, 100.0);
        this.player.positionCamera(c);
        c.useTransform();

        this.terrain.draw(c);

        c.toggle2DMode();
        c.toggleTexturing(true);

        c.setColor(1, 1, 1, 1);
        c.drawText(c.fontDefault, 
            "x=" + String(Math.floor(this.player.pos.x*100)/100) +
            "\ny=" + String(Math.floor(this.player.pos.y*100)/100) +
            "\nz=" + String(Math.floor(this.player.pos.z*100)/100),
            2, 2, -18, 0, false);

    }
}