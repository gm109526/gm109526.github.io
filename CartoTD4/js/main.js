import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;

const geometry = new THREE.SphereGeometry(1, 32, 32);
const texture = new THREE.TextureLoader().load('./images/carte.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });
const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function add3DModelToPosition(position, scene) {
    const loader = new GLTFLoader();

    loader.load('clemenceau.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.002, 0.002, 0.002);
        model.position.copy(position);
        model.rotation.y = Math.PI / 2;
        scene.add(model);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(position.x, position.y, position.z);
        scene.add(pointLight);
    });
}

navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const cartesianGeoloc = latLonToCartesian(latitude, longitude, 1.1);

    add3DModelToPosition(cartesianGeoloc, scene);
}, errorHandler);

function errorHandler(error) {
    console.error('Erreur de géolocalisation:', error);
}

function latLonToCartesian(latitude, longitude, radius) {
    const lat = latitude * Math.PI / 180.0;
    const lon = -longitude * Math.PI / 180.0;
    return new THREE.Vector3(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lon)
    )
}

const API_URL = 'https://restcountries.com/v3.1/all';

function getCountryData() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', API_URL);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
            } else {
                reject(new Error(`Erreur ${xhr.status}: ${xhr.statusText}`));
            }
        };
        xhr.onerror = () => {
            reject(new Error('Erreur réseau'));
        };
        xhr.send();
    });
}

function loadFlagTexture(countryCode) {
    return new Promise((resolve, reject) => {
        const flagTextureLoader = new THREE.TextureLoader();
        flagTextureLoader.load(`https://restcountries.com/data/${countryCode.toLowerCase()}.svg`, resolve, undefined, reject);
    });
}

function addMarkersFromCountryData(data, scene) {
    data.forEach(async country => {
        const latlng = country.latlng;

        if (latlng && latlng.length === 2) {
            const latitude = latlng[0];
            const longitude = latlng[1];

            const cartesianPosition = latLonToCartesian(latitude, longitude, 1.1);

            const flagTexture = await loadFlagTexture(country.cca2);

            const flagMaterial = new THREE.MeshBasicMaterial({ map: flagTexture });

            const flagGeometry = new THREE.SphereGeometry(0.05, 32, 32); // Adjust the size of the flag
            const flag = new THREE.Mesh(flagGeometry, flagMaterial);
            flag.position.copy(cartesianPosition);

            scene.add(flag);
        }
    });
}

getCountryData()
    .then(data => addMarkersFromCountryData(data, scene))
    .catch(error => console.error('Erreur lors du chargement des données des pays:', error));

animate();