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
            gltf.scene.scale.set(0.1, 0.1, 0.1);
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
            sound.setVolume( 1 );
            sound.setLoop(false)
            let object = this.scene.getObjectByName(drumName);
            //console.log(object)
            this.drums.push({
                object : object,
                sound : sound,
                collided :false,
                playing : false
            });
        });
    }

    handleCollisions(partners, controllers) {
        const box = new THREE.Box3();
        let v = new THREE.Vector3(); // vector temp for compare collision

        for(let j=0; j<this.drums.length ; j++){
            this.drums[j].object.collided=false;
        }

        for(let j =0; j < partners.length; j++){
            for(let g =0; g < partners[j].partner.children.length; g++){ // partner의 손1, 손2
                for (let i = 0; i < this.drums.length; i++) { //drum component의 길이
                    const drumComponent = this.drums[i];
                    box.setFromObject(drumComponent.object);
                    partners[j].partner.children[g].getWorldPosition(v);
                    const sphere = {
                        radius: 0.03,
                        center: v
                    };
                    // console.log(v)
                    if (box.intersectsSphere(sphere)) { 
                        drumComponent.object.collided = true;
                        //console.log(drumComponent)
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
    
            for (let i = 0; i < this.drums.length; i++) {
                const drumComponent = this.drums[i];
                box.setFromObject(drumComponent.object);
                if (box.intersectsSphere(sphere)) {

                    controller.colliding = true;
                    drumComponent.object.collided = true;
                    
                }
            }
        }
    
        for (let i = 0; i < this.drums.length; i++) {
            const drumComponent = this.drums[i];
             // reset uncollided boxes
            if (!drumComponent.object.collided && drumComponent.playing) {
                drumComponent.object.scale.set(1.0);
                drumComponent.playing = false;
            }
            else if (drumComponent.object.collided && !drumComponent.playing)
                drumComponent.object.scale.set(1.1);
                drumComponent.playing = true;
                if(drumComponent.sound.isPlaying){
                    drumComponent.sound.stop();
                }
                drumComponent.sound.play();
        }
    }


}
export{Drum}