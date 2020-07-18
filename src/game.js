import { Scene } from "./scene.js";
import { Player } from "./player.js";
import { Vector3 } from "./vector.js";
import { Terrain, Heightmap } from "./terrain.js";


export class GameScene extends Scene {


    constructor(ev) {

        super(ev);

        this.player = new Player(new Vector3(0, 0, -2));
        this.terrain = new Terrain( (new Heightmap(32, 32)).testWaves(0.5), 
            new Vector3(0.75, 1, 0.5));
    }


    refresh(ev) {

        this.player.update(ev);
    }


    redraw(c) {

        const FOV_Y = 70.0;

        c.clear(0.0, 0.0, 0.0);
        c.setColor(1, 1, 1, 1);
        c.resetCoordinateTransition();

        c.toggleTexturing(false);
        c.toggleDepthTest(true);

        c.toggleFogAndLighting(true, true);

        c.setLighting(0.5, this.player.getDirectionalVector());
        c.setFog(0.25, 0, 0, 0);

        c.transf.loadIdentity();
        c.transf.setPerspective(FOV_Y, c.width/c.height,
            0.1, 100.0);
        this.player.positionCamera(c);
        c.useTransform();

        this.terrain.draw(c);

        c.setColor(1, 0, 0, 1);
        c.fillRect(-0.5, -0.5, 1.0, 1.0);

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