import * as THREE from '../build/three.module.js';
import { GLTFLoader } from '../libs/loaders/GLTFLoader.js';

class Drum{
    constructor(sound){
        this.scene = new THREE.Object3D();
        this.drums = new Array();
        this.drumAudios = new Array();
        this.sound = sound;
        
         // GLTFLOADER
        const loader = new GLTFLoader().setPath('/resources/drum/');
        loader.load('scene.gltf', (gltf) => {
            gltf.scene.scale.set(0.1, 0.1, 0.1);
            gltf.scene.position.set(0, 0, 0);
            let y_angle = 180;
            y_angle = y_angle * 3.14 / 180.0;
            gltf.scene.rotation.set(0, y_angle, 0);
            this.scene.add(gltf.scene);

            this.cymbalL = this.scene.getObjectByName("cymbalLdisk001");
            this.cymbalR = this.scene.getObjectByName("cymbalRdisk001");
            this.snare = this.scene.getObjectByName("snare003")
            this.tumL = this.scene.getObjectByName("tumL001")
            this.tumR = this.scene.getObjectByName("tumR001")
            this.tumF = this.scene.getObjectByName("floor_tum001")
            //this.hi_hat = this.scene.getObjectByName("hi-hat.upperdisk.004");
            //this.bass = this.scene.getObjectByName("bassdrum.004")
            this.drums.push(this.cymbalL);
            this.drums.push(this.cymbalR);
            this.drums.push(this.snare);
            this.drums.push(this.tumL);
            this.drums.push(this.tumR);
            this.drums.push(this.tumF);

            this.drumAudios.push("/resources/drumAudio/hihat.wav")
            this.drumAudios.push("/resources/drumAudio/kick.wav")
            this.drumAudios.push("/resources/drumAudio/snare.wav")

        })
    }
    musicLoader(sourceNum, audioLoader){
        
        audioLoader.load( sourceNum, function( buffer ) {
            this.sound.setBuffer( buffer );
            this.sound.setLoop( true );
            this.sound.setVolume( 0.5 );
            this.sound.play();
        });
    }
    handleCollisions(partners, controllers) {
        const box = new THREE.Box3();
        let v = new THREE.Vector3(); // vector temp for compare collision
        const audioLoader = new THREE.AudioLoader();
        let drumNum = 0;
        // TODO :
        // Partner의 controller와 drum의 충돌처리
        for (let i = 0; i < this.drums.length; i++) {
            this.drums[i].collided = false;
        }
    
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
                        drumComponent.scale.setScalar(1 + Math.random() * 0.1 * intensity);

                        const intensity = drumComponent.userData.index / this.drums.length; //What's for intensitiy?
                        
                        this.drums[i].collided = true;

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
                    drumComponent.scale.setScalar(1 + Math.random() * 0.1 * intensity);
                    const intensity = drumComponent.userData.index / this.drums.length;
    
                    if (supportHaptic) {
                        gamepad.hapticActuators[0].pulse(intensity, 100);
                    }
                    controller.colliding = true;
                    this.drums[i].collided = true;
                    this.drumNum=1; // 여기 수정해야함
                }
            }
    
            if (controller.colliding) {
                if (!controller.playing) {
                    controller.playing = true;
                    //oscillators[g].connect(audioCtx.destination);
                    this.musicLoader(this.drumNum, audioLoader)
    
                }
    
            } else {
    
                if (controller.playing) {
                    controller.playing = false;
                    //oscillators[g].disconnect(audioCtx.destination);
                    this.musicLoader(this.drumNum, audioLoader)
    
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