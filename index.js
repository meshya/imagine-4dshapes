(
    async ()=>{

function generateTesseract(size = 1) {
  const vertices = [];
  for (let x of [-1, 1])
    for (let y of [-1, 1])
      for (let z of [-1, 1])
        for (let w of [-1, 1])
          vertices.push({ x: x * size, y: y * size, z: z * size, w: w * size });
  return { vertices, edges: generateEdgesHamming(vertices, 1) };
}

function generatePyramid5Cell(size = 1.5) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const s = size;
  const vertices = [
    { x: s, y: s, z: s, w: -1/Math.sqrt(5) * s },
    { x: s, y: -s, z: -s, w: -1/Math.sqrt(5) * s },
    { x: -s, y: s, z: -s, w: -1/Math.sqrt(5) * s },
    { x: -s, y: -s, z: s, w: -1/Math.sqrt(5) * s },
    { x: 0, y: 0, z: 0, w: Math.sqrt(5) * s - 1/Math.sqrt(5) * s }
  ];
  const edges = [];
  for (let i = 0; i < 5; i++)
    for (let j = i + 1; j < 5; j++)
      edges.push([i, j]);
  return { vertices, edges };
}

function generate16Cell(size = 1.5) {
  const s = size;
  const vertices = [
    { x: s, y: 0, z: 0, w: 0 },
    { x: -s, y: 0, z: 0, w: 0 },
    { x: 0, y: s, z: 0, w: 0 },
    { x: 0, y: -s, z: 0, w: 0 },
    { x: 0, y: 0, z: s, w: 0 },
    { x: 0, y: 0, z: -s, w: 0 },
    { x: 0, y: 0, z: 0, w: s },
    { x: 0, y: 0, z: 0, w: -s }
  ];
  const edges = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (Math.floor(i / 2) !== Math.floor(j / 2)) {
        edges.push([i, j]);
      }
    }
  }
  return { vertices, edges };
}

function generate24Cell(size = 1) {
  const s = size;
  const vertices = [];
  
  for (let i = 0; i < 4; i++) {
    for (let sign of [-1, 1]) {
      const v = { x: 0, y: 0, z: 0, w: 0 };
      ['x', 'y', 'z', 'w'][i] = sign * s;
      const coords = [0, 0, 0, 0];
      coords[i] = sign * s;
      vertices.push({ x: coords[0], y: coords[1], z: coords[2], w: coords[3] });
    }
  }
  
  const pairs = [[0,1], [0,2], [0,3], [1,2], [1,3], [2,3]];
  for (const [a, b] of pairs) {
    for (let sa of [-1, 1]) {
      for (let sb of [-1, 1]) {
        const coords = [0, 0, 0, 0];
        coords[a] = sa * s;
        coords[b] = sb * s;
        vertices.push({ x: coords[0], y: coords[1], z: coords[2], w: coords[3] });
      }
    }
  }
  
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dist2 = distSquared4D(vertices[i], vertices[j]);
      if (Math.abs(dist2 - 2 * s * s) < 0.01) {
        edges.push([i, j]);
      }
    }
  }
  return { vertices, edges };
}

function distSquared4D(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 + (a.w - b.w) ** 2;
}

function generateEdgesHamming(vertices, hammingDist) {
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const a = vertices[i], b = vertices[j];
      let diff = 0;
      if (a.x !== b.x) diff++;
      if (a.y !== b.y) diff++;
      if (a.z !== b.z) diff++;
      if (a.w !== b.w) diff++;
      if (diff === hammingDist) edges.push([i, j]);
    }
  }
  return edges;
}

function rotate4D(v, angle, planeA, planeB) {
  const coords = [v.x, v.y, v.z, v.w];
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const A = coords[planeA], B = coords[planeB];
  coords[planeA] = A * ca - B * sa;
  coords[planeB] = A * sa + B * ca;
  return { x: coords[0], y: coords[1], z: coords[2], w: coords[3] };
}

function project4Dto3D(v, distance = 3) {
  const wFactor = distance / (distance - v.w);
  return {
    x: v.x * wFactor,
    y: v.y * wFactor,
    z: v.z * wFactor
  };
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const shapeColors = {
  tesseract: 0x00ccff,
  pyramid: 0xff6600,
  octahedron: 0x00ff88,
  '24cell': 0xff00ff
};

let currentShape = 'tesseract';
let shapeData = generateTesseract();
let lines = [];
let material = new THREE.LineBasicMaterial({ color: shapeColors[currentShape] });

const shapeGroup = new THREE.Group();
scene.add(shapeGroup);

const rotationAngles = { xy: 0, xz: 0, xw: 0, yw: 0, zw: 0 };
const rotationSpeed = { xy: 0, xz: 0, xw: 0, yw: 0, zw: 0 };
let autoRotate = true;

const keys = {};

function createLines() {
  lines.forEach(l => shapeGroup.remove(l));
  lines = [];
  
  material = new THREE.LineBasicMaterial({ color: shapeColors[currentShape] });
  
  shapeData.edges.forEach(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(), new THREE.Vector3()
    ]);
    const line = new THREE.Line(geometry, material);
    lines.push(line);
    shapeGroup.add(line);
  });
}

function loadShape(shapeName) {
  currentShape = shapeName;
  switch (shapeName) {
    case 'tesseract':
      shapeData = generateTesseract();
      break;
    case 'pyramid':
      shapeData = generatePyramid5Cell();
      break;
    case 'octahedron':
      shapeData = generate16Cell();
      break;
    case '24cell':
      shapeData = generate24Cell();
      break;
  }
  createLines();
  
  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.shape === shapeName);
  });
}

createLines();


document.querySelectorAll('.shape-btn').forEach(btn => {
  btn.addEventListener('click', () => loadShape(btn.dataset.shape));
});

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') {
    autoRotate = !autoRotate;
    e.preventDefault();
  }
});

window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  
  const rotSpeed = 0.03;
  
  if (keys['q']) rotationAngles.xy -= rotSpeed;
  if (keys['e']) rotationAngles.xy += rotSpeed;
  if (keys['a']) rotationAngles.xz -= rotSpeed;
  if (keys['d']) rotationAngles.xz += rotSpeed;
  if (keys['w']) rotationAngles.xw -= rotSpeed;
  if (keys['s']) rotationAngles.xw += rotSpeed;
  if (keys['z']) rotationAngles.yw -= rotSpeed;
  if (keys['c']) rotationAngles.yw += rotSpeed;
  if (keys['r']) rotationAngles.zw -= rotSpeed;
  if (keys['f']) rotationAngles.zw += rotSpeed;
  
  if (autoRotate) {
    rotationAngles.xy += 0.005;
    rotationAngles.xw += 0.007;
    rotationAngles.zw += 0.003;
  }
  
  const projected = shapeData.vertices.map(v => {
    let r = { ...v };
    r = rotate4D(r, rotationAngles.xy, 0, 1); // XY
    r = rotate4D(r, rotationAngles.xz, 0, 2); // XZ
    r = rotate4D(r, rotationAngles.xw, 0, 3); // XW
    r = rotate4D(r, rotationAngles.yw, 1, 3); // YW
    r = rotate4D(r, rotationAngles.zw, 2, 3); // ZW
    return project4Dto3D(r);
  });
  
  shapeData.edges.forEach((edge, i) => {
    if (lines[i]) {
      const a = projected[edge[0]];
      const b = projected[edge[1]];
      const pos = lines[i].geometry.attributes.position;
      pos.setXYZ(0, a.x, a.y, a.z);
      pos.setXYZ(1, b.x, b.y, b.z);
      pos.needsUpdate = true;
    }
  });
  
  renderer.render(scene, camera);
}

animate();

    }
)()
