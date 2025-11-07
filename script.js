// === 기본 세팅 ===
let selectedProject = null; // ✅ 꼭 있어야 함
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('bg'),
    antialias: true,
    alpha: true // ✅ 캔버스를 투명하게
  });  
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// === 조명 ===
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// === Orbit Controls (마우스 회전) ===
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;

// === 이미지 로드 ===
const textureLoader = new THREE.TextureLoader();
const projects = [
    {
      img: "./projectimages/ArchitenWeb.jpg",
      name: "Architen New Website",
      year: "2024",
      type: "Brand & Web Identity Design"
    },
    {
      img: "./projectimages/Architen-Shift+1Web.jpg",
      name: "Shift+1 Web Archive",
      year: "2024",
      type: "Exhibition Web Archive Design"
    },
    {
      img: "./projectimages/coilhaus.jpg",
      name: "COILHAUS",
      year: "2024",
      type: "Spatial Design"
    },
    {
        img: "./projectimages/hhhh.jpg",
        name: "HHHH Music Complex",
        year: "2025",
        type: "Spatial Design"
      },
      {
        img: "./projectimages/let's-siso.jpg",
        name: "Let's SiSo",
        year: "2023",
        type: "Furniture Design / Exhibition Experiment"
      }
  ];  

// === 이미지 메쉬 생성 ===
const group = new THREE.Group();
scene.add(group);

const radius = 10;
const imgCount = projects.length;
const geometry = new THREE.PlaneGeometry(3, 4);

projects.forEach((project, i) => {
    // ✅ 이미지 로드 + 콜백(로드 후 설정) 한 번에 처리
    const texture = textureLoader.load(project.img, (t) => {
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy(); // 선명도 향상
    });
  
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
  
    const plane = new THREE.Mesh(geometry, material);
  
    const phi = Math.acos(-1 + (2 * i) / imgCount);
    const theta = Math.sqrt(imgCount * Math.PI) * phi;
    plane.position.setFromSphericalCoords(radius, phi, theta);
    plane.lookAt(plane.position.clone().multiplyScalar(2));
  
    plane.userData = project; // ✅ 클릭 시 표시할 데이터
    group.add(plane);
  });
  
// === 카메라 위치 ===
camera.position.z = 20;

// === 마우스 움직임으로 회전 제어 ===
let targetX = 0;
let targetY = 0;
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - window.innerWidth / 2) / window.innerWidth;
  mouseY = (event.clientY - window.innerHeight / 2) / window.innerHeight;
});

function animate() {
    requestAnimationFrame(animate);
  
    // ✅ 선택되지 않았을 때만 회전 갱신
    if (!selectedProject) {
      targetX += 0.05 * (mouseX - targetX);
      targetY += 0.05 * (mouseY - targetY);
      group.rotation.y += 0.02 * targetX;
      group.rotation.x += 0.02 * targetY;
    }
  
    // ✅ 카메라 컨트롤 & 렌더는 항상 호출
    controls.update();
    renderer.render(scene, camera);
  }
  
animate();

// === 창 크기 조정 ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === 클릭 이벤트 ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(group.children);

  if (intersects.length > 0) {
    const selected = intersects[0].object;
    const { name, year, type } = selected.userData;

    // 이미 선택된 프로젝트가 있을 때는 리셋
    if (selectedProject === selected) {
      resetProjectView();
      return;
    }

    selectedProject = selected;

    // 1️⃣ 클릭된 프로젝트가 정면에 오도록 카메라 이동
    selectedProject = selected;

// ✅ 회전 및 조작 중지
controls.autoRotate = false;
controls.enabled = false;

// 카메라 이동
const targetPos = selected.position.clone().normalize().multiplyScalar(15);

    const tween = { progress: 0 };
    const start = camera.position.clone();

    const animateMove = () => {
      tween.progress += 0.05;
      camera.position.lerpVectors(start, targetPos, tween.progress);
      camera.lookAt(selected.position);
      renderer.render(scene, camera);
      if (tween.progress < 1) requestAnimationFrame(animateMove);
    };
    animateMove();

    // 2️⃣ 프로젝트 정보 표시
    document.getElementById("p-name").textContent = name;
    document.getElementById("p-meta").textContent = `${year} · ${type}`;
    document.getElementById("project-info").classList.remove("hidden");
  }
});

function resetProjectView() {
    selectedProject = null;
    document.getElementById("project-info").classList.add("hidden");
    camera.position.set(0, 0, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  
    // ✅ 회전 및 조작 다시 활성화
    controls.autoRotate = true;
    controls.enabled = true;
  }  


// === 리셋 버튼 ===
document.getElementById('resetBtn').addEventListener('click', () => {
  group.rotation.set(0, 0, 0);
});
