uniform sampler2D uProjectorTexture;

varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(uProjectorTexture, vUv);
    gl_FragColor = texColor;
} 