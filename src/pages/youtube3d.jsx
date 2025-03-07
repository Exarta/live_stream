// import React, { useEffect, useRef, useState } from "react";
// import { extendedPc } from "../../public/scripts/css3plane";
// import * as pc from "playcanvas";
// import { initAmmo } from "../../public/scripts/ammo-draco-loader";

// import { ChanegColor } from "../../public/scripts/youtube";

// import { OrbitCamera } from "../../public/scripts/orbitCamera";
// import { MouseInput } from "../../public/scripts/mouse-input";
// import { SetSkyboxDds } from "../components/set-skybox";

// function getYoutubeEmbedSrc(url) {
//   // Extract the video ID from a standard YouTube URL
//   const regExp = /[?&]v=([^&#]+)/;
//   const match = url.match(regExp);
//   if (match && match[1]) {
//     const videoId = match[1];
//     return `https://www.youtube.com/embed/${videoId}`;
//   }
//   return null;
// }

// const YouTube = () => {
//   const canvasRef = useRef(null);
//   const deviceType = pc.DEVICETYPE_WEBGL2;
//   const [app, setApp] = useState(null);

//   const URL = "https://www.youtube.com/watch?v=NG-3GDqaXvU&ab_channel=GtxPreet";

//   const gameRef = useRef({
//     app: null,
//     camera: null,
//     physics: null,
//     input: {
//       x: 0,
//       y: 0,
//       mouseX: 0,
//       mouseY: 0,
//     },
//     editButton: false,
//   });

//   const initializeGame = async () => {
//     try {
//       const gfxOptions = {
//         deviceTypes: [deviceType],
//         glslangUrl: "/public/lib/glslang/glslang.js",
//         twgslUrl: "/public/lib/twgsl/twgsl.js",
//       };

//       await initAmmo();

//       const devicePixelRatio = window.devicePixelRatio;
//       //   const canvas = document.getElementById("application-canvas");
//       const canvas = canvasRef.current;
//       canvas.width = window.innerWidth * devicePixelRatio;
//       canvas.height = window.innerHeight * devicePixelRatio;

//       const device = await pc.createGraphicsDevice(canvas, gfxOptions);
//       if (!device) {
//         console.error("Failed to create WebGL device.");
//         return;
//       }

//       const createOptions = new pc.AppOptions();
//       createOptions.graphicsDevice = device;
//       createOptions.keyboard = new pc.Keyboard(document.body);
//       createOptions.mouse = new pc.Mouse(canvas);
//       createOptions.elementInput = new pc.ElementInput(canvas);
//       createOptions.touch = new pc.TouchDevice(canvas);

//       createOptions.componentSystems = [
//         pc.RenderComponentSystem,
//         pc.CameraComponentSystem,
//         pc.LightComponentSystem,
//         pc.ScriptComponentSystem,
//         pc.CollisionComponentSystem,
//         pc.RigidBodyComponentSystem,
//         pc.ElementComponentSystem,
//         pc.AnimComponent,
//         pc.AnimComponentSystem,
//         pc.ScreenComponentSystem,
//       ];
//       createOptions.resourceHandlers = [
//         pc.TextureHandler,
//         pc.ContainerHandler,
//         pc.ScriptHandler,
//         pc.JsonHandler,
//         pc.FontHandler,
//         pc.AnimClipHandler,
//         pc.AnimStateGraphHandler,
//       ];

//       const app = new pc.Application(canvas, createOptions);

//       ChanegColor(extendedPc);
//       OrbitCamera();
//       MouseInput();

//       app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
//       app.setCanvasResolution(pc.RESOLUTION_AUTO);

//       const resizeCanvas = () => {
//         const canvas = app.graphicsDevice.canvas;
//         const devicePixelRatio = window.devicePixelRatio;
//         canvas.width = window.innerWidth * devicePixelRatio;
//         canvas.height = window.innerHeight * devicePixelRatio;
//         app.graphicsDevice.updateClientRect();
//       };

//       app.on("resize", resizeCanvas);
//       resizeCanvas();

//       // Register physics system
//       app.systems.add("rigidbody", {
//         gravity: [0, -9.8, 0],
//       });

//       gameRef.current.app = app;
//       console.log("PlayCanvas application created");

//       app.start();

//       // Configure scene

//       setupScene(app);
//       setApp(app);
//     } catch (error) {
//       console.error("Error initializing game:", error);
//     }
//   };

//   const setupScene = (app) => {
//     SetSkyboxDds(app);

//     const cameraEntity = new pc.Entity("camera");
//     cameraEntity.addComponent("camera", {
//       farClip: 2000,
//       nearClip: 0.3,
//       fov: 45,
//     });
//     cameraEntity.setLocalPosition(-6.876, 2.39, 7.566);
//     cameraEntity.setLocalEulerAngles(-3.8, -34.8, 0);

