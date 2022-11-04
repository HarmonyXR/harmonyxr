import * as THREE from '../build/three.module.js';
import { GLTFLoader } from '../libs/loaders/GLTFLoader.js';

class Piano {
  constructor(listener) {
    this.object = new THREE.Object3D();
    this.keys = new Array();

    // 피아노 3D 모델 및 건반소리 로드
    const audioLoader = new THREE.AudioLoader();
    const loader = new GLTFLoader().setPath('/resources/piano/');
    loader.load('scene.gltf', (gltf) => {
      gltf.scene.scale.set(0.2, 0.2, 0.2);
      gltf.scene.position.set(1, 0, 0.2);
      let y_angle = 180;
      y_angle = y_angle * 3.14 / 180.0;
      gltf.scene.rotation.set(0, y_angle, 0);
      this.object.add(gltf.scene);
      this.object.name = "piano";
      audioLoader.load('/resources/piano/sounds/c4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        this.keys.push({
          object: this.object.getObjectByName("White_11"),
          sound: sound,
          playing: false
        });
      });
      audioLoader.load('/resources/piano/sounds/d4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        this.keys.push({
          object: this.object.getObjectByName("White001_10"),
          sound: sound,
          playing: false
        });
      });
      audioLoader.load('/resources/piano/sounds/e4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        this.keys.push({
          object: this.object.getObjectByName("White002_12"),
          sound: sound,
          playing: false
        });
      });
      audioLoader.load('/resources/piano/sounds/f4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        this.keys.push({
          object: this.object.getObjectByName("White003_13"),
          sound: sound,
          playing: false
        });
      });
      audioLoader.load('/resources/piano/sounds/g4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        this.keys.push({
          object: this.object.getObjectByName("White004_14"),
          sound: sound,
          playing: false
        });
      });
      audioLoader.load('/resources/piano/sounds/a5.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        this.keys.push({
          object: this.object.getObjectByName("White005_15"),
          sound: sound,
          playing: false
        });
      });
      audioLoader.load('/resources/piano/sounds/b5.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        this.keys.push({
          object: this.object.getObjectByName("White006_16"),
          sound: sound,
          playing: false
        });
      });
    });
  }

  // 충돌 처리 함수
  handleCollisions(partners, controllers) {
    let box = new THREE.Box3();
    let v = new THREE.Vector3(); // vector temp for compare collision
    for (let key of this.keys) {
      key.object.collided = false;
    }

    // 파트너와의 충돌 체크
    for (let partner of partners) {
      for (let part of partner.partner.children) {
        for (let key of this.keys) {
          box.setFromObject(key.object);
          part.getWorldPosition(v);
          const sphere = {
            radius: 0.03,
            center: v
          };
          // console.log(v)
          if (box.intersectsSphere(sphere)) {//왼손이랑 닿았을때
            part.colliding = true;
            key.object.collided = true;
          }
        }
      }
    }

    // 플레이어 컨트롤러와의 충돌도 체크
    for (let controller of controllers) {
      controller.colliding = false;

      const { grip, gamepad } = controller;
      const sphere = {
        radius: 0.03,
        center: grip.position
      };

      const supportHaptic = 'hapticActuators' in gamepad && gamepad.hapticActuators != null && gamepad.hapticActuators.length > 0;

      for (let key of this.keys) {
        box.setFromObject(key.object);
        if (box.intersectsSphere(sphere)) {
          controller.colliding = true;
          key.object.collided = true;
        }
      }

      if (controller.colliding) {
        if (!controller.playing) {
          controller.playing = true;
          if (supportHaptic) {
            gamepad.hapticActuators[0].pulse(0.5, 100);
          }
        }
      } else {
        if (controller.playing) {
          controller.playing = false;
        }
      }
    }

    // 충돌이 일어난거로 확인된 키들에 대한 처리
    for (let key of this.keys) {
      if (!key.object.collided && key.playing) {
        console.log("play finish");
        key.object.position.y += 8;
        key.playing = false;
      } else if (key.object.collided && !key.playing) {
        console.log("play start")
        key.playing = true;
        key.object.position.y -= 8;
        key.sound.play();
      }
    }
  }
}

export { Piano };