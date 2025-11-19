import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const previousCanvas = document.getElementById('farm-view')
if (previousCanvas) {
  previousCanvas.remove()
}

const canvas = document.createElement('canvas')
canvas.id = 'farm-view'
const firstChild = document.body.firstChild
if (firstChild) {
  document.body.insertBefore(canvas, firstChild)
} else {
  document.body.appendChild(canvas)
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xbfe0ff)
scene.fog = new THREE.Fog(0xbfe0ff, 90, 260)

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  500
)
const defaultCameraPosition = new THREE.Vector3(40, 28, 42)
const defaultTarget = new THREE.Vector3(0, 4, 0)
camera.position.copy(defaultCameraPosition)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.copy(defaultTarget)
controls.maxPolarAngle = Math.PI / 2.05
controls.minDistance = 15
controls.maxDistance = 120

renderer.domElement.addEventListener('dblclick', () => {
  camera.position.copy(defaultCameraPosition)
  controls.target.copy(defaultTarget)
})

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x4f6f2f, 0.95)
scene.add(hemiLight)

const sun = new THREE.DirectionalLight(0xfff5d6, 1.15)
sun.position.set(55, 70, 35)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.left = -120
sun.shadow.camera.right = 120
sun.shadow.camera.top = 120
sun.shadow.camera.bottom = -120
sun.shadow.camera.near = 10
sun.shadow.camera.far = 200
scene.add(sun)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(280, 280),
  new THREE.MeshStandardMaterial({ color: 0x7fb069 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

const road = new THREE.Mesh(
  new THREE.BoxGeometry(120, 0.3, 12),
  new THREE.MeshStandardMaterial({ color: 0xc49b63 })
)
road.position.y = 0.15
road.receiveShadow = true
scene.add(road)

const createField = (x, z, w, d, color = 0xa36a2d) => {
  const field = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.4, d),
    new THREE.MeshStandardMaterial({ color })
  )
  field.position.set(x, 0.2, z)
  field.receiveShadow = true
  scene.add(field)
}

createField(-35, -25, 26, 16, 0x9b6a33)
createField(-5, -28, 30, 14, 0xb17946)
createField(30, -22, 26, 18, 0xa5693f)

const createFenceRect = (width, depth, position) => {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({ color: 0xd8c49c })
  const postGeometry = new THREE.BoxGeometry(0.35, 2.2, 0.35)

  const addPost = (x, z) => {
    const post = new THREE.Mesh(postGeometry, material)
    post.position.set(x, 1.1, z)
    post.castShadow = true
    group.add(post)
  }

  for (let x = -width / 2; x <= width / 2; x += 4) {
    addPost(x, depth / 2)
    addPost(x, -depth / 2)
  }

  for (let z = -depth / 2; z <= depth / 2; z += 4) {
    addPost(width / 2, z)
    addPost(-width / 2, z)
  }

  const heights = [0.9, 1.5]
  heights.forEach((height) => {
    const railX = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.8, 0.2, 0.2),
      material
    )
    railX.position.set(0, height, depth / 2)
    railX.castShadow = true
    group.add(railX)

    const railXBack = railX.clone()
    railXBack.position.z = -depth / 2
    group.add(railXBack)

    const railZ = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, depth + 0.8),
      material
    )
    railZ.position.set(-width / 2, height, 0)
    railZ.castShadow = true
    group.add(railZ)

    const railZOpp = railZ.clone()
    railZOpp.position.x = width / 2
    group.add(railZOpp)
  })

  group.position.set(position.x, 0, position.z)
  scene.add(group)
}

const createTree = (x, z, scale = 1) => {
  const tree = new THREE.Group()
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5 * scale, 0.7 * scale, 5 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  )
  trunk.position.y = 2.5 * scale
  trunk.castShadow = true
  trunk.receiveShadow = true
  tree.add(trunk)

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.2 * scale, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x2f7d32 })
  )
  leaves.position.y = 5 * scale
  leaves.castShadow = true
  tree.add(leaves)

  tree.position.set(x, 0, z)
  scene.add(tree)
}

;[
  [-50, 10, 1.2],
  [-45, -5, 0.9],
  [55, 12, 1.1],
  [42, -18, 0.8],
  [20, 30, 1.3],
  [-10, 32, 1],
  [10, -35, 1.2],
  [-32, 28, 0.9]
].forEach(([x, z, scale]) => createTree(x, z, scale))

const createBarn = () => {
  const barn = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(12, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0xc14953 })
  )
  body.position.y = 3
  barn.add(body)

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(8, 4, 4),
    new THREE.MeshStandardMaterial({ color: 0x8d3c3c })
  )
  roof.rotation.y = Math.PI / 4
  roof.position.y = 7
  barn.add(roof)

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3.5, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xf1ead2 })
  )
  door.position.set(0, 1.75, 4.15)
  barn.add(door)

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(12.2, 0.3, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  trim.position.set(0, 4.5, 4.1)
  barn.add(trim)

  barn.position.set(18, 0, 15)
  barn.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(barn)
}

