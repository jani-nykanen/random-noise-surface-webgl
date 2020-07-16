

const FRAG_FUNCTIONS = 
`
vec3 rgb332(vec3 v) {

    float div = 85.0;
    vec3 ret;
    
    float b1 = float(mod(gl_FragCoord.x, 2.0) == mod(gl_FragCoord.y, 2.0));
    float b2 = 1.0 - b1;
    ret.r = b1 * floor(v.r * 255.0 / (div / 2.0))
          + b2 * ceil(v.r * 255.0 / (div / 2.0));
    ret.g = b1 * floor(v.g * 255.0 / (div / 2.0))
          + b2 * ceil(v.g * 255.0 / (div / 2.0));
    ret.b = b1 * floor(v.b * 255.0 / (div / 2.0))
          + b2 * ceil(v.b * 255.0 / (div / 2.0));
    ret.r = floor(ret.r / 2.0) / 3.0;
    ret.g = floor(ret.g / 2.0) / 3.0;
    ret.b = floor(ret.b / 2.0) / 3.0;
    
/*
    ret.r = (floor(v.r * 255.0 / divRG) * divRG) / 255.0;
    ret.g = (floor(v.g * 255.0 / divRG) * divRG) / 255.0;
    ret.b = (floor(v.b * 255.0 / divB) * divB) / 255.0;
*/
    return ret;
}`


const VERTEX_SOURCE = {

texturedLight : 

`attribute vec3 vertexPos;
attribute vec2 vertexUV;
attribute vec3 vertexNormal;
   
uniform mat4 transform;
uniform mat4 rotation;
uniform vec3 pos;
uniform vec3 size;
uniform vec3 lightDir;
uniform float lightMag;
varying vec2 uv;
varying float light;
   
void main() {
    vec3 p = vertexPos * size + pos;
    vec4 o = transform * vec4(p, 1);
    gl_Position = o;
    
    uv = vertexUV;
    
    vec3 rot = (rotation * vec4(vertexNormal,1)).xyz;
    light = (1.0-lightMag) + lightMag * dot(rot, lightDir);
}`,


texturedNoLight : 

`attribute vec3 vertexPos;
attribute vec2 vertexUV;
attribute vec3 vertexNormal;
   
uniform mat4 transform;
uniform mat4 rotation;
uniform vec3 pos;
uniform vec3 size;
uniform vec3 lightDir;
uniform float lightMag;
varying vec2 uv;
   
void main() {
    vec3 p = vertexPos * size + pos;
    vec4 o = transform * vec4(p, 1);
    gl_Position = o;
    
    uv = vertexUV;
}`,


noTexture :

`attribute vec3 vertexPos;
attribute vec2 vertexUV;
attribute vec3 vertexNormal;
   
uniform mat4 transform;
uniform vec3 pos;
uniform vec3 size;
   
void main() {
    vec3 p = vertexPos * size + pos;
    vec4 o = transform * vec4(p, 1);
    gl_Position = o;
}`
};


const FRAGMENT_SOURCE = {

fogAndLightTextured :

`precision mediump float;
 
uniform sampler2D t0;
uniform vec4 color;
uniform vec4 fogColor;
uniform float fogDensity;
uniform vec2 texPos;
uniform vec2 texSize;
varying vec2 uv;
varying float light;
`
+ FRAG_FUNCTIONS +
`
void main() {
    const float DELTA = 0.001;
    vec2 tex = uv;    
    tex.x *= texSize.x;
    tex.y *= texSize.y;
    tex += texPos;
    vec4 res = color * texture2D(t0, tex);
    if(res.a <= DELTA) {
        discard;
    }
    vec4 a = gl_FragCoord;
    float z = a.z / a.w;
    float d = z * fogDensity;
    float fog = 1.0 / exp(d*d);
    fog = clamp(fog, 0.0, 1.0);
    gl_FragColor = vec4(
        rgb332((1.0-light)*(fog*res.xyz + (1.0-fog)*fogColor.xyz)), 
        res.a);
}`,


lightTextured :

`precision mediump float;
 
uniform sampler2D t0;
uniform vec4 color;
uniform vec4 fogColor;
uniform float fogDensity;
uniform vec2 texPos;
uniform vec2 texSize;
varying vec2 uv;
varying float light;
`
+ FRAG_FUNCTIONS +
`
void main() {
    const float DELTA = 0.001;
    vec2 tex = uv;    
    tex.x *= texSize.x;
    tex.y *= texSize.y;
    tex += texPos;
    vec4 res = color * texture2D(t0, tex);
    if(res.a <= DELTA) {
        discard;
    }
    gl_FragColor = vec4(rgb332((1.0-light)*res.xyz), res.a);
}`,



fogTextured :

`precision mediump float;
 
uniform sampler2D t0;
uniform vec4 color;
uniform vec4 fogColor;
uniform float fogDensity;
uniform vec2 texPos;
uniform vec2 texSize;
varying vec2 uv;
`
+ FRAG_FUNCTIONS +
`
void main() {
    const float DELTA = 0.001;
    vec2 tex = uv;    
    tex.x *= texSize.x;
    tex.y *= texSize.y;
    tex += texPos;
    vec4 res = color * texture2D(t0, tex);
    if(res.a <= DELTA) {
        discard;
    }
    vec4 a = gl_FragCoord;
    float z = a.z / a.w;
    float d = z * fogDensity;
    float fog = 1.0 / exp(d*d);
    fog = clamp(fog, 0.0, 1.0);
    gl_FragColor = vec4(
        rgb332(fog*res.xyz + (1.0-fog)*fogColor.xyz), 
        res.a);
}`,


textured : 

`precision mediump float;
 
uniform sampler2D t0;
uniform vec4 color;
uniform vec2 texPos;
uniform vec2 texSize;
varying vec2 uv;
varying float light;
`
+ FRAG_FUNCTIONS +
`
void main() {
    const float DELTA = 0.001;
    vec2 tex = uv;    
    tex.x *= texSize.x;
    tex.y *= texSize.y;
    tex += texPos;
    vec4 res = texture2D(t0, tex) * color;
    if(res.a <= DELTA) {
        discard;
    }
    gl_FragColor = vec4(rgb332(res.xyz), res.a);
}`,


noTexture :

`precision mediump float;
uniform vec4 color;
`
+ FRAG_FUNCTIONS +
`
void main() {
    gl_FragColor = vec4(rgb332(color.rgb), color.a);
}`

};


export function composeShader(gl, vertexName, fragmentName) {

    if (VERTEX_SOURCE[vertexName] == undefined || 
        FRAGMENT_SOURCE[fragmentName] == undefined) {

        throw "ERROR! Required shader sources do not exist: " + 
            (VERTEX_SOURCE[vertexName] == undefined ? ("Vertex: " + vertexName + " ") : "") +
            (FRAGMENT_SOURCE[fragmentName] == undefined ? ("Fragment: " + fragmentName) : "");
    }

    return new Shader(gl,
        VERTEX_SOURCE[vertexName],
        FRAGMENT_SOURCE[fragmentName]
        );
}
