// Three.js setup for STL viewer and GCode viewer
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const viewport = document.getElementById("viewer")
const sidebar = document.getElementById("sidebar")

var bar_width = 0.3 * window.innerWidth
var view_width = window.innerWidth - bar_width
var view_height = window.innerHeight

viewport.style.width = view_width + "px"
viewport.style.height = view_height + "px"

sidebar.style.width = bar_width + "px"

// ---- Scene
export const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5)) // TODO: Use build-plate model

// ---- Camera
const camera = new THREE.PerspectiveCamera(
  75,
  view_width / view_height,
)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1

// ---- Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("stl-viewer"), alpha: true })
renderer.setClearColor(0xffffff, 0)
renderer.setSize(view_width, view_height)

// ---- Controls
const controls = new OrbitControls(camera, renderer.domElement)

// ---- Three.js Updating and Rendering
function resize() {
  view_width = window.innerWidth - bar_width
  view_height = window.innerHeight

  viewport.style.width = view_width + "px"
  viewport.style.height = view_height

  console.log(view_width, view_height)

  camera.aspect = view_width / view_height
  camera.updateProjectionMatrix()

  renderer.setSize(view_width, view_height)
  render()
}
resize()

function render() {
  renderer.render(scene, camera)
}

export function animate() {
  window.addEventListener('resize', () => {
    resize()
  })
  requestAnimationFrame(animate)
  controls.update()
  render()
}