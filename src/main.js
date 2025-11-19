import './style.css'
import * as THREE from 'three'

const app = document.querySelector('#app')

app.innerHTML = `
  <canvas id="farm-canvas"></canvas>
  <section class="hud">
    <div class="hud__header">
      <h1>Granjita interactiva</h1>
      <p class="status" data-status>Camina con WASD o las flechas para explorar la granja.</p>
    </div>
    <p data-tip>Haz clic en un caballo o una vaca para montarlos. Espacio acelera y Esc desmonta.</p>
    <ul class="actions">
      <li><strong>W / ↑</strong> Avanza</li>
      <li><strong>S / ↓</strong> Retrocede suave</li>
      <li><strong>A / ←</strong> Gira a la izquierda</li>
      <li><strong>D / →</strong> Gira a la derecha</li>
      <li><strong>Espacio</strong> Correr / galopar</li>
      <li><strong>Esc</strong> Desmontar</li>
    </ul>
  </section>
`

const canvas = document.getElementById('farm-canvas')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb)
scene.fog = new THREE.Fog(0x87ceeb, 45, 160)

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  400
)
camera.position.set(25, 18, 25)

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x2f7a0b, 0.85)
scene.add(hemiLight)

const sun = new THREE.DirectionalLight(0xfff4c1, 1.1)
sun.position.set(35, 50, 20)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.left = -60
sun.shadow.camera.right = 60
sun.shadow.camera.top = 60
sun.shadow.camera.bottom = -60
scene.add(sun)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x6ab04c })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

const dirtPath = new THREE.Mesh(
  new THREE.BoxGeometry(60, 0.2, 6),
  new THREE.MeshStandardMaterial({ color: 0xc49b63 })
)
dirtPath.position.set(0, 0.05, 0)
dirtPath.receiveShadow = true
scene.add(dirtPath)

const addField = (x, z, color) => {
  const field = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.4, 16),
    new THREE.MeshStandardMaterial({ color })
  )
  field.position.set(x, 0.2, z)
  field.receiveShadow = true
  scene.add(field)
}

addField(-18, -18, 0xa66a2c)
addField(-5, -18, 0xc97c38)
addField(8, -18, 0xa66a2c)

const addTree = (x, z) => {
  const tree = new THREE.Group()

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.8, 4, 12),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  )
  trunk.position.y = 2
  trunk.castShadow = true
  trunk.receiveShadow = true

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x2e7d32 })
  )
  leaves.position.y = 4.3
  leaves.castShadow = true

  tree.add(trunk)
  tree.add(leaves)
  tree.position.set(x, 0, z)
  scene.add(tree)
}

;[
  [-25, 10],
  [-30, -5],
  [30, 5],
  [22, -12],
  [28, -25],
  [-15, 25]
].forEach(([x, z]) => addTree(x, z))

const createFence = (size = 40) => {
  const fenceGroup = new THREE.Group()
  const postGeometry = new THREE.BoxGeometry(0.4, 2.8, 0.4)
  const railGeometry = new THREE.BoxGeometry(size * 2, 0.25, 0.25)
  const material = new THREE.MeshStandardMaterial({ color: 0xe1c699 })

  for (let i = -size; i <= size; i += 4) {
    const postFront = new THREE.Mesh(postGeometry, material)
    postFront.position.set(i, 1.4, size)
    postFront.castShadow = true
    fenceGroup.add(postFront)

    const postBack = postFront.clone()
    postBack.position.z = -size
    fenceGroup.add(postBack)

    if (i === -size || i === size) {
      const postLeft = postFront.clone()
      postLeft.position.set(size, 1.4, i)
      fenceGroup.add(postLeft)

      const postRight = postFront.clone()
      postRight.position.set(-size, 1.4, i)
      fenceGroup.add(postRight)
    }
  }

  const frontRail = new THREE.Mesh(railGeometry, material)
  frontRail.position.set(0, 2.1, size)
  frontRail.castShadow = true
  fenceGroup.add(frontRail)

  const backRail = frontRail.clone()
  backRail.position.z = -size
  fenceGroup.add(backRail)

  const sideRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.25, size * 2),
    material
  )
  sideRail.position.set(size, 2.1, 0)
  sideRail.castShadow = true
  fenceGroup.add(sideRail)

  const sideRailOpp = sideRail.clone()
  sideRailOpp.position.x = -size
  fenceGroup.add(sideRailOpp)

  scene.add(fenceGroup)
}

createFence(32)