//     cameraEntity.camera.layers = [
//       pc.LAYERID_WORLD,
//       pc.LAYERID_DEPTH,
//       pc.LAYERID_SKYBOX,
//       pc.LAYERID_IMMEDIATE,
//       pc.LAYERID_UI,
//     ];

//     cameraEntity.camera.clearColor = new pc.Color(0, 0, 0);
//     cameraEntity.camera.projection = pc.PROJECTION_PERSPECTIVE;

//     app.root.addChild(cameraEntity);

//     cameraEntity.addComponent("script");
//     cameraEntity.script.create("orbitCamera", {
//       attributes: {
//         distanceMax: 1000,
//         distanceMin: 1,
//         pitchAngleMax: 90,
//         pitchAngleMin: -90,
//         inertiaFactor: 0,
//         frameOnStart: false,
//       },
//     });
//     cameraEntity.script.create("mouseInput", {
//       attributes: {
//         orbitSensitivity: 0.3,
//         distanceSensitivity: 0.15,
//       },
//     });

//     gameRef.current.camera = cameraEntity;

//     const iframeTv = new pc.Entity("iframe TV");

//     const newURL = getYoutubeEmbedSrc(URL);

//     iframeTv.setLocalPosition(-3.498, 0, 4);
//     iframeTv.setLocalScale(1, 1, 1);

//     app.root.addChild(iframeTv);

//     const childPlane = new pc.Entity("iframe Plane");
//     childPlane.setEulerAngles(90, 0, 0);
//     childPlane.setLocalPosition(-0.367, 0.877, 0.709);
//     childPlane.setLocalScale(1.492, 1, 1.305);

//     childPlane.addComponent("render", {
//       type: "plane",
//       castShadows: true,
//       castShadowsLightmap: true,
//       receiveShadows: false,
//       layers: [pc.LAYERID_WORLD],
//     });

//     iframeTv.addChild(childPlane);

//     childPlane.addComponent("script");
//     childPlane.script.create("iframePlane", {
//       attributes: {
//         iframeUrl: newURL,
//         pixelsPerUnit: 320,
//       },
//     });

//     const box = new pc.Entity("Box");
//     box.setLocalPosition(-3.988, 0.947, 1.725);
//     box.addComponent("render", {
//       type: "box",
//       castShadows: true,
//       castShadowsLightmap: true,
//       receiveShadows: true,
//     });

//     app.root.addChild(box);
//   };

//   useEffect(() => {
//     if (canvasRef.current) {
//       initializeGame().catch((error) => {
//         console.error("Failed to initialize game:", error);
//       });
//     }

//     return () => {
//       console.log("Cleaning up game component...");
//       const ammoScript = document.querySelector('script[src*="ammo.wasm.js"]');
//       if (ammoScript) {
//         ammoScript.remove();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       if (app) {
//         app.resizeCanvas();
//       }
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, [app]);

//   return <canvas className="fixed" ref={canvasRef} />;
// };

// export default YouTube;
// // id={"application-canvas"}

import React, { useEffect, useState } from "react";
import { extendedPc } from "../../public/scripts/css3plane";
import * as pc from "playcanvas";
import { initAmmo } from "../../public/scripts/ammo-draco-loader";

import { ChanegColor } from "../../public/scripts/youtube";

import { OrbitCamera } from "../../public/scripts/orbitCamera";
import { MouseInput } from "../../public/scripts/mouse-input";
import { SetSkyboxDds } from "../components/set-skybox";

