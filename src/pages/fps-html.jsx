// import React, { useEffect, useRef, useState } from "react";
// import { extendedPc } from "../../public/scripts/css3plane";
// import { ChanegColor } from "../../public/scripts/youtube";
// import { FpsPlaycanvas } from "../components/fps-script";
// import { CreateCharacterController } from "../components/character-controller";
// import { initAmmo } from "../../public/scripts/ammo-draco-loader";

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

// const GameFps = () => {
//   const [isloading, setisloading] = useState(true);
//   const canvasRef = useRef(null);
//   const deviceType = extendedPc.DEVICETYPE_WEBGL2;
//   const URL = "https://www.youtube.com/watch?v=ghgTX6T_5oc";
//   const store = new extendedPc.Asset("Store", "container", {
//     url: "/models/ExportFrames.glb",
//   });

//   useEffect(() => {
//     const initializeGame = async () => {
//       if (!canvasRef.current) return;
//       const canvas = canvasRef.current;

//       const gfxOptions = {
//         deviceTypes: [deviceType],
//         glslangUrl: "/public/lib/glslang/glslang.js",
//         twgslUrl: "/public/lib/twgsl/twgsl.js",
//         antialias: true,
//         powerPreference: "high-performance",
//       };

//       await initAmmo();

//       try {
//         const device = await extendedPc.createGraphicsDevice(
//           canvas,
//           gfxOptions
//         );
//         if (!device) {
//           console.error("Failed to create WebGL device.");
//           return;
//         }

//         const createOptions = new extendedPc.AppOptions();
//         createOptions.graphicsDevice = device;
//         createOptions.mouse = new extendedPc.Mouse(canvas);
//         createOptions.touch = new extendedPc.TouchDevice(canvas);
//         createOptions.keyboard = new extendedPc.Keyboard(document.body);
//         createOptions.elementInput = new extendedPc.ElementInput(canvas);

//         createOptions.componentSystems = [
//           extendedPc.RenderComponentSystem,
//           extendedPc.CameraComponentSystem,
//           extendedPc.LightComponentSystem,
//           extendedPc.ScriptComponentSystem,
//           extendedPc.CollisionComponentSystem,
//           extendedPc.RigidBodyComponentSystem,
//           extendedPc.ElementComponentSystem,
//           extendedPc.AnimComponent,
//           extendedPc.AnimComponentSystem,
//           extendedPc.ScreenComponentSystem,
//         ];
//         createOptions.resourceHandlers = [
//           extendedPc.TextureHandler,
//           extendedPc.ContainerHandler,
//           extendedPc.ScriptHandler,
//           extendedPc.JsonHandler,
//         ];

//         const app = new extendedPc.Application(canvas, createOptions);

//         // Pass the extendedPc object to your ChanegColor script.
//         ChanegColor(extendedPc);

//         FpsPlaycanvas(extendedPc);

//         app.setCanvasFillMode(extendedPc.FILLMODE_FILL_WINDOW);
//         app.setCanvasResolution(extendedPc.RESOLUTION_AUTO);
//         app.start();

//         // Create Lighting
//         const light = new extendedPc.Entity("light");
//         light.addComponent("light", { type: "directional" });
//         light.setEulerAngles(45, 30, 0);
//         app.root.addChild(light);

//         // Create a Plane
//         // Create a new layer for the YouTube video plane
//         const videoLayer = new extendedPc.Layer("videoLayer", []);

//         // Get the scene’s layer composition and the existing World layer
//         const layers = app.scene.layers;
//         const worldLayer = layers.getLayerByName("World");

//         // Insert the opaque part of the videoLayer immediately after the opaque part of the World layer
//         const worldOpaqueIndex = layers.getOpaqueIndex(worldLayer);
//         layers.insertOpaque(videoLayer, worldOpaqueIndex + 1);

//         // Ensure the transparent part of videoLayer is rendered at the end
//         layers.pushTransparent(videoLayer);

//         // Create the YouTube video plane
//         const plane = new extendedPc.Entity("plane");
//         plane.addComponent("render", { type: "plane" });

//         const newURL = getYoutubeEmbedSrc(URL);

//         // Create a transparent material so the iframe is visible on top of it
//         const material = new extendedPc.StandardMaterial();
//         material.opacity = 0;
//         material.update();
//         plane.render.meshInstances[0].material = material;

//         plane.setEulerAngles(90, 0, 0);
//         plane.setLocalPosition(0, 3, -1.4391355514526367);
//         plane.setLocalScale(3, 3, 3);

