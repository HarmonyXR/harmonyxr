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
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.position.set(0, 0, 0);
      let y_angle = 180;
      y_angle = y_angle * 3.14 / 180.0;
      gltf.scene.rotation.set(0, y_angle, 0);
      this.object.add(gltf.scene);
      this.object.name = "piano";
      audioLoader.load('resources/piano/sounds/c4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume( 0.5 );
        this.keys.push({
          object: this.object.getObjectByName("White_11"),
          sound: sound
        });
      });
      audioLoader.load('resources/piano/sounds/d4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume( 0.5 );
        this.keys.push({
          object: this.object.getObjectByName("White002_12"),
          sound: sound
        });
      });
      audioLoader.load('resources/piano/sounds/e4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume( 0.5 );
        this.keys.push({
          object: this.object.getObjectByName("White003_13"),
          sound: sound
        });
      });
      audioLoader.load('resources/piano/sounds/f4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume( 0.5 );
        this.keys.push({
          object: this.object.getObjectByName("White004_14"),
          sound: sound
        });
      });
      audioLoader.load('resources/piano/sounds/g4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume( 0.5 );
        this.keys.push({
          object: this.object.getObjectByName("White005_15"),
          sound: sound
        });
      });
      audioLoader.load('resources/piano/sounds/a4.mp3', (soundBuffer) => {
        let sound = new THREE.Audio(listener);
        sound.setBuffer(soundBuffer);
        sound.setLoop(false);
        sound.setVolume( 0.5 );
        this.keys.push({
          object: this.object.getObjectByName("White006_16"),
          sound: sound
        });
      });
    });
  }

  // 충돌 처리 함수
  handleCollisions(partners, controllers, sound) {
    for (let key of this.keys) {
      key.object.collided = false;
    }

    // 파트너와의 충돌 체크
    for (let partner of partners) {
      for (let part of partner) {
        for (let key of this.keys) {
          box.setFromObject(key.object);
          part.getWorldPosition(v);
          const sphere = {
            radius: 0.03,
            center: v
          };
          // console.log(v)
          if (box.intersectsSphere(sphere)) {//왼손이랑 닿았을때
            // console.log("접촉함!!!!")// 제대로 작동함
            // key.object.material.emissive.b = 1;
            // const intensity = child.userData.index / this.keys.length;
            // key.object.scale.setScalar(1 + Math.random() * 0.1 * intensity);//왜 아무일도 안일어나지?
            // const musicInterval = musicScale[child.userData.index % musicScale.length] + 12 * Math.floor(child.userData.index / musicScale.length);
            // oscillators[g].frequency.value = 110 * Math.pow(2, musicInterval / 12);
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
          // child.material.emissive.b = 1;
          // const intensity = child.userData.index / this.keys.length;
          // child.scale.setScalar(1 + Math.random() * 0.1 * intensity);
          if (supportHaptic) {
            gamepad.hapticActuators[0].pulse(intensity, 100);
          }

          // const musicInterval = musicScale[child.userData.index % musicScale.length] + 12 * Math.floor(child.userData.index / musicScale.length);
          // oscillators[g].frequency.value = 110 * Math.pow(2, musicInterval / 12);
          controller.colliding = true;
          key.object.collided = true;
        }
      }

      // if (controller.colliding) {
      //   if (!controller.playing) {
      //     controller.playing = true;
      //   }
      // } else {
      //   if (controller.playing) {
      //     controller.playing = false;
      //   }
      // }
    }

    // 충돌이 일어난거로 확인된 키들에 대한 처리
    for (let key of this.keys) {
      if (!key.object.collided) {
        // reset uncollided boxes
        key.playing = false;
      } else if(!key.playing) {
        key.playing = true;
        key.object.position -= 10;
        key.sound.play();
      }
    }
  }
}

export { Piano };