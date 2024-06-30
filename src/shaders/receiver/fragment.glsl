uniform sampler2D uProjectorTextures[1];
uniform mat4 uProjectorMatrices[1];
uniform vec2 uProjectorScales[1];

varying vec2 vUv;

void main() {
    vec4 finalColor = vec4(0.0);
    
    // Manually unroll the loop for a fixed number of projectors (3 in this case)
    {
        vec4 projectedUv0 = uProjectorMatrices[0] * vec4((vUv - 0.5) * uProjectorScales[0] + 0.5, 0.0, 1.0);
        vec2 uv0 = projectedUv0.xy / projectedUv0.w;
        finalColor += texture2D(uProjectorTextures[0], uv0);
    }
    // {
    //     vec4 projectedUv1 = uProjectorMatrices[1] * vec4((vUv - 0.5) * uProjectorScales[1] + 0.5, 0.0, 1.0);
    //     vec2 uv1 = projectedUv1.xy / projectedUv1.w;
    //     finalColor += texture2D(uProjectorTextures[1], uv1);
    // }
    // {
    //     vec4 projectedUv2 = uProjectorMatrices[2] * vec4((vUv - 0.5) * uProjectorScales[2] + 0.5, 0.0, 1.0);
    //     vec2 uv2 = projectedUv2.xy / projectedUv2.w;
    //     finalColor += texture2D(uProjectorTextures[2], uv2);
    // }

    gl_FragColor = finalColor / 1.0; // Divide by the number of projectors to average the color
}