//         // Assign the plane’s mesh instances to the new videoLayer
//         plane.render.meshInstances.forEach((meshInstance) => {
//           // This ensures that both the opaque and transparent parts are in videoLayer.
//           meshInstance.layer = videoLayer.id;
//         });

//         app.root.addChild(plane);

//         // Attach the YouTube iframe script to the plane

//         const cameraEntity = new extendedPc.Entity("camera");
//         cameraEntity.addComponent("camera", {
//           farClip: 100,
//           fov: 90,
//         });
//         cameraEntity.setLocalPosition(0, 0.5, 0);

//         const characterController = CreateCharacterController(
//           extendedPc,
//           cameraEntity
//         );
//         characterController.setPosition(2, 4, 10);
//         app.root.addChild(characterController);

//         plane.addComponent("script");
//         plane.script.create("iframePlane", {
//           attributes: {
//             iframeUrl: newURL,
//             pixelsPerUnit: 320,
//           },
//         });

//         app.assets.add(store);
//         app.assets.load(store);

//         store.on("load", () => {
//           const container = store.resource;
//           const model = container.instantiateRenderEntity();

//           console.log(container);

//           const scenes = container.data.gltf.scenes;
//           const nodes = container.data.gltf.nodes;

//           const renders = model.findComponents("render");
//           console.log("Renders", renders);

//           //Collider script
//           model.findComponents("render").forEach((render) => {
//             const entity = render.entity;
//             entity.addComponent("rigidbody", {
//               type: "static",
//             });
//             entity.addComponent("collision", {
//               type: "mesh",
//               renderAsset: render.asset,
//             });
//           });

//           app.root.addChild(model);
//         });

//         console.log(app.scene.layers.layerList);

//         setisloading(false);
//       } catch (error) {
//         console.error("Error initializing PlayCanvas:", error);
//       }
//     };

//     initializeGame();
//   }, []);

//   return (
//     <div
//       className="fixed inset-0 w-screen h-screen"
//       style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         zIndex: 0,
//       }}
//     >
//       <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
//     </div>
//   );
// };
// export default GameFps;

import React, { useEffect, useRef, useState } from "react";
import { extendedPc } from "../../public/scripts/css3plane";
import { ChanegColor } from "../../public/scripts/youtube";
import { FpsPlaycanvas } from "../components/fps-script";
import { CreateCharacterController } from "../components/character-controller";
import { initAmmo } from "../../public/scripts/ammo-draco-loader";

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

