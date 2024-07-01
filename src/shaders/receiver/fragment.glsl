uniform sampler2D uProjectorTextures;
uniform mat4 uProjectorMatrices;
uniform vec2 uProjectorScales;

varying vec2 vUv;

void main() {
    // vec4 projectedUv = uProjectorMatrices * vec4((vUv - 0.5) * uProjectorScales + 0.5, 0.0, 1.0);
    // vec2 uv = projectedUv.xy / projectedUv.w;

    // // uv = clamp(uv, 0.0, 1.0);

    // // gl_FragColor = vec4(uv, 0.0, 1.0);

    // gl_FragColor = texture2D(uProjectorTextures, uv);

    gl_FragColor = texture2D(uProjectorTextures, vUv);
}