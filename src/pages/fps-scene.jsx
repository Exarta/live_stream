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

const Game = () => {
  const canvasRef = useRef(null);
  const deviceType = pc.DEVICETYPE_WEBGL2;
  const imageUrl = "/public/images/dicesPNG.png";
  let framesIds, editableIds;
  let currentButtonIndex = null;
  // let gizmo, gizmo1;
  var result;
  const [tilingX, setTilingX] = useState(3);
  const [tilingY, setTilingY] = useState(8);
  let activeEditingAsset = null;
  const buttonTextureUrl = "/public/images/square.png";
  const [isUIHovered, setIsUIHovered] = useState(false);
  const [app, setApp] = useState(null);
  const [gizmo, setGizmo] = useState(null); // State to store gizmo instance

  const store = new pc.Asset("Store", "container", {
    url: "/models/Tree with Animation.glb",
  });
  const fog = new pc.Asset("Store", "container", {
    url: "/models/fog.glb",
  });
  const store1038 = new pc.Asset("Store", "container", {
    url: "/models/Store 1038.glb",
  });
  const [storeContainer, setStoreContainer] = useState(null);
  const [scaleGizmo, setScaleGizmo] = useState(null);
  const URL = "https://www.youtube.com/watch?v=NG-3GDqaXvU&ab_channel=GtxPreet";
  const fileInputRef = useRef(null);

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

      var Raycast = pc.createScript("raycast");

      Raycast.attributes.add("camera", {
        type: "entity",
        title: "Camera Entity",
      });
      Raycast.prototype.initialize = function () {
        // this.cameraEntity = this.app.root.findByName("camera");

        this.cameraEntity = this.camera || this.entity.findByName("camera");
        // Add a mousedown event handler
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this);
      };

      Raycast.prototype.mouseDown = function (e) {
        if (
          e.event &&
          e.event.target.closest &&
          e.event.target.closest(".overlay-element")
        ) {
          console.log("Raycast blocked by overlay element.");
          return; // Ignore events on the overlay
        }
        if (!gameRef.current.editButton) {
          return; // Exit if not in edit mode
        } else if (gameRef.current.editButton) this.doRaycast(e);
      };

      Raycast.prototype.doRaycast = function (screenPosition) {
        if (!gameRef.current.editButton) {
          return;
        }
        var from = this.cameraEntity.getPosition();
        var to = this.cameraEntity.camera.screenToWorld(
          screenPosition.x,
          screenPosition.y,
          this.cameraEntity.camera.farClip
        );

        // Raycast between the two points
        result = this.app.systems.rigidbody.raycastFirst(from, to);
        // if (gameRef.current.editButton)
        console.log("Raycasting result", result.entity);
      };

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

    // Create a new entity, call it “RaycastEntity”
    const raycastEntity = new pc.Entity("RaycastEntity");

    // Add a script component
    raycastEntity.addComponent("script");

    // Create an instance of “raycast” script on it
    // Pass in the cameraEntity you already have
    raycastEntity.script.create("raycast", {
      attributes: {
        camera: cameraEntity,
      },
    });

    app.root.addChild(raycastEntity);

    const characterController = CreateCharacterController(pc, cameraEntity);
    characterController.setPosition(2, 4, 10);
    app.root.addChild(characterController);

    const layer = pc.Gizmo.createLayer(app);
    const newGizmo = new pc.TranslateGizmo(cameraEntity.camera, layer);
    const changeGizmo = new pc.ScaleGizmo(cameraEntity.camera, layer);

    //Loading the Store
    store.on("load", () => {
      const container = store.resource;
      const model = container.instantiateRenderEntity();

      console.log(container);

      // const scenes = container.data.gltf.scenes;
      // const nodes = container.data.gltf.nodes;
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

    store1038.on("load", () => {
      const container = store1038.resource;
      const model = container.instantiateRenderEntity();

      console.log(container);

      // const scenes = container.data.gltf.scenes;
      // const nodes = container.data.gltf.nodes;
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

    app.assets.add(store1038);
    app.assets.load(store1038);

    fog.on("load", () => {
      const container = store.resource;
      const model = container.instantiateRenderEntity();

      console.log(container);

      // const scenes = container.data.gltf.scenes;
      // const nodes = container.data.gltf.nodes;
      const scenes = container.data.gltf.scenes;
      const nodes = container.data.gltf.nodes;

      const renders = model.findComponents("render");
      console.log("Renders", renders);

      app.root.addChild(model);
      // app.root.addChild(modelToLoad);
    });

    app.assets.add(fog);
    app.assets.load(fog);

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
      type: "plane",
    });

    // Add the child entity to the parent plane
    // app.root.addChild(childPlane);

    // childPlane.addComponent("script");
    // childPlane.script.create("iframePlane", {
    //   attributes: {
    //     iframeUrl: newURL,
    //     pixelsPerUnit: 320,
    //   },
    // });

    const uploadButton = document.getElementById("uploadButton");
    const fileInput = document.getElementById("fileInput");

    uploadButton.addEventListener("click", () => {
      fileInput.click();
    });

    // uploadButton.addEventListener("click", () => {
    //   fileInput.click();
    // });

    // When a file is chosen, load it as a GLB model
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Use FileReader to read the .glb file as an ArrayBuffer
      const reader = new FileReader();
      reader.onload = function (e) {
        const arrayBuffer = e.target.result;

        // Create a blob from the ArrayBuffer
        const blob = new Blob([arrayBuffer], { type: "model/gltf-binary" });

        // Convert the blob into a URL for the asset
        const url = URL.createObjectURL(blob);

        // Create a container asset from the GLB
        const asset = new pc.Asset(file.name, "container", { url: url });

        // Add the asset to the application's asset registry
        app.assets.add(asset);

        // Load the asset
        asset.load((err) => {
          if (err) {
            console.error("Error loading GLB asset:", err);
            return;
          }

          // Once loaded, the asset.resource is a pc.ContainerResource
          // We can instantiate a render entity from it
          const entity = asset.resource.instantiateRenderEntity();

          // Optionally set position or rotation of the model in the scene
          entity.setLocalPosition(0, 0, 0);

          // Add the entity to the scene
          app.root.addChild(entity);

          console.log("GLB model added to the scene:", file.name);
        });
      };

      // Read the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    });

    // Setup lighting
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
      // if (gameRef.current.app) {
      //   gameRef.current.app.destroy();
      // }
      // // Remove Ammo.js script if it exists
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

      {/* Upload Button over the canvas (top left) */}
      <button
        className="absolute top-4 left-4 z-20 bg-blue-500 text-white px-4 py-2 rounded"
        id="uploadButton"
      >
        Upload GLB
      </button>

      {/* Hidden file input for GLB files */}
      <input
        type="file"
        accept=".glb"
        id="fileInput"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default Game;