const createAnimal = ({ bodyColor, accentColor, scale }) => {
  const group = new THREE.Group()
  const matBody = new THREE.MeshStandardMaterial({ color: bodyColor })
  const matAccent = new THREE.MeshStandardMaterial({
    color: accentColor ?? bodyColor
  })

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1, 1).scale(scale, scale, scale),
    matBody
  )
  body.position.y = 0.9 * scale
  body.castShadow = true
  group.add(body)

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 0.8).scale(scale, scale, scale),
    matBody
  )
  head.position.set(1.2 * scale, 1.3 * scale, 0)
  head.castShadow = true
  group.add(head)

  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.5).scale(scale, scale, scale),
    matAccent
  )
  snout.position.set(1.55 * scale, 1.1 * scale, 0)
  snout.castShadow = true
  group.add(snout)

  const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3).scale(
    scale,
    scale,
    scale
  )
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2f1b })
  const legOffsets = [
    [-0.6, 0, -0.3],
    [0.6, 0, -0.3],
    [-0.6, 0, 0.3],
    [0.6, 0, 0.3]
  ]

  legOffsets.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set(x * scale, 0.4 * scale, z * scale)
    leg.castShadow = true
    group.add(leg)
  })

  return group
}

const animals = [
  { bodyColor: 0xffffff, accentColor: 0xffc0cb, scale: 1, position: [-10, -6] },
  { bodyColor: 0xf8a5c2, accentColor: 0xffd1dc, scale: 0.9, position: [-6, -9] },
  { bodyColor: 0xf9f7cf, accentColor: 0xf6e58d, scale: 0.6, position: [4, -5] },
  { bodyColor: 0xc7ecee, accentColor: 0x95afc0, scale: 0.85, position: [7, -8] }
]

animals.forEach((config) => {
  const animal = createAnimal(config)
  animal.position.set(config.position[0], 0, config.position[1])
  scene.add(animal)
})

const createHorse = () => {
  const group = new THREE.Group()
  const coat = new THREE.MeshStandardMaterial({ color: 0x8d5524 })
  const maneMat = new THREE.MeshStandardMaterial({ color: 0x2f1b0c })
  const saddleMat = new THREE.MeshStandardMaterial({ color: 0x3c3b3d })

  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 0.9), coat)
  body.position.y = 1.7
  body.castShadow = true
  group.add(body)

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.7), coat)
  neck.position.set(1.7, 2.2, 0)
  neck.rotation.z = -0.2
  neck.castShadow = true
  group.add(neck)

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.6), coat)
  head.position.set(2.4, 2.5, 0)
  head.castShadow = true
  group.add(head)

  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.5), saddleMat)
  muzzle.position.set(2.8, 2.3, 0)
  muzzle.castShadow = true
  group.add(muzzle)

  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.8), maneMat)
  mane.position.set(1.1, 2.5, 0)
  mane.castShadow = true
  group.add(mane)

  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.4, 2, 8),
    maneMat
  )
  tail.position.set(-1.5, 1.4, 0)
  tail.rotation.x = Math.PI / 10
  tail.castShadow = true
  group.add(tail)

  const saddle = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 0.9), saddleMat)
  saddle.position.set(0.2, 2.4, 0)
  saddle.castShadow = true
  group.add(saddle)

  const stirrupGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 12)
  const stirrupMat = new THREE.MeshStandardMaterial({ color: 0xdfe4ea })
  const stirrupL = new THREE.Mesh(stirrupGeo, stirrupMat)
  stirrupL.rotation.x = Math.PI / 2
  stirrupL.position.set(0.4, 1.7, 0.55)
  group.add(stirrupL)
  const stirrupR = stirrupL.clone()
  stirrupR.position.z = -0.55
  group.add(stirrupR)

  const legGeometry = new THREE.BoxGeometry(0.35, 1.6, 0.35)
  const legPositions = [
    [1, 0.8, 0.3],
    [-0.8, 0.8, 0.3],
    [1, 0.8, -0.3],
    [-0.8, 0.8, -0.3]
  ]

  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, coat)
    leg.position.set(x, y, z)
    leg.castShadow = true
    group.add(leg)
  })

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = child.receiveShadow ?? false
    }
  })

  return group
}

