import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./images/norman.jpg')

const material = new THREE.MeshPhongMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(1, 1, 10);
scene.add(directionalLight);

camera.position.z = 5;

const loader = new GLTFLoader();

loader.load('mr_krabs_spongebob.glb', function (gltf) {
    const model = gltf.scene.children[0];
    model.scale.set(0.005, 0.005, 0.005);
    model.position.set(4, 0, 0);
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.02;

    renderer.render(scene, camera);
}

animate();