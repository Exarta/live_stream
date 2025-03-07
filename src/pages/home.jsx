import { useEffect, useRef, useState } from "react";

import { OrbitCamera } from "../../public/scripts/orbitCamera";
import { MouseInput } from "../../public/scripts/mouse-input";
import { ChangeColor } from "../../public/scripts/youtube";
import { extendedPc } from "../../public/scripts/css3plane";
import { SetSkyboxDds } from "../components/set-skybox";
import * as pc from "playcanvas";

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

const GameHome = () => {
  const [isloading, setisloading] = useState(true);
  const canvasRef = useRef(null);
  const deviceType = pc.DEVICETYPE_WEBGL2;
  const URL = "https://www.youtube.com/watch?v=ghgTX6T_5oc";

  useEffect(() => {
    const initializeGame = async () => {
      const canvas = document.getElementById("application-canvas");
      // const canvas = canvasRef.current;
      if (!canvas) return;

      const gfxOptions = {
        deviceTypes: [deviceType],
        glslangUrl: "/public/lib/glslang/glslang.js",
        twgslUrl: "/public/lib/twgsl/twgsl.js",
        antialias: true,
        powerPreference: "high-performance",
      };

      try {
        const device = await pc.createGraphicsDevice(canvas, gfxOptions);
        if (!device) {
          console.error("Failed to create WebGL device.");
          return;
        }

        const createOptions = new pc.AppOptions();
        createOptions.graphicsDevice = device;
        createOptions.mouse = new pc.Mouse(canvas);
        createOptions.touch = new pc.TouchDevice(canvas);
        createOptions.elementInput = new pc.ElementInput(canvas);
        createOptions.keyboard = new pc.Keyboard(document.body);

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
        ];

        const app = new pc.Application(canvas, createOptions);

        // Pass the pc object to your ChanegColor script.
        OrbitCamera();
        MouseInput(pc);

        SetSkyboxDds(app);

        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        // app.graphicsDevice.clearColor = new pc.Color(0, 0, 0, 0);

        console.log(app.graphicsDevice);
        app.start();

        let beforeWorld = app.scene.layers.getLayerByName("Before World");
        if (!beforeWorld) {
          beforeWorld = new pc.Layer({ name: "Before World" });
          app.scene.layers.insert(beforeWorld, 1);
          beforeWorld.opaqueSortMode = pc.SORTMODE_MATERIALMESH;
          beforeWorld.transparentSortMode = pc.SORTMODE_BACK2FRONT;
        }
        console.log("BEFORE WORLD LAYER", beforeWorld);

        const immediateLayer = app.scene.layers.getLayerByName("Immediate");
        console.log("IMMEDIATE LAYER", immediateLayer);
        immediateLayer.opaqueSortMode = pc.SORTMODE_NONE;

        const uiLayer = app.scene.layers.getLayerByName("UI");
        console.log("UI LAYER", uiLayer);
        uiLayer.opaqueSortMode = pc.SORTMODE_MANUAL;
        uiLayer.transparentSortMode = pc.SORTMODE_MANUAL;

        const skyboxLayer = app.scene.layers.getLayerByName("Skybox");
        console.log("SKYBOX LAYER", skyboxLayer);
        skyboxLayer.opaqueSortMode = pc.SORTMODE_NONE;
        skyboxLayer.transparentSortMode = pc.SORTMODE_BACK2FRONT;

        console.log("LAYERS", app.scene.layers);

        // Create a Camera
        const camera = new pc.Entity("camera");
        camera.addComponent("camera", {
          fov: 45,
          nearClip: 0.3,
          farClip: 2000,
        });

        camera.setPosition(-6.876, 2.39, 7.566);
        camera.setEulerAngles(-3.8, -34.8, 0);

        camera.addComponent("script");
        camera.script.create("orbitCamera", {
          attributes: {
            distanceMax: 1000,
            distanceMin: 1,
            pitchAngleMax: 90,
            pitchAngleMin: -90,
            inertiaFactor: 0,
            frameOnStart: false,
          },
        });
        camera.script.create("mouseInput", {
          attributes: {
            orbitSensitivity: 0.3,
            distanceSensitivity: 0.15,
          },
        });

        camera.camera.clearColorBuffer = true;
        camera.camera.clearDepthBuffer = true;
        camera.camera.clearColor = new pc.Color(0, 0, 0, 0);
        camera.camera.frustumCulling = true;
        camera.camera.projection = pc.PROJECTION_PERSPECTIVE;

        camera.camera.layers = [
          pc.LAYERID_WORLD,
          pc.LAYERID_DEPTH,
          pc.LAYERID_SKYBOX,
          pc.LAYERID_IMMEDIATE,
          pc.LAYERID_UI,
          // beforeWorld.id,
        ];

        app.root.addChild(camera);

        // Create Lighting
        // const light = new pc.Entity("light");
        // light.addComponent("light", { type: "directional" });
        // light.setEulerAngles(45, 30, 0);
        // app.root.addChild(light);

        const box = new pc.Entity("Box");
        box.addComponent("render", { type: "box" });

        box.setEulerAngles(90, 0, 0);
        box.setPosition(0, 0.705, -2);
        box.setLocalScale(3, 3, 3);
        app.root.addChild(box);

        box.render.layers = [pc.LAYERID_WORLD];

        // Create a Plane
        const plane = new pc.Entity("Screen");
        plane.addComponent("render", { type: "plane" });

        plane.setEulerAngles(90, 0, 0);
        plane.setPosition(0, 0.705, 0);
        plane.setLocalScale(3, 3, 3);
        app.root.addChild(plane);

        plane.render.castShadows = true;
        plane.render.castShadowsLightmap = true;
        plane.render.receiveShadows = true;
        plane.render.layers = [beforeWorld.id];

        ChangeColor(extendedPc, app);

        const newURL = getYoutubeEmbedSrc(URL);
        // Attach YouTube Video Script
        plane.addComponent("script");
        plane.script.create("iframePlane", {
          attributes: {
            iframeUrl: newURL,
            pixelsPerUnit: 320,
          },
        });

        // Apply a Transparent Material
        // const material = new pc.StandardMaterial();
        // material.opacity = 0;
        // material.update();
        // plane.render.meshInstances[0].material = material;

        // const rotationSpeed = 20; // degrees per second
        // app.on("update", (dt) => {
        //   plane.rotate(0, rotationSpeed * dt, 0);
        // });

        setisloading(false);
      } catch (error) {
        console.error("Error initializing PlayCanvas:", error);
      }
    };

    initializeGame();
  }, []);

  return <canvas id="application-canvas" />;
};
export default GameHome;
