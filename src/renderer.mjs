// Three.js setup for STL viewer and GCode viewer
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ---- Scene
export const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5)) // TODO: Use build-plate model

// ---- Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1

// ---- Renderer
const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// ---- Controls
const controls = new OrbitControls(camera, renderer.domElement)

// ---- Three.js Updating and Rendering
function on_window_resize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

function render() {
  renderer.render(scene, camera)
}

export function animate() {
  window.addEventListener('resize', on_window_resize, false)
  requestAnimationFrame(animate)
  controls.update()
  render()
}