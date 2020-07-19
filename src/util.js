
export function negMod(m, n) {

    return (m % n + n) % n;
}


export function clamp(x, min, max) {

    return Math.max(min, Math.min(x, max));
}


export function toggleFullscreen(canvas) {

    if(document.webkitIsFullScreen || 
        document.mozFullScreen) {

        if(document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        
        else if(document.mozCancelFullScreen)
            document.mozCancelFullScreen();

        else if(document.exitFullscreen)
            document.exitFullscreen();    
    }
    else {

        if(canvas.webkitRequestFullscreen)
            canvas.webkitRequestFullscreen();

        else if(canvas.requestFullscreen) 
            canvas.requestFullscreen();

        else if(canvas.mozRequestFullScreen) 
            canvas.mozRequestFullScreen();
        
    }
}


export function isInsideTriangle(
    px, py, x1, y1, x2, y2, x3, y3) {

    let as_x = px-x1;
    let as_y = py-y1;
    let s_ab = (x2-x1)*as_y-(y2-y1)*as_x > 0;

    return !(((x3-x1)*as_y-(y3-y1)*as_x > 0) == s_ab || 
        ((x3-x2)*(py-y2)-(y3-y2)*(px-x2) > 0) != s_ab);
}


export function updateSpeedAxis(speed, target, delta) {

    if (speed < target) {

         speed = Math.min(speed + delta, target);
    }
    else if (speed > target) {

        speed = Math.max(speed - delta, target);
    }
    return speed;
}


export function interpolateVectorTransition(v, t, div, step) {

    v.x = updateSpeedAxis(v.x, t.x, Math.abs(v.x-t.x)/div *step);
    v.y = updateSpeedAxis(v.y, t.y, Math.abs(v.y-t.y)/div *step);
    v.z = updateSpeedAxis(v.z, t.z, Math.abs(v.z-t.z)/div *step);

    v.normalize();
}

export function lerp(a, b, w) {
    
    return (1.0 - w) * a + w * b;
}