const createCow = () => {
  const group = new THREE.Group()
  const coatMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const spotMat = new THREE.MeshStandardMaterial({ color: 0x2d3436 })
  const snoutMat = new THREE.MeshStandardMaterial({ color: 0xffc4c4 })
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xe1d5c8 })

  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.4, 1.6), coatMat)
  body.position.y = 1.4
  body.castShadow = true
  group.add(body)

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1), coatMat)
  head.position.set(1.9, 2, 0)
  head.castShadow = true
  group.add(head)

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.7), snoutMat)
  snout.position.set(2.4, 1.7, 0)
  snout.castShadow = true
  group.add(snout)

  const hornGeometry = new THREE.CylinderGeometry(0.07, 0.12, 0.5, 8)
  const hornLeft = new THREE.Mesh(hornGeometry, hornMat)
  hornLeft.position.set(2.05, 2.3, 0.35)
  hornLeft.rotation.z = Math.PI / 2.5
  group.add(hornLeft)
  const hornRight = hornLeft.clone()
  hornRight.position.z = -0.35
  hornRight.rotation.z = -Math.PI / 2.5
  group.add(hornRight)

  const ear = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.6), spotMat)
  ear.position.set(1.7, 2.1, 0.6)
  group.add(ear)
  const earOpp = ear.clone()
  earOpp.position.z = -0.6
  group.add(earOpp)

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 1.4, 6), spotMat)
  tail.position.set(-1.6, 1.4, 0)
  tail.rotation.x = Math.PI / 1.8
  tail.castShadow = true
  group.add(tail)

  const legGeometry = new THREE.BoxGeometry(0.45, 1.2, 0.45)
  const legPositions = [
    [1, 0.6, 0.6],
    [-1, 0.6, 0.6],
    [1, 0.6, -0.6],
    [-1, 0.6, -0.6]
  ]
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, coatMat)
    leg.position.set(x, y, z)
    leg.castShadow = true
    group.add(leg)

    const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.5), spotMat)
    hoof.position.set(x, 0.2, z)
    hoof.castShadow = true
    group.add(hoof)
  })

  const spotFront = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.2), spotMat)
  spotFront.position.set(-0.4, 1.7, 0.8)
  group.add(spotFront)
  const spotBack = spotFront.clone()
  spotBack.position.set(0.6, 1.4, -0.8)
  group.add(spotBack)

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = child.receiveShadow ?? false
    }
  })

  return group
}

const createFarmer = () => {
  const farmer = new THREE.Group()
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x273c75 })
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 })
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b })
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd8c2 })
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xc27c2c })

  const legGeometry = new THREE.BoxGeometry(0.5, 1.2, 0.5)
  const leftLeg = new THREE.Mesh(legGeometry, pantsMat)
  leftLeg.position.set(-0.3, 0.6, 0)
  farmer.add(leftLeg)
  const rightLeg = leftLeg.clone()
  rightLeg.position.x = 0.3
  farmer.add(rightLeg)

  const bootGeometry = new THREE.BoxGeometry(0.55, 0.4, 0.8)
  const leftBoot = new THREE.Mesh(bootGeometry, bootMat)
  leftBoot.position.set(-0.3, 0.2, 0.15)
  farmer.add(leftBoot)
  const rightBoot = leftBoot.clone()
  rightBoot.position.x = 0.3
  farmer.add(rightBoot)

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.8), shirtMat)
  torso.position.set(0, 1.9, 0)
  farmer.add(torso)

  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.6, 0.15), pantsMat)
  strap.position.set(-0.45, 2.1, 0.45)
  strap.rotation.z = 0.2
  farmer.add(strap)
  const strapOpp = strap.clone()
  strapOpp.position.x = 0.45
  strapOpp.rotation.z = -0.2
  farmer.add(strapOpp)

  const armGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.4, 8)
  const leftArm = new THREE.Mesh(armGeometry, shirtMat)
  leftArm.position.set(-0.95, 2.1, 0)
  leftArm.rotation.z = Math.PI / 2.4
  farmer.add(leftArm)
  const rightArm = leftArm.clone()
  rightArm.position.x = 0.95
  rightArm.rotation.z = -Math.PI / 2.4
  farmer.add(rightArm)

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.8), skinMat)
  head.position.set(0, 2.9, 0)
  farmer.add(head)

  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 16), hatMat)
  hatBrim.position.set(0, 3.3, 0)
  farmer.add(hatBrim)

  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.6, 16), hatMat)
  hatTop.position.set(0, 3.6, 0)
  farmer.add(hatTop)

  farmer.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = child.receiveShadow ?? false
    }
  })

  farmer.name = 'farmer'
  return farmer
}

const statusLabel = document.querySelector('[data-status]')
const tipLabel = document.querySelector('[data-tip]')

