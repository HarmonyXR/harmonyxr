class PlayerData {
  constructor(camera, controller1, controller2) {
    this.position = camera.position;
    this.rotation = {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z
    }
    this.controller1 = controller1.position;
    this.controller2 = controller2.position;
  }

};

export {PlayerData};