const createCoop = () => {
  const coop = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 3),
    new THREE.MeshStandardMaterial({ color: 0xe0a458 })
  )
  base.position.y = 1.3
  coop.add(base)

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.2, 1.8, 4),
    new THREE.MeshStandardMaterial({ color: 0xa04914 })
  )
  roof.rotation.y = Math.PI / 4
  roof.position.y = 2.8
  coop.add(roof)

  const ramp = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.15, 3),
    new THREE.MeshStandardMaterial({ color: 0x8c6c3a })
  )
  ramp.rotation.x = -Math.PI / 5
  ramp.position.set(2.1, 0.5, 0)
  coop.add(ramp)

  coop.position.set(20, 0, -6)
  coop.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(coop)
}

const createHayBale = (x, z, rotation = 0) => {
  const bale = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 3, 16),
    new THREE.MeshStandardMaterial({ color: 0xe3c567 })
  )
  bale.rotation.z = Math.PI / 2
  bale.rotation.y = rotation
  bale.position.set(x, 1.1, z)
  bale.castShadow = true
  bale.receiveShadow = true
  scene.add(bale)
}

const createWaterTrough = (x, z) => {
  const trough = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.6, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x8b6a4f })
  )
  base.position.y = 0.3
  trough.add(base)

  const water = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.2, 0.8),
    new THREE.MeshStandardMaterial({
      color: 0x5dade2,
      metalness: 0.1,
      roughness: 0.4
    })
  )
  water.position.y = 0.55
  trough.add(water)

  trough.position.set(x, 0, z)
  trough.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(trough)
}

createBarn()
createCoop()
createFenceRect(24, 18, { x: -22, z: -12 })
createFenceRect(22, 16, { x: -18, z: 12 })
createFenceRect(26, 20, { x: 2, z: 8 })
createFenceRect(18, 14, { x: 20, z: -10 })
createHayBale(-5, 6, 0.3)
createHayBale(-8, 4, 1)
createHayBale(5, 14, 0.6)
createWaterTrough(-18, -4)
createWaterTrough(6, 5)

const idleAnimations = []
const registerIdle = (object, amplitude = 0.1, speed = 1.2) => {
  idleAnimations.push({
    object,
    amplitude,
    speed,
    phase: Math.random() * Math.PI * 2,
    baseY: object.position.y
  })
}

const createChicken = () => {
  const group = new THREE.Group()
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xf4a259 })
  const combMat = new THREE.MeshStandardMaterial({ color: 0xd94141 })
  const legMat = new THREE.MeshStandardMaterial({ color: 0xd6893d })

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), white)
  body.position.y = 0.45
  group.add(body)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), white)
  head.position.set(0.35, 0.75, 0)
  group.add(head)

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), beakMat)
  beak.rotation.x = Math.PI / 2
  beak.position.set(0.55, 0.68, 0)
  group.add(beak)

  const comb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), combMat)
  comb.position.set(0.32, 0.92, 0)
  group.add(comb)

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 6), white)
  tail.rotation.z = Math.PI / 2
  tail.position.set(-0.35, 0.6, 0)
  group.add(tail)

  const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6)
  ;[-0.08, 0.08].forEach((offset) => {
    const leg = new THREE.Mesh(legGeometry, legMat)
    leg.position.set(0.05, 0.15, offset)
    group.add(leg)
  })

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return group
}

const createHorse = () => {
  const group = new THREE.Group()
  const coat = new THREE.MeshStandardMaterial({ color: 0x8d5524 })
  const maneMat = new THREE.MeshStandardMaterial({ color: 0x2f1b0c })
  const accent = new THREE.MeshStandardMaterial({ color: 0x3c3b3d })

  const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 1.2), coat)
  body.position.y = 1.8
  group.add(body)

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.8), coat)
  neck.position.set(1.8, 2.6, 0)
  neck.rotation.z = -0.2
  group.add(neck)

  const head = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 0.7), coat)
  head.position.set(2.6, 3.1, 0)
  group.add(head)

  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.6), accent)
  muzzle.position.set(3.1, 2.9, 0)
  group.add(muzzle)

  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.9), maneMat)
  mane.position.set(1.2, 3.2, 0)
  group.add(mane)

  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.35, 2.4, 8),
    maneMat
  )
  tail.position.set(-1.8, 2, 0)
  tail.rotation.x = Math.PI / 8
  group.add(tail)

  const legGeometry = new THREE.BoxGeometry(0.35, 1.8, 0.35)
  const legPositions = [
    [1.4, 0.9, 0.4],
    [-0.8, 0.9, 0.4],
    [1.4, 0.9, -0.4],
    [-0.8, 0.9, -0.4]
  ]
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, coat)
    leg.position.set(x, y, z)
    group.add(leg)
  })

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return group
}