const GameFps = () => {
  const [isloading, setisloading] = useState(true);
  const canvasRef = useRef(null);
  const deviceType = extendedPc.DEVICETYPE_WEBGL2;
  const URL = "https://www.youtube.com/watch?v=ghgTX6T_5oc";
  const store = new extendedPc.Asset("Store", "container", {
    url: "/models/ExportFrames.glb",
  });

  useEffect(() => {
    const initializeGame = async () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;

      const gfxOptions = {
        deviceTypes: [deviceType],
        glslangUrl: "/public/lib/glslang/glslang.js",
        twgslUrl: "/public/lib/twgsl/twgsl.js",
        antialias: true,
        powerPreference: "high-performance",
      };

      await initAmmo();

      try {
        const device = await extendedPc.createGraphicsDevice(
          canvas,
          gfxOptions
        );
        if (!device) {
          console.error("Failed to create WebGL device.");
          return;
        }

        const createOptions = new extendedPc.AppOptions();
        createOptions.graphicsDevice = device;
        createOptions.mouse = new extendedPc.Mouse(canvas);
        createOptions.touch = new extendedPc.TouchDevice(canvas);
        createOptions.keyboard = new extendedPc.Keyboard(document.body);
        createOptions.elementInput = new extendedPc.ElementInput(canvas);

        createOptions.componentSystems = [
          extendedPc.RenderComponentSystem,
          extendedPc.CameraComponentSystem,
          extendedPc.LightComponentSystem,
          extendedPc.ScriptComponentSystem,
          extendedPc.CollisionComponentSystem,
          extendedPc.RigidBodyComponentSystem,
          extendedPc.ElementComponentSystem,
          extendedPc.AnimComponent,
          extendedPc.AnimComponentSystem,
          extendedPc.ScreenComponentSystem,
        ];
        createOptions.resourceHandlers = [
          extendedPc.TextureHandler,
          extendedPc.ContainerHandler,
          extendedPc.ScriptHandler,
          extendedPc.JsonHandler,
        ];

        const app = new extendedPc.Application(canvas, createOptions);

        // Pass the extendedPc object to your ChanegColor and FPS scripts.
        ChanegColor(extendedPc);
        FpsPlaycanvas(extendedPc);

        app.setCanvasFillMode(extendedPc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(extendedPc.RESOLUTION_AUTO);
        app.start();

        // ----- LAYER SETUP & DEBUGGING ----- //

        // Create a new layer for the YouTube video plane
        // const videoLayer = new extendedPc.Layer("videoLayer", []);
        // console.log("Created videoLayer:", videoLayer);

        // // Get the scene’s layer composition
        const layers = app.scene.layers;
        // console.log("Initial Layer Composition:", layers.layerList);

        // // Get the World layer by name
        // const worldLayer = layers.getLayerByName("World");
        // if (!worldLayer) {
        //   console.warn(
        //     "World layer not found in the scene's layer composition."
        //   );
        // } else {
        //   console.log("World layer found:", worldLayer);

        //   // Insert videoLayer before the World layer's opaque objects
        //   const worldOpaqueIndex = layers.getOpaqueIndex(worldLayer);
        //   console.log("World opaque index:", worldOpaqueIndex);
        //   layers.insertOpaque(videoLayer, worldOpaqueIndex + 1);
        //   console.log("Inserted videoLayer's opaque part BEFORE World layer.");

        //   // For transparent objects, insert videoLayer before World layer transparent objects.
        //   const worldTransparentIndex = layers.getTransparentIndex(worldLayer);
        //   console.log("World transparent index:", worldTransparentIndex);
        //   layers.insertTransparent(videoLayer, worldTransparentIndex);
        //   console.log(
        //     "Inserted videoLayer's transparent part BEFORE World layer in transparent pass."
        //   );
        // }

        // Print final layer composition for debugging
        console.log("Final Layer Composition:", layers);

        // ----- SCENE SETUP ----- //

        // Create Lighting
        const light = new extendedPc.Entity("light");
        light.addComponent("light", { type: "directional" });
        light.setEulerAngles(45, 30, 0);
        app.root.addChild(light);

        const plane = new extendedPc.Entity("plane");
        plane.addComponent("render", { type: "plane" });

        const newURL = getYoutubeEmbedSrc(URL);

        // Position the plane in the scene
        plane.setEulerAngles(90, 0, 0);
        plane.setLocalPosition(0, 3, -1.4391355514526367);
        plane.setLocalScale(3, 3, 3);

        // Add collision for the plane itself so raycasts can hit it
        plane.addComponent("collision", {
          type: "box",
          halfExtents: new extendedPc.Vec3(1.5, 0.01, 1.5),
        });
        plane.addComponent("rigidbody", { type: "static" });

        app.root.addChild(plane);

        // Create a camera
        const cameraEntity = new extendedPc.Entity("camera");
        cameraEntity.addComponent("camera", {
          farClip: 100,
          fov: 90,
        });
        cameraEntity.setLocalPosition(0, 0.5, 0);
        cameraEntity.camera.toneMapping = pc.TONEMAP_FILMIC;
        cameraEntity.camera.gammaCorrection = pc.GAMMA_SRGB;
        // app.root.addChild(cameraEntity);

        // Create a character controller
        const characterController = CreateCharacterController(
          extendedPc,
          cameraEntity
        );
        characterController.setPosition(2, 4, 10);
        app.root.addChild(characterController);

        // Attach the YouTube iframe script to the plane
        plane.addComponent("script");
        plane.script.create("iframePlane", {
          attributes: {
            iframeUrl: newURL,
            pixelsPerUnit: 320,
          },
        });

        // Load a store asset and instantiate its model
        app.assets.add(store);
        app.assets.load(store);

        store.on("load", () => {
          const container = store.resource;
          const model = container.instantiateRenderEntity();

          console.log("Loaded model container:", container);
          console.log("Model scenes:", container.data.gltf.scenes);
          console.log("Model nodes:", container.data.gltf.nodes);

          const renders = model.findComponents("render");
          console.log("Model render components:", renders);

          // Add collider components for each render
          model.findComponents("render").forEach((render) => {
            const entity = render.entity;
            entity.addComponent("rigidbody", { type: "static" });
            entity.addComponent("collision", {
              type: "mesh",
              renderAsset: render.asset,
            });
          });

          app.root.addChild(model);
          console.log("Model added to scene.");
        });

        setisloading(false);
      } catch (error) {
        console.error("Error initializing PlayCanvas:", error);
      }
    };

    initializeGame();
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

export default GameFps;
