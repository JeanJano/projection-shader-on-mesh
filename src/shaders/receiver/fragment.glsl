uniform sampler2D uProjectorTexture;
uniform mat4 uProjectorMatrix;
uniform sampler2D uProjectorTexture1;
uniform mat4 uProjectorMatrix1;

varying vec2 vUv;
varying vec4 vWorldPosition;


void main() {
    vec4 projectorPosition = uProjectorMatrix * vWorldPosition;
    vec3 ndc = projectorPosition.xyz / projectorPosition.w;
    vec2 uvProjector = ndc.xy * 0.5 + 0.5;

    vec4 projectorPosition1 = uProjectorMatrix1 * vWorldPosition;
    vec3 ndc1 = projectorPosition1.xyz / projectorPosition1.w;
    vec2 uvProjector1 = ndc1.xy * 0.5 + 0.5;

    vec4 texColor = vec4(0.0);
    vec4 texColor1 = vec4(0.0);

    if (uvProjector.x > 0.0 && uvProjector.x < 1.0 && uvProjector.y > 0.0 && uvProjector.y < 1.0 && ndc.z > 0.0 && ndc.z < 1.0) {
        texColor = texture2D(uProjectorTexture, uvProjector);
    }

    if (uvProjector1.x > 0.0 && uvProjector1.x < 1.0 && uvProjector1.y > 0.0 && uvProjector1.y < 1.0 && ndc1.z > 0.0 && ndc1.z < 1.0) {
        texColor1 = texture2D(uProjectorTexture1, uvProjector1);
    }

    vec4 combinedColor = texColor + texColor1;
    gl_FragColor = combinedColor;

} 