import React, { useRef, useEffect } from "react";
import * as pc from "playcanvas";

const PlayCanvasScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Create a PlayCanvas application using the canvas element.
    const app = new pc.Application(canvasRef.current, {
      mouse: new pc.Mouse(canvasRef.current),
      touch: new pc.TouchDevice(canvasRef.current),
    });
    app.start();

    // Set the canvas resolution and fill mode.
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    // Create a basic camera entity.
    const cameraEntity = new pc.Entity("camera");
    cameraEntity.addComponent("camera", {
      clearColor: new pc.Color(0.5, 0.5, 0.5),
    });
    // Position the camera so it faces the plane.
    cameraEntity.setPosition(0, 0, 3);
    app.root.addChild(cameraEntity);

    // Create a plane entity.
    const planeEntity = new pc.Entity("plane");
    planeEntity.addComponent("model", {
      type: "plane",
    });
    // Rotate the plane 180° around Y so its front (default +Z) faces the camera.
    planeEntity.setLocalEulerAngles(0, 180, 0);

    // Create a material that culls back faces.
    const planeMaterial = new pc.StandardMaterial();
    planeMaterial.cull = pc.CULLFACE_BACK; // Only render the front face.
    planeMaterial.diffuse = new pc.Color(1, 1, 1); // White diffuse color.
    planeMaterial.update();

    // Apply the material to the plane's mesh instance(s).
    planeEntity.model.meshInstances.forEach((meshInstance) => {
      meshInstance.material = planeMaterial;
    });

    // Add the plane to the scene.
    app.root.addChild(planeEntity);

    // Optional: Rotate the plane continuously to see the culling effect.
    app.on("update", (dt) => {
      planeEntity.rotate(10 * dt, 20 * dt, 0);
    });

    // Cleanup: destroy the app on component unmount.
    return () => {
      //   app.destroy();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen h-screen"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default PlayCanvasScene;
