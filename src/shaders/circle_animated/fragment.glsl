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
    float size = cos(uTime) * 0.5 + 0.5 * sin(uTime) * 0.2 + 0.5;
    size = size * 0.45;
    float strength = 1.0 - step(0.02, abs(distance(vUv, vec2(0.5)) - size));

    vec3 blackColor = vec3(0.0);
    float noise = random(vUv);

    vec3 uvColor = vec3(vUv * vRandom, vRandom * 0.7);
    vec3 mixedColor = mix(blackColor, uvColor, strength);
    gl_FragColor = vec4(mixedColor, 1.0);
}