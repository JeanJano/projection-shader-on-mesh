
attribute float aRandom;

varying vec2 vUv;
varying float vRandom;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
    vRandom = aRandom;
}