function getYoutubeEmbedSrc(url) {
  // Extract the video ID from a standard YouTube URL
  const regExp = /[?&]v=([^&#]+)/;
  const match = url.match(regExp);
  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
}

const YouTube = () => {
  const deviceType = pc.DEVICETYPE_WEBGL2;
  const [app, setApp] = useState(null);

  const URL = "https://www.youtube.com/watch?v=NG-3GDqaXvU&ab_channel=GtxPreet";

  const initializeGame = async () => {
    try {
      const gfxOptions = {
        deviceTypes: [deviceType],
        glslangUrl: "/public/lib/glslang/glslang.js",
        twgslUrl: "/public/lib/twgsl/twgsl.js",
      };

      await initAmmo();

      const devicePixelRatio = window.devicePixelRatio;
      const canvas = document.getElementById("application-canvas"); // Use ID to get the canvas
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;

      const device = await pc.createGraphicsDevice(canvas, gfxOptions);
      if (!device) {
        console.error("Failed to create WebGL device.");
        return;
      }

      const createOptions = new pc.AppOptions();
      createOptions.graphicsDevice = device;
      createOptions.keyboard = new pc.Keyboard(document.body);
      createOptions.mouse = new pc.Mouse(canvas);
      createOptions.elementInput = new pc.ElementInput(canvas);
      createOptions.touch = new pc.TouchDevice(canvas);

      createOptions.componentSystems = [
        pc.RenderComponentSystem,
        pc.CameraComponentSystem,
        pc.LightComponentSystem,
        pc.ScriptComponentSystem,
        pc.CollisionComponentSystem,
        pc.RigidBodyComponentSystem,
        pc.ElementComponentSystem,
        pc.AnimComponent,
        pc.AnimComponentSystem,
        pc.ScreenComponentSystem,
      ];
      createOptions.resourceHandlers = [
        pc.TextureHandler,
        pc.ContainerHandler,
        pc.ScriptHandler,
        pc.JsonHandler,
        pc.FontHandler,
        pc.AnimClipHandler,
        pc.AnimStateGraphHandler,
      ];

      const app = new pc.Application(canvas, createOptions);

      ChanegColor(extendedPc);
      OrbitCamera();
      MouseInput();

      app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
      app.setCanvasResolution(pc.RESOLUTION_AUTO);

      const resizeCanvas = () => {
        const canvas = app.graphicsDevice.canvas;
        const devicePixelRatio = window.devicePixelRatio;
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;
        app.graphicsDevice.updateClientRect();
      };

      app.on("resize", resizeCanvas);
      resizeCanvas();

      // Register physics system
      app.systems.add("rigidbody", {
        gravity: [0, -9.8, 0],
      });

      console.log("PlayCanvas application created");

      app.start();

      // Configure scene
      setupScene(app);
      setApp(app);
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  };

  const setupScene = (app) => {
    SetSkyboxDds(app);

    const cameraEntity = new pc.Entity("camera");
    cameraEntity.addComponent("camera", {
      farClip: 2000,
      nearClip: 0.3,
      fov: 45,
    });
    cameraEntity.setLocalPosition(-6.876, 2.39, 7.566);
    cameraEntity.setLocalEulerAngles(-3.8, -34.8, 0);

    cameraEntity.camera.layers = [
      pc.LAYERID_WORLD,
      pc.LAYERID_DEPTH,
      pc.LAYERID_SKYBOX,
      pc.LAYERID_IMMEDIATE,
      pc.LAYERID_UI,
    ];

    cameraEntity.camera.clearColor = new pc.Color(0, 0, 0);
    cameraEntity.camera.projection = pc.PROJECTION_PERSPECTIVE;

    app.root.addChild(cameraEntity);

    cameraEntity.addComponent("script");
    cameraEntity.script.create("orbitCamera", {
      attributes: {
        distanceMax: 1000,
        distanceMin: 1,
        pitchAngleMax: 90,
        pitchAngleMin: -90,
        inertiaFactor: 0,
        frameOnStart: false,
      },
    });
    cameraEntity.script.create("mouseInput", {
      attributes: {
        orbitSensitivity: 0.3,
        distanceSensitivity: 0.15,
      },
    });

    const iframeTv = new pc.Entity("iframe TV");

    const newURL = getYoutubeEmbedSrc(URL);

    iframeTv.setLocalPosition(-3.498, 0, 4);
    iframeTv.setLocalScale(1, 1, 1);

    app.root.addChild(iframeTv);

    const childPlane = new pc.Entity("iframe Plane");
    childPlane.setEulerAngles(90, 0, 0);
    childPlane.setLocalPosition(-0.367, 0.877, 0.709);
    childPlane.setLocalScale(1.492, 1, 1.305);

    childPlane.addComponent("render", {
      type: "plane",
      castShadows: true,
      castShadowsLightmap: true,
      receiveShadows: false,
      layers: [pc.LAYERID_WORLD],
    });

    iframeTv.addChild(childPlane);

    childPlane.addComponent("script");
    childPlane.script.create("iframePlane", {
      attributes: {
        iframeUrl: newURL,
        pixelsPerUnit: 320,
      },
    });

    const box = new pc.Entity("Box");
    box.setLocalPosition(-3.988, 0.947, 1.725);
    box.addComponent("render", {
      type: "box",
      castShadows: true,
      castShadowsLightmap: true,
      receiveShadows: true,
    });

    app.root.addChild(box);
  };

  useEffect(() => {
    const canvas = document.getElementById("application-canvas");
    if (canvas) {
      initializeGame().catch((error) => {
        console.error("Failed to initialize game:", error);
      });
    }

    return () => {
      console.log("Cleaning up game component...");
      const ammoScript = document.querySelector('script[src*="ammo.wasm.js"]');
      if (ammoScript) {
        ammoScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (app) {
        app.resizeCanvas();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [app]);

  return <canvas id="application-canvas" className="fixed" />;
};

export default YouTube;
