import * as THREE from '../build/three.module.js';
import { GLTFLoader } from '../libs/loaders/GLTFLoader.js';

class Drum{
    constructor(){
        this.scene = new THREE.Object3D();
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
        })
    }

}
export{Drum}