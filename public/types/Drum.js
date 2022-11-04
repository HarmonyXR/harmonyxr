import * as THREE from '../build/three.module.js';
import { GLTFLoader } from '../libs/loaders/GLTFLoader.js';

class Drum{
    constructor(listener){
        this.scene = new THREE.Object3D();
        this.drums = new Array();
        this.drumAudios = new Array();
        const audioLoader = new THREE.AudioLoader();
        
         // GLTFLOADER
        const loader = new GLTFLoader().setPath('/resources/drum/');
        loader.load('scene.gltf', (gltf) => {
            gltf.scene.scale.set(0.3, 0.3, 0.3);
            gltf.scene.position.set(0, 0, 0);
            let y_angle = 180;
            y_angle = y_angle * 3.14 / 180.0;
            gltf.scene.rotation.set(0, y_angle, 0);
            this.scene.add(gltf.scene);
            console.log(this.scene)

          
            this.pushDrumComponentwithSound("/resources/drumAudio/cymbalL.wav", "cymbalLdisk001", audioLoader, listener)
            this.pushDrumComponentwithSound("/resources/drumAudio/cymbalR.wav", "cymbalRdisk001", audioLoader, listener)
            this.pushDrumComponentwithSound("/resources/drumAudio/kick.wav", "floor_tum001", audioLoader, listener)
            this.pushDrumComponentwithSound("/resources/drumAudio/snare.wav", "snare003", audioLoader, listener)
            this.pushDrumComponentwithSound("/resources/drumAudio/tumL.wav", "tumL001", audioLoader, listener)
            this.pushDrumComponentwithSound("/resources/drumAudio/tumR.wav", "tumR001", audioLoader, listener)
        })
        
    }

    pushDrumComponentwithSound(audioName, drumName, audioLoader, listener){
        audioLoader.load( audioName, ( buffer )=> {
            
            const sound = new THREE.Audio( listener );
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 0.5 );
            
            let object = this.scene.getObjectByName(drumName);
            //console.log(object)
            this.drums.push({
                object : object,
                sound : sound,
                collided :false
            });
        });
    }

    handleCollisions(partners, controllers) {
        const box = new THREE.Box3();
        let v = new THREE.Vector3(); // vector temp for compare collision
        let drumNum = 0;

        // TODO :
        // Partner의 controller와 drum의 충돌처리

        for(let j =0; j < partners.length; j++){
            for(let g =0; g < partners[j].partner.children.length; g++){ // partner의 손1, 손2
                for (let i = 0; i < this.drums.length; i++) { //drum component의 길이
                    const drumComponent = this.drums[i];
                    box.setFromObject(drumComponent);
                    partners[j].partner.children[g].getWorldPosition(v);
                    const sphere = {
                        radius: 0.03,
                        center: v
                    };
                    // console.log(v)
                    if (box.intersectsSphere(sphere)) { 
                        // console.log("접촉함!!!!")// 제대로 작동함
                        drumComponent.material.emissive.b = 1;
                        drumComponent.scale.setScalar(1 + Math.random() * 0.1 * 0.5);
                        drumComponent.collided = true;
                        drumComponent.sound.play();
                        console.log(drumComponent)
                    }
                }
            }
        }

        // TODO :
        // 본인 Controller 충돌처리
        for (let g = 0; g < controllers.length; g++) {
            const controller = controllers[g];
            controller.colliding = false;
    
            const { grip, gamepad } = controller;
            const sphere = {
                radius: 0.03,
                center: grip.position
            };
            
            const supportHaptic = 'hapticActuators' in gamepad && gamepad.hapticActuators != null && gamepad.hapticActuators.length > 0;
    
            for (let i = 0; i < this.drums.length; i++) {
                const drumComponent = this.drums[i];
                box.setFromObject(drumComponent);
                if (box.intersectsSphere(sphere)) {
    
                    drumComponent.material.emissive.b = 1;
                    drumComponent.scale.setScalar(1 + Math.random() * 0.1 * 0.5);
    
                    if (supportHaptic) {
                        gamepad.hapticActuators[0].pulse(0.5, 100);
                    }
                    controller.colliding = true;
                    drumComponent.collided = true;
                    drumComponent.sound.play();
                    

                }
            }
        }
    
        for (let i = 0; i < this.drums.length; i++) {
            const drumComponent = this.drums[i];
            if (!drumComponent.collided) {
                // reset uncollided boxes
                drumComponent.material.emissive.b = 0;
                drumComponent.scale.setScalar(1);
            }
    
        }
    }
   

}
export{Drum}