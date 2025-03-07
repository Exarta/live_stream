export function CreateCharacterController(pc, camera) {
  const entity = new pc.Entity("character");
  entity.addChild(camera);

  entity.addComponent("collision", {
    type: "capsule",
    radius: 0.5,
    height: 2,
  });

  entity.addComponent("rigidbody", {
    type: "dynamic",
    mass: 85,
    linearDamping: 0.9,
    angularDamping: 0.9,
    linearFactor: new pc.Vec3(1, 1, 1),
    angularFactor: new pc.Vec3(0, 0, 0),
    friction: 0.5,
    restitution: 0,
  });

  entity.addComponent("script");
  entity.script.create("characterController", {
    attributes: {
      camera: camera,
      sensitivity: 0.2,
      speed: 8,
      fastSpeed: 20,
    },
  });

  return entity;
}
