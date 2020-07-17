import { Matrix4, Vector3 } from "./vector.js";



export class Transformations {

    constructor() {

        this.model = Matrix4.identity();
        this.view = Matrix4.identity();
        this.projection = Matrix4.identity();
        this.product = Matrix4.identity();
        this.rotation = Matrix4.identity();

        this.stack = [];
        this.rotStack = [];

        this.productComputed = false;

        this.activeShader = null;
    }


    loadIdentity() {

        this.model = Matrix4.identity();
        this.rotation = Matrix4.identity();

        this.productComputed = false;
    }


    translate(x, y, z) {

        if (z == undefined) z = 0;

        this.model = Matrix4.multiply(
            this.model,
            Matrix4.translate(x, y, z)
        );

        this.productComputed = false;
    }


    scale(x, y, z) {

        if (z == undefined) z = 0;

        this.model = Matrix4.multiply(
            this.model,
            Matrix4.scale(x, y, z)
        );

        this.productComputed = false;
    }


    rotate(angle, x, y, z) {

        if (x == undefined) {

            x = 0; y = 0; z = 1;
        }

        let op = Matrix4.rotate(angle, new Vector3(x, y, z));

        this.model = Matrix4.multiply(this.model, op);
        this.rotation = Matrix4.multiply(this.rotation, op);

        this.productComputed = false;
    }


    setView(center, lookAt) {

        this.view = Matrix4.lookAt(
            new Vector3(center.x, center.y, center.z),
            new Vector3(lookAt.x, lookAt.y, lookAt.z),
            new Vector3(0, 1, 0));

        this.productComputed = false;
    }


    setView2D(w, h) {

        this.view = Matrix4.identity();
        this.projection = Matrix4.ortho2D(0, w, h, 0);

        this.productComputed = false;
    }


    setPerspective(fovY, ratio, near, far) {

        this.projection = Matrix4.perspective(
            fovY / 180.0 * Math.PI, 
            ratio, near, far
        );

        this.productComputed = false;
    }


    push() {

        this.stack.push(this.model.clone());
        this.rotStack.push(this.rotation.clone());
    }


    pop() {

        this.model = this.stack.pop();
        this.rotation = this.rotStack.pop();

        this.productComputed = false;
    }


    computeProduct() {

        if (this.productComputed) return;

        this.product = Matrix4.multiply(
            this.projection,
            Matrix4.multiply(this.view, this.model)
        );

        this.productComputed = true;
    }


    use(activeShader) {

        if (activeShader == null)
            return;

        this.computeProduct();

        activeShader.setTransformMatrix(this.product);
        activeShader.setRotationMatrix(this.rotation);
    }
}