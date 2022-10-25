import * as THREE from './build/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { VRButton } from './libs/VRButton.js';
import { XRControllerModelFactory } from './libs/XRControllerModelFactory.js';
import { GLTFLoader } from './libs/loaders/GLTFLoader.js';
import { Networking } from './networking.js';
import {PlayerData} from "./types/PlayerData.js";

let container;
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
const box = new THREE.Box3();

const controllers = [];
const oscillators = [];
let controls, group;
let audioCtx = null;
let networking;

// let partnerHead;
let partnerRightHand;
let partnerLeftHand;
let v = new THREE.Vector3();
let username = prompt('Enter username', Math.random().toString(36).substring(2, 12));
// minor pentatonic scale, so whichever notes is striked would be more pleasant
const musicScale = [0, 3, 5, 7, 10];

init();
animate();

function initAudio() {

    if (audioCtx !== null) {

        return;

    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function createOscillator() {

        // creates oscillator
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine'; // possible values: sine, triangle, square
        oscillator.start();
        return oscillator;

    }

    oscillators.push(createOscillator());
    oscillators.push(createOscillator());
    window.oscillators = oscillators;

}

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.set(0, 1.6, 3);

    controls = new OrbitControls(camera, container);
    controls.target.set(0, 1.6, 0);
    controls.update();

    const floorGeometry = new THREE.PlaneGeometry(4, 4);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 1.0,
        metallicness: 0.0
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 6, 0);
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = - 2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = - 2;
    light.shadow.mapSize.set(4096, 4096);
    scene.add(light);

    group = new THREE.Group();
    group.position.z = - 0.5;
    scene.add(group);

    partner = new THREE.Group();
    // group.position.z = - 0.5;
    scene.add(partner);



    const BOXES = 10;

    for (let i = 0; i < BOXES; i++) {

        const intensity = (i + 1) / BOXES;
        const w = 0.1;
        const h = 0.1;
        const minH = 1;
        const geometry = new THREE.BoxGeometry(w, h * i + minH, w);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(intensity, 0.1, 0.1),
            roughness: 0.7,
            metallicness: 0.0
        });

        const object = new THREE.Mesh(geometry, material);
        object.position.x = (i - 5) * (w + 0.05);
        object.castShadow = true;
        object.receiveShadow = true;
        object.userData = {
            index: i + 1,
            intensity: intensity
        };

        group.add(object);

    }
    //이렇게 한번 group에 바로 gltf클래스를 넣는게 아니라 한번 object3d에 감싸서 다시 넣어주면 제대로 접근가능함
    let partnerHead = new THREE.Object3D();
    partner.add(partnerHead);
    partnerRightHand = new THREE.Object3D();
    partner.add(partnerRightHand);
    partnerLeftHand = new THREE.Object3D();
    partner.add(partnerLeftHand);

    // GLTFLOADER
    const loader = new GLTFLoader().setPath('/resources/head/');
    loader.load('scene.gltf', function (gltf) {
        let object = gltf.scene;
        object.scale.set(1.0, 1.0, 1.0);
        object.position.set(0, 1, 0);
        let y_angle = 180;
        y_angle = y_angle * 3.14 / 180.0;
        object.rotation.set(0, y_angle, 0);
        partnerHead.add(object);
    })
    loader.setPath('/resources/hand/');
    loader.load('scene.gltf', function (gltf) {
        let object = gltf.scene;
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(0.5, 0.5, 0);
        partnerLeftHand.add(object);
    })

    loader.load('scene.gltf', function (gltf) {
        let object = gltf.scene;
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(-0.5, 0.5, 0);
        partnerRightHand.add(object);
    })
    

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));

    document.getElementById('VRButton').addEventListener('click', () => {

        initAudio();

    });

    // controllers

    controller1 = renderer.xr.getController(0);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.addEventListener('connected', controllerConnected);
    controllerGrip1.addEventListener('disconnected', controllerDisconnected);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.addEventListener('connected', controllerConnected);
    controllerGrip2.addEventListener('disconnected', controllerDisconnected);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    //

    window.addEventListener('resize', onWindowResize);

    networking = new Networking(camera, controller1, controller2, roomname, username, scene);

    // setInterval(networking.broadcastToPlayers, 1000);
}