const pressedKeys = new Set()
const clock = new THREE.Clock()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const upAxis = new THREE.Vector3(0, 1, 0)
const currentCameraOffset = new THREE.Vector3()
const currentLookOffset = new THREE.Vector3()

const movementProfiles = {
  foot: {
    baseSpeed: 5,
    boostSpeed: 8,
    turnSpeed: 3.2,
    backwardFactor: 0.6,
    limit: 32,
    cameraOffset: new THREE.Vector3(0, 4.5, 8),
    lookOffset: new THREE.Vector3(0, 2, 0),
    cameraSmooth: 0.0015,
    status:
      'Camina por la granja con WASD o las flechas. Haz clic en un caballo o vaca para montarlos.',
    tip: 'Haz clic en un caballo o una vaca para montarlos. Espacio para correr, Esc para desmontar.'
  },
  horse: {
    baseSpeed: 6.5,
    boostSpeed: 12,
    turnSpeed: 2.4,
    backwardFactor: 0.5,
    limit: 32,
    cameraOffset: new THREE.Vector3(0, 5.8, 11),
    lookOffset: new THREE.Vector3(0, 2.6, 0),
    cameraSmooth: 0.001,
    status:
      '¡Estás montando un caballo! Usa WASD o las flechas y mantén espacio para galopar.',
    tip: 'Mantén espacio para galopar rápido. Presiona Esc para bajar del caballo.'
  },
  cow: {
    baseSpeed: 4.8,
    boostSpeed: 8,
    turnSpeed: 1.7,
    backwardFactor: 0.5,
    limit: 32,
    cameraOffset: new THREE.Vector3(0, 5.2, 9.5),
    lookOffset: new THREE.Vector3(0, 2.3, 0),
    cameraSmooth: 0.0012,
    status:
      '¡Montas una vaca! WASD o las flechas para pasearla y espacio para trotar más rápido.',
    tip: 'Las vacas son tranquilas: mantén espacio para trotar. Presiona Esc para desmontar.'
  }
}

const mountables = []

const player = createFarmer()
player.position.set(-2, 0, 10)
scene.add(player)

let isMounted = false
let currentMount = null
let controlTarget = null
let activeProfile = movementProfiles.foot

const clampPosition = (vector, limit = 30) => {
  vector.x = THREE.MathUtils.clamp(vector.x, -limit, limit)
  vector.z = THREE.MathUtils.clamp(vector.z, -limit, limit)
}

const updateStatusText = () => {
  if (!statusLabel) return
  if (isMounted && currentMount) {
    const mountProfile = movementProfiles[currentMount.profileKey]
    statusLabel.textContent = mountProfile?.status ?? ''
    statusLabel.classList.add('status--mounted')
    if (tipLabel) {
      tipLabel.textContent = mountProfile?.tip ?? ''
    }
    return
  }

  statusLabel.textContent = movementProfiles.foot.status
  statusLabel.classList.remove('status--mounted')
  if (tipLabel) {
    tipLabel.textContent = movementProfiles.foot.tip
  }
}

const snapCameraToTarget = () => {
  if (!controlTarget) return
  const desiredCamera = controlTarget.position
    .clone()
    .add(currentCameraOffset.clone().applyAxisAngle(upAxis, controlTarget.rotation.y))
  camera.position.copy(desiredCamera)
  const lookTarget = controlTarget.position.clone().add(currentLookOffset)
  camera.lookAt(lookTarget)
}

const setControlTarget = (target, profile) => {
  controlTarget = target
  activeProfile = profile
  currentCameraOffset.copy(profile.cameraOffset)
  currentLookOffset.copy(profile.lookOffset)
  snapCameraToTarget()
  updateStatusText()
}

setControlTarget(player, movementProfiles.foot)

const registerMountable = (mesh, options) => {
  const config = {
    mesh,
    label: options.label ?? options.profileKey,
    profileKey: options.profileKey
  }
  mountables.push(config)
  mesh.userData.mountConfig = config
  mesh.traverse((child) => {
    if (child.isMesh) {
      child.userData.mountConfig = config
    }
  })
  return config
}

const mountEntity = (config) => {
  if (isMounted || !config) return
  const profile = movementProfiles[config.profileKey]
  if (!profile) return
  isMounted = true
  currentMount = config
  player.visible = false
  document.body.classList.add('mounted')
  setControlTarget(config.mesh, profile)
}

