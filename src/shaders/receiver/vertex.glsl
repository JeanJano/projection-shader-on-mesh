varying vec2 vUv;
varying vec4 vWorldPosition;

void main()
{
    vWorldPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * vWorldPosition;
    vUv = uv;
}