import React, { useEffect, useRef, useState } from "react";
import { extendedPc } from "../../public/scripts/css3plane";
import * as pc from "playcanvas";

import { FpsPlaycanvas } from "../components/fps-script";
import { CreateCharacterController } from "../components/character-controller";
import {
  initAmmo,
  loadDracoDecoder,
} from "../../public/scripts/ammo-draco-loader";
import { io } from "socket.io-client";
import { ChanegColor } from "../../public/scripts/youtube";
import { MiniStats } from "../components/mini-stats";
import { SetSkybox } from "../components/setskybox";

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

const Simple = () => {
  const canvasRef = useRef(null);
  const deviceType = pc.DEVICETYPE_WEBGL2;
  const [app, setApp] = useState(null);

  const store = new pc.Asset("Store", "container", {
    url: "/models/ExportFrames.glb",
  });
  const URL = "https://www.youtube.com/watch?v=NG-3GDqaXvU&ab_channel=GtxPreet";

  const gameRef = useRef({
    app: null,
    camera: null,
    physics: null,
    input: {
      x: 0,
      y: 0,
      mouseX: 0,
      mouseY: 0,
    },
    editButton: false,
  });

  // Initialize PlayCanvas and Ammo.js
  const initializeGame = async () => {
    try {
      const gfxOptions = {
        deviceTypes: [deviceType],
        glslangUrl: "/public/lib/glslang/glslang.js",
        twgslUrl: "/public/lib/twgsl/twgsl.js",
      };

      // Initialize Ammo.js
      await initAmmo();

      //Load Draco.js
      await loadDracoDecoder(pc);

      // Create canvas configuration
      const devicePixelRatio = window.devicePixelRatio;
      const canvas = canvasRef.current;
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

      // Create PlayCanvas application with proper configuration
      const app = new pc.Application(canvas, createOptions);

      ChanegColor(extendedPc);

      // First Person Camera Script
      FpsPlaycanvas(pc, canvasRef);

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
        gravity: [0, -18, 0],
        maxSubSteps: 5,
        fixedTimeStep: 1 / 60,
      });

      gameRef.current.app = app;
      console.log("PlayCanvas application created");

      app.start();

      // Configure scene

      setupScene(app);
      setApp(app);
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  };

  // Set up the 3D scene
  const setupScene = (app) => {
    SetSkybox(pc, app);

    // Create a Plane
    const plane = new pc.Entity("iframe TV");
    // plane.addComponent("render", { type: "plane" });

    const newURL = getYoutubeEmbedSrc(URL);

    plane.setEulerAngles(180, -90, 270);
    plane.setLocalPosition(4, 3, 4);
    plane.setLocalScale(1, 1, 1);

    // plane.setEulerAngles(90, 0, 0);
    // plane.setLocalPosition(0, 3, -1.4391355514526367);

    app.root.addChild(plane);

    const childPlane = new pc.Entity("ChildPlane");

    // Set position and scale of the child entity
    // childPlane.setLocalPosition(-0.367, 0.877, 0.709); // Position relative to the parent
    // childPlane.setLocalScale(1.492, 1, 1.305);
    childPlane.setEulerAngles(180, -90, 270);
    childPlane.setLocalPosition(4, 3, 4);

    // Add a render component to the child (for example, to display a texture)
    childPlane.addComponent("render", {
      type: "cube",
    });

    // Add the child entity to the parent plane
    app.root.addChild(childPlane);

    const cameraEntity = new pc.Entity("camera");
    cameraEntity.addComponent("camera", {
      farClip: 100,
      fov: 60,
    });
    cameraEntity.setLocalPosition(0, 0.5, 0);

    cameraEntity.camera.layers = [
      pc.LAYERID_WORLD,
      pc.LAYERID_DEPTH,
      pc.LAYERID_SKYBOX,
      pc.LAYERID_IMMEDIATE,
      pc.LAYERID_UI,
    ];

    gameRef.current.camera = cameraEntity;

    const characterController = CreateCharacterController(pc, cameraEntity);
    characterController.setPosition(2, 4, 10);
    app.root.addChild(characterController);

    childPlane.addComponent("script");
    childPlane.script.create("iframePlane", {
      attributes: {
        iframeUrl: newURL,
        pixelsPerUnit: 320,
      },
    });

    const layer = pc.Gizmo.createLayer(app);
    const newGizmo = new pc.TranslateGizmo(cameraEntity.camera, layer);
    const changeGizmo = new pc.ScaleGizmo(cameraEntity.camera, layer);

    //Loading the Store
    store.on("load", () => {
      const container = store.resource;
      const model = container.instantiateRenderEntity();
      const scenes = container.data.gltf.scenes;
      const nodes = container.data.gltf.nodes;

      const renders = model.findComponents("render");
      console.log("Renders", renders);

      //Collider script
      model.findComponents("render").forEach((render) => {
        const entity = render.entity;
        entity.addComponent("rigidbody", {
          type: "static",
        });
        entity.addComponent("collision", {
          type: "mesh",
          renderAsset: render.asset,
        });
      });

      app.root.addChild(model);
      // app.root.addChild(modelToLoad);
    });

    app.assets.add(store);
    app.assets.load(store);

    const light = new pc.Entity();
    light.addComponent("light", {
      type: "directional",
      color: new pc.Color(1, 1, 1),
      castShadows: true,
      shadowBias: 0.2,
      shadowDistance: 16,
      normalOffsetBias: 0.05,
      intensity: 1,
    });
    light.setEulerAngles(45, 30, 0);
    app.root.addChild(light);
  };

  useEffect(() => {
    if (canvasRef.current) {
      initializeGame().catch((error) => {
        console.error("Failed to initialize game:", error);
      });
    }

    // Cleanup function
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

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        position: "relative", // Container to position absolute elements relative to it
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Full-size canvas */}
      <div className="z-10">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
        />
      </div>
    </div>
  );
};

export default Simple;
