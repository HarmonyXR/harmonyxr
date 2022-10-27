class PlayerData {
  constructor(camera, controller1, controller2) {
    this.position = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    }
    this.rotation = {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z
    }
    this.controller1 = {
      x: controller1.position.x,
      y: controller1.position.y,
      z: controller1.position.z,
    }
    this.controller2 = {
      x: controller2.position.x,
      y: controller2.position.y,
      z: controller2.position.z,
    }
  }

};

export {PlayerData};