const dismountCurrentMount = () => {
  if (!isMounted || !currentMount) return
  const exitDirection = new THREE.Vector3(
    Math.sin(currentMount.mesh.rotation.y + Math.PI),
    0,
    Math.cos(currentMount.mesh.rotation.y + Math.PI)
  ).multiplyScalar(2)
  player.position.copy(currentMount.mesh.position).add(exitDirection)
  clampPosition(player.position, movementProfiles.foot.limit)
  player.position.y = 0
  player.rotation.y = currentMount.mesh.rotation.y
  player.visible = true
  isMounted = false
  currentMount = null
  document.body.classList.remove('mounted')
  setControlTarget(player, movementProfiles.foot)
}

const horseConfigs = [
  { position: [-4, 4], rotation: Math.PI / 8 },
  { position: [12, -2], rotation: -Math.PI / 2.5 }
]

horseConfigs.forEach(({ position, rotation }) => {
  const horse = createHorse()
  horse.position.set(position[0], 0, position[1])
  horse.rotation.y = rotation ?? 0
  scene.add(horse)
  registerMountable(horse, { label: 'caballo', profileKey: 'horse' })
})

const cowConfigs = [
  { position: [-12, 6], rotation: Math.PI / 2 },
  { position: [6, -12], rotation: Math.PI }
]

cowConfigs.forEach(({ position, rotation }) => {
  const cow = createCow()
  cow.position.set(position[0], 0, position[1])
  cow.rotation.y = rotation ?? 0
  scene.add(cow)
  registerMountable(cow, { label: 'vaca', profileKey: 'cow' })
})

const handlePointerDown = (event) => {
  if (isMounted || mountables.length === 0) return
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const meshes = mountables.map((entry) => entry.mesh)
  const intersects = raycaster.intersectObjects(meshes, true)

  if (!intersects.length) return
  const config = intersects[0].object.userData.mountConfig
  if (config) {
    mountEntity(config)
  }
}

canvas?.addEventListener('pointerdown', handlePointerDown)

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  if (key === 'escape') {
    dismountCurrentMount()
    return
  }

  const controlKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ']
  if (controlKeys.includes(key)) {
    event.preventDefault()
  }

  pressedKeys.add(key)
})

window.addEventListener('keyup', (event) => {
  pressedKeys.delete(event.key.toLowerCase())
})

const animateController = (delta) => {
  if (!controlTarget || !activeProfile) return

  const left = pressedKeys.has('a') || pressedKeys.has('arrowleft')
  const right = pressedKeys.has('d') || pressedKeys.has('arrowright')
  const forward = pressedKeys.has('w') || pressedKeys.has('arrowup')
  const backward = pressedKeys.has('s') || pressedKeys.has('arrowdown')
  const boost = pressedKeys.has(' ')

  if (left) {
    controlTarget.rotation.y += activeProfile.turnSpeed * delta
  } else if (right) {
    controlTarget.rotation.y -= activeProfile.turnSpeed * delta
  }

  let moveFactor = 0
  if (forward) moveFactor += 1
  if (backward) moveFactor -= activeProfile.backwardFactor ?? 0.5

  if (moveFactor !== 0) {
    const direction = new THREE.Vector3(
      Math.sin(controlTarget.rotation.y),
      0,
      Math.cos(controlTarget.rotation.y)
    )
    const speed = boost ? activeProfile.boostSpeed : activeProfile.baseSpeed
    direction.multiplyScalar(moveFactor * speed * delta)
    controlTarget.position.add(direction)
    clampPosition(controlTarget.position, activeProfile.limit ?? 30)
  }

  if (controlTarget === player) {
    controlTarget.position.y = 0
  }
}

const updateCamera = (delta) => {
  if (!controlTarget) return
  const desiredCamera = controlTarget.position
    .clone()
    .add(currentCameraOffset.clone().applyAxisAngle(upAxis, controlTarget.rotation.y))
  const smoothing = activeProfile?.cameraSmooth ?? 0.001
  const lerpFactor = 1 - Math.pow(smoothing, delta)
  camera.position.lerp(desiredCamera, lerpFactor)
  const lookTarget = controlTarget.position.clone().add(currentLookOffset)
  camera.lookAt(lookTarget)
}

const animate = () => {
  const delta = clock.getDelta()
  requestAnimationFrame(animate)
  animateController(delta)
  updateCamera(delta)
  renderer.render(scene, camera)
}

animate()

const handleResize = () => {
  const { innerWidth, innerHeight } = window
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
}

window.addEventListener('resize', handleResize)