const createGoat = () => {
  const group = new THREE.Group()
  const coat = new THREE.MeshStandardMaterial({ color: 0xd8c7a0 })
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xb69974 })
  const accent = new THREE.MeshStandardMaterial({ color: 0x8c5c3b })

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.4, 1.1), coat)
  body.position.y = 1.4
  group.add(body)

  const head = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 0.8), coat)
  head.position.set(1.6, 1.9, 0)
  group.add(head)

  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 6), accent)
  beard.position.set(2, 1.4, 0)
  group.add(beard)

  const horns = [
    new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 8), hornMat),
    new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 8), hornMat)
  ]
  horns[0].rotation.z = -Math.PI / 3
  horns[1].rotation.z = Math.PI / 3
  horns[0].position.set(1.4, 2.4, 0.3)
  horns[1].position.set(1.4, 2.4, -0.3)
  horns.forEach((horn) => group.add(horn))

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 6), accent)
  tail.position.set(-1.5, 1.8, 0)
  tail.rotation.z = Math.PI / 3
  group.add(tail)

  const legGeometry = new THREE.BoxGeometry(0.25, 1.2, 0.25)
  const legPositions = [
    [0.9, 0.5, 0.4],
    [-0.7, 0.5, 0.4],
    [0.9, 0.5, -0.4],
    [-0.7, 0.5, -0.4]
  ]
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, accent)
    leg.position.set(x, y, z)
    group.add(leg)
  })

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return group
}

const createCow = () => {
  const group = new THREE.Group()
  const white = new THREE.MeshStandardMaterial({ color: 0xfefefe })
  const spotsMat = new THREE.MeshStandardMaterial({ color: 0x2f2f2f })
  const snoutMat = new THREE.MeshStandardMaterial({ color: 0xf8b195 })
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xd8c6a4 })

  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.2, 1.8), white)
  body.position.y = 1.8
  group.add(body)

  const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.2), white)
  head.position.set(2.7, 2.2, 0)
  group.add(head)

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1), snoutMat)
  snout.position.set(3.4, 1.9, 0)
  group.add(snout)

  const horns = [
    new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 8), hornMat),
    new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 8), hornMat)
  ]
  horns[0].position.set(2.4, 2.7, 0.5)
  horns[0].rotation.z = -Math.PI / 12
  horns[1].position.set(2.4, 2.7, -0.5)
  horns[1].rotation.z = Math.PI / 12
  horns.forEach((horn) => group.add(horn))

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2, 8), white)
  tail.position.set(-2.2, 2.2, 0)
  tail.rotation.x = Math.PI / 8
  group.add(tail)

  const legGeometry = new THREE.BoxGeometry(0.4, 1.8, 0.4)
  const legPositions = [
    [1.6, 0.9, 0.6],
    [-1.6, 0.9, 0.6],
    [1.6, 0.9, -0.6],
    [-1.6, 0.9, -0.6]
  ]
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, spotsMat)
    leg.position.set(x, y, z)
    group.add(leg)
  })

  const spotGeometry = new THREE.BoxGeometry(0.9, 1, 0.2)
  const spot1 = new THREE.Mesh(spotGeometry, spotsMat)
  spot1.position.set(-0.8, 2, 1)
  group.add(spot1)

  const spot2 = new THREE.Mesh(spotGeometry, spotsMat)
  spot2.position.set(0.8, 1.6, -1)
  group.add(spot2)

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return group
}

const placeAnimal = (createFn, position, options = {}) => {
  const animal = createFn()
  animal.position.set(position.x, position.y ?? 0, position.z)
  if (options.rotation !== undefined) {
    animal.rotation.y = options.rotation
  } else {
    animal.rotation.y = Math.random() * Math.PI * 2
  }
  scene.add(animal)
  registerIdle(
    animal,
    options.amplitude ?? 0.1,
    options.speed ?? 1.2 + Math.random() * 0.5
  )
}

const chickenPositions = [
  { x: 18, z: -8 },
  { x: 21, z: -9 },
  { x: 19, z: -12 },
  { x: 22, z: -6 },
  { x: 17, z: -10 }
]
chickenPositions.forEach((pos) =>
  placeAnimal(createChicken, pos, { amplitude: 0.05, speed: 2 })
)

const horsePositions = [
  { x: 0, z: 8, rotation: Math.PI / 4 },
  { x: 5, z: 10, rotation: -Math.PI / 6 }
]
horsePositions.forEach((pos) =>
  placeAnimal(createHorse, pos, {
    amplitude: 0.12,
    speed: 1,
    rotation: pos.rotation
  })
)

const goatPositions = [
  { x: -18, z: 10 },
  { x: -15, z: 14 },
  { x: -21, z: 15 }
]
goatPositions.forEach((pos) =>
  placeAnimal(createGoat, pos, { amplitude: 0.08, speed: 1.6 })
)

const cowPositions = [
  { x: -25, z: -10 },
  { x: -20, z: -14 },
  { x: -18, z: -8 }
]
cowPositions.forEach((pos) =>
  placeAnimal(createCow, pos, { amplitude: 0.07, speed: 1.1 })
)

const clock = new THREE.Clock()

const animate = () => {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  idleAnimations.forEach((entry) => {
    entry.phase += delta * entry.speed
    entry.object.position.y = entry.baseY + Math.sin(entry.phase) * entry.amplitude
  })
  controls.update()
  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})
