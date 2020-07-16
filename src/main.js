import { ApplicationCore } from "./core.js"
import { GameScene } from "./game.js";

window.onload = () => (new ApplicationCore(256, 192)).run(GameScene);