import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import projectorVertexShader from './shaders/projector1/vertex.glsl'
import projectorFragmentShader from './shaders/projector1/fragment.glsl'
import receiverVertexShader from './shaders/receiver/vertex.glsl'
import receiverFragmentShader from './shaders/receiver/fragment.glsl'
import { Sky } from 'three/addons/objects/Sky.js'
/**
 * Base
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const ambientLight = new THREE.AmbientLight(0xffffff, 5)
scene.add(ambientLight)

const sky = new Sky()
sky.scale.setScalar(100, 100, 100)
scene.add(sky)
sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

/**
 * geometry material
 */

const receiverPlaneGeometry = new THREE.PlaneGeometry(2, 2, 2, 32, 32)
const receiverPlaneMaterial = new THREE.ShaderMaterial({
    vertexShader: receiverVertexShader,
    fragmentShader: receiverFragmentShader,
    uniforms: {
        uProjectorTexture: { value: null },
        uProjectorMatrix: { value: new THREE.Matrix4() },
        uProjectorTexture1: { value: null },
        uProjectorMatrix1: { value: new THREE.Matrix4() },
    },
})

const projectorGeometry = new THREE.PlaneGeometry(0.25, 0.25, 32, 32)
const projectorMaterial = new THREE.ShaderMaterial({
    vertexShader: projectorVertexShader,
    fragmentShader: projectorFragmentShader,
    uniforms: {
        uTime: { value: 0 },
    }
})

const count = projectorGeometry.attributes.position.count
const randoms = new Float32Array(count)

for(let i = 0; i < count; i++)
{
    randoms[i] = Math.random()
}

projectorGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

/**
 * mesh
 */
const receiver = new THREE.Mesh(receiverPlaneGeometry, receiverPlaneMaterial)
scene.add(receiver)
receiver.position.set(0, 0, -1)

const projector = new THREE.Mesh(projectorGeometry, projectorMaterial)
projector.position.set(0, 0, 1)
scene.add(projector)

const projector1 = new THREE.Mesh(projectorGeometry, projectorMaterial)
projector1.position.set(-0.75, 0.5, 1)
scene.add(projector1)

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-2, 1, 3)
scene.add(camera)

const projectorCamera = new THREE.PerspectiveCamera(5, sizes.width / sizes.height, 0.1, 4)
projectorCamera.position.set(0, 0, 1.7)
scene.add(projectorCamera)

const projectorCamera1 = new THREE.PerspectiveCamera(5, sizes.width / sizes.height, 0.1, 10)
projectorCamera1.position.set(-1, 0.5, 1.7)
projectorCamera1.rotateY(- Math.PI / 12)
scene.add(projectorCamera1)


/**
 * Camera helper
 */
const cameraHelper = new THREE.CameraHelper(projectorCamera)
scene.add(cameraHelper)

const cameraHelper1 = new THREE.CameraHelper(projectorCamera1)
scene.add(cameraHelper1)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * group
 */

const projector1Group = new THREE.Group()
projector1Group.add(projector)
projector1Group.add(projectorCamera)
projector1Group.position.set(0, 0, 0)
projector1Group.rotation.set(0, 0, 0)
scene.add(projector1Group)

const projector2Group = new THREE.Group()
projector2Group.add(projector1)
projector2Group.add(projectorCamera1)
projector2Group.position.set(0, 0, 3)
// projector2Group.rotation.set(0, 0, Math.PI / 2)
scene.add(projector2Group)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
const renderTarget1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)

/**
 * Animate
 */

const clock = new THREE.Clock()

function renderProjectorTexture(projector, projectorCamera, renderTarget) {
    renderer.setRenderTarget(renderTarget)
    renderer.render(projector, projectorCamera)
    renderer.setRenderTarget(null)
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    projectorMaterial.uniforms.uTime.value = elapsedTime

    renderProjectorTexture(projector, projectorCamera, renderTarget)
    renderProjectorTexture(projector1, projectorCamera1, renderTarget1)

    const projectorMatrix = new THREE.Matrix4()
        .multiply(projectorCamera.projectionMatrix)
        .multiply(projectorCamera.matrixWorldInverse)
        .multiply(receiver.matrixWorld)

    const projectorMatrix1 = new THREE.Matrix4()
        .multiply(projectorCamera1.projectionMatrix)
        .multiply(projectorCamera1.matrixWorldInverse)
        .multiply(receiver.matrixWorld)

    receiverPlaneMaterial.uniforms.uProjectorMatrix.value = projectorMatrix
    receiverPlaneMaterial.uniforms.uProjectorTexture.value = renderTarget.texture

    receiverPlaneMaterial.uniforms.uProjectorMatrix1.value = projectorMatrix1
    receiverPlaneMaterial.uniforms.uProjectorTexture1.value = renderTarget1.texture

    renderer.setRenderTarget(null)
    renderer.render(scene, camera)

    // Call tick again on the next frame
    controls.update()
    window.requestAnimationFrame(tick)
}

tick()