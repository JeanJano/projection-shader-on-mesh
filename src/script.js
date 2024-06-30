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
 * mesh
 */

const receiverPlaneGeometry = new THREE.PlaneGeometry(2, 2, 32, 32)
const receiverPlaneMaterial = new THREE.ShaderMaterial({
    vertexShader: receiverVertexShader,
    fragmentShader: receiverFragmentShader,
    uniforms: {
        uProjectorTextures: { value: [] },
        uProjectorMatrices: { value: [] },
        uProjectorScales: { value: [] },
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

// Mesh
const receiver = new THREE.Mesh(receiverPlaneGeometry, receiverPlaneMaterial)
scene.add(receiver)

// const projectors = []
// const projectorsNb = 3
// for (let i = 0; i < projectorsNb; i++) {
//     const projector = new THREE.Mesh(projectorGeometry, projectorMaterial)
//     projector.position.set((i * 3 - projectorsNb) * 0.15, 0, 1)
//     projector.lookAt(receiver.position)
//     scene.add(projector)
    // projectors.push(projector)
// }
const projector = new THREE.Mesh(projectorGeometry, projectorMaterial)
projector.position.set(0, 0, 1) // Adjust position as needed
// projector.lookAt(receiver.position)
scene.add(projector)


// const renderTarget = projectors.map(() => new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)) 
const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)

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

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-2, 1, 3)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

function calculateProjectorMatrix(projector, camera) {
    const inverseCameraMatrix = new THREE.Matrix4();
    if (camera.matrixWorldInverse) {
        inverseCameraMatrix.copy(camera.matrixWorldInverse);
    } else {
        inverseCameraMatrix.invert(camera.matrixWorld);
    }

    // Step 2 & 3: Multiply the inverse camera matrix with the projector's world matrix
    const projectorMatrix = new THREE.Matrix4().multiplyMatrices(inverseCameraMatrix, projector.matrixWorld);

    // Step 4: Apply the camera's projection matrix
    projectorMatrix.multiply(camera.projectionMatrix);

    return projectorMatrix;
}

const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()

    // Update material
    // projectors.forEach((projector, index) => {
        projectorMaterial.uniforms.uTime.value = elapsedTime

        renderer.setRenderTarget(renderTarget)
        renderer.render(projector, camera)
    // })
    // Update controls
    controls.update()

    // const projectorTextures = renderTarget.map(rt => rt.texture)
    // const projectorMatrices = projectors.map(projector => calculateProjectorMatrix(projector, camera))
    // const projectorScales = projectors.map(projector => new THREE.Vector2(
    //     projector.geometry.parameters.width / receiver.geometry.parameters.width,
    //     projector.geometry.parameters.height / receiver.geometry.parameters.height
    // ))

    // receiverPlaneMaterial.uniforms.uProjectorTextures.value = projectorTextures
    // receiverPlaneMaterial.uniforms.uProjectorMatrices.value = projectorMatrices
    // receiverPlaneMaterial.uniforms.uProjectorScales.value = projectorScales


    // Prepare uniforms for the receiver shader
    const projectorTexture = renderTarget.texture
    const projectorMatrix = calculateProjectorMatrix(projector, camera)
    const projectorScale = new THREE.Vector2(
        projector.geometry.parameters.width / receiver.geometry.parameters.width,
        projector.geometry.parameters.height / receiver.geometry.parameters.height
    )

    receiverPlaneMaterial.uniforms.uProjectorTextures.value = [projectorTexture]
    receiverPlaneMaterial.uniforms.uProjectorMatrices.value = [projectorMatrix]
    receiverPlaneMaterial.uniforms.uProjectorScales.value = [projectorScale]


    renderer.setRenderTarget(null)
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()