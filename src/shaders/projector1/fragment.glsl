uniform float uTime;

varying vec2 vUv;
varying float vRandom;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main()
{
    float noise = random(vUv);
    gl_FragColor = vec4(0.0, 0.0, 0.7, 1.0 - noise * 0.5);
}