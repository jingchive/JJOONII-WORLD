// 미니 구: 메인 페이지의 ‘부유하는 프로젝트 구’를 20% 스케일로 재현
const canvas = document.getElementById('mini-sphere');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);

// 고정 크기 캔버스 렌더러
function setRendererSize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
}
setRendererSize();

// 씬/카메라/컨트롤
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(0, 0, 28);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;

// 조명
scene.add(new THREE.AmbientLight(0xffffff, 1.2));

// 프로젝트 텍스처(메인과 동일 소스 사용)
const projects = [
  { img: "./projectimages/ArchitenWeb.jpg" },
  { img: "./projectimages/Architen-Shift+1Web.jpg" },
  { img: "./projectimages/coilhaus.jpg" },
  { img: "./projectimages/hhhh.jpg" },
  { img: "./projectimages/let's-siso.jpg" }
];

// 구 표면에 배치
const group = new THREE.Group();
scene.add(group);

const loader = new THREE.TextureLoader();
const geometry = new THREE.PlaneGeometry(3, 4);
const radius = 10;
const count = projects.length;

projects.forEach((p, i) => {
  const tex = loader.load(p.img, (t) => {
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
  });
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, mat);

  const phi = Math.acos(-1 + (2 * i) / count);
  const theta = Math.sqrt(count * Math.PI) * phi;
  mesh.position.setFromSphericalCoords(radius, phi, theta);
  mesh.lookAt(mesh.position.clone().multiplyScalar(2));
  group.add(mesh);
});

// 그룹 스케일: 메인 대비 40%
group.scale.set(0.3, 0.3, 0.3);

// 렌더 루프
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 리사이즈 처리(고정 위치 요소의 픽셀 크기 기반)
window.addEventListener('resize', () => {
  setRendererSize();
  camera.aspect = 1;
  camera.updateProjectionMatrix();
});