function controllerConnected(evt) {

    controllers.push({
        gamepad: evt.data.gamepad,
        grip: evt.target,
        colliding: false,
        playing: false
    });

}

function controllerDisconnected(evt) {

    const index = controllers.findIndex(o => o.controller === evt.target);
    if (index !== - 1) {

        controllers.splice(index, 1);

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {


    renderer.setAnimationLoop(render);

}

function handleCollisions() {

    for (let i = 0; i < group.children.length; i++) {

        group.children[i].collided = false;

    }

    for (let g = 0; g < controllers.length; g++) {

        const controller = controllers[g];
        controller.colliding = false;

        const { grip, gamepad } = controller;
        const sphere = {
            radius: 0.03,
            center: grip.position
        };
        
        const supportHaptic = 'hapticActuators' in gamepad && gamepad.hapticActuators != null && gamepad.hapticActuators.length > 0;

        for (let i = 0; i < group.children.length; i++) {
            const child = group.children[i];
            box.setFromObject(child);
            if (box.intersectsSphere(sphere)) {

                child.material.emissive.b = 1;
                const intensity = child.userData.index / group.children.length;
                child.scale.setScalar(1 + Math.random() * 0.1 * intensity);

                if (supportHaptic) {

                    gamepad.hapticActuators[0].pulse(intensity, 100);

                }

                const musicInterval = musicScale[child.userData.index % musicScale.length] + 12 * Math.floor(child.userData.index / musicScale.length);
                oscillators[g].frequency.value = 110 * Math.pow(2, musicInterval / 12);
                controller.colliding = true;
                group.children[i].collided = true;

            }

        }



        if (controller.colliding) {

            if (!controller.playing) {

                controller.playing = true;
                oscillators[g].connect(audioCtx.destination);

            }

        } else {

            if (controller.playing) {

                controller.playing = false;
                oscillators[g].disconnect(audioCtx.destination);

            }

        }

    }

    for (let i = 0; i < group.children.length; i++) {

        const child = group.children[i];
        if (!child.collided) {

            // reset uncollided boxes
            child.material.emissive.b = 0;
            child.scale.setScalar(1);

        }

    }

}

function partnerCollisions(){

    for(let g =0; g < partner.children.length; g++){

        for (let i = 0; i < group.children.length; i++) {
            const child = group.children[i];
            box.setFromObject(child);
            partner.children[g].getWorldPosition(v);//왜 실제 월드 좌표가 아니라 로컬로 나올까 실제좌표로 되도록 수정해야함.
            const sphere = {
                radius: 0.03,
                center: v
            };
            console.log(v)
            if (box.intersectsSphere(sphere)) {//왼손이랑 닿았을때
                console.log("접촉함!!!!")// 제대로 작동함
                child.material.emissive.b = 1;
                const intensity = child.userData.index / group.children.length;
                child.scale.setScalar(1 + Math.random() * 0.1 * intensity);//왜 아무일도 안일어나지?
                // child.position.z -= 0.01; //디버깅용
                // group.position.z -= 0.01; //디버깅용
                const musicInterval = musicScale[child.userData.index % musicScale.length] + 12 * Math.floor(child.userData.index / musicScale.length);
                // oscillators[g].frequency.value = 110 * Math.pow(2, musicInterval / 12);
                // group.children[i].collided = true;
    
            }
    
        }
    }
}

function updatePartnerAvatar() {
    //you can change head angle down here
    
    // partner.children[0].position.y += 0.01; //머리 오브젝트 
    partner.children[1].position.z -= 0.002; //오른손 오브젝트
    partner.children[2].position.z -= 0.001; //왼손 오브젝트

    // partner.rotation.y += 0.01;

    
}
let cnt = 0;

function render() {
    updatePartnerAvatar(); //일단 양손 계속 앞으로 하게해놨음 함수 수정하면됩니다.
    partnerCollisions(); //파트너가 실로폰에 닿으면 console에 log가 뜹니다. 하지만 실로폰이 떨리진 않음. 이유는 모르겠습니다...
    handleCollisions();
    if(cnt == 10 ) {
        cnt = 0;
        networking.broadcastToPlayers();
    }
    cnt++;
    renderer.render(scene, camera);
}