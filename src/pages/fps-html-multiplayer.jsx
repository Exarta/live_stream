// import React, { useEffect, useRef, useState } from "react";
// import { extendedPc } from "../../public/scripts/css3plane";
// import { FpsPlaycanvas } from "../components/fps-script";
// import { initAmmo } from "../../public/scripts/ammo-draco-loader";
// import { io } from "socket.io-client";
// import { ChanegColor } from "../../public/scripts/youtube";
// import { useLocation } from "react-router-dom";
// import { MiniStats } from "../components/mini-stats";
// import VideoChat from "./VideoChat";

// function getYoutubeEmbedSrc(url) {
//   const regExp = /[?&]v=([^&#]+)/;
//   const match = url.match(regExp);
//   if (match && match[1]) {
//     const videoId = match[1];
//     return `https://www.youtube.com/embed/${videoId}`;
//   }
//   return null;
// }

// const GameFpsMul = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const canvasRef = useRef(null);
//   const playersRef = useRef({}); // Store all players
//   const socketRef = useRef(null);
//   const localPlayerRef = useRef(null); // Reference to the local player entity
//   const appRef = useRef(null); // Reference to the PlayCanvas app
//   const deviceType = extendedPc.DEVICETYPE_WEBGL2;
//   const store = new extendedPc.Asset("Store", "container", {
//     url: "/models/ExportFrames.glb",
//   });
//   const URL = "https://www.youtube.com/watch?v=NG-3GDqaXvU&ab_channel=GtxPreet";
//   const [app, setApp] = useState(null);

//   const location = useLocation();
//   const playerData = location.state?.playerData;

//   //console.log(playerData);
//   if (!playerData) {
//     return (
//       <h2 className="text-center text-red-500">
//         No player data found! Go back and enter your details.
//       </h2>
//     );
//   }
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
//           //console.error("Failed to create WebGL device.");
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
//         appRef.current = app;
//         ChanegColor(extendedPc);

//         FpsPlaycanvas(extendedPc);

//         app.setCanvasFillMode(extendedPc.FILLMODE_FILL_WINDOW);
//         app.setCanvasResolution(extendedPc.RESOLUTION_AUTO);
//         app.start();
//         app.scene.ambientLight = new extendedPc.Color(0.5, 0.5, 0.5);

//         const resizeCanvas = () => {
//           const canvas = app.graphicsDevice.canvas;
//           const devicePixelRatio = window.devicePixelRatio;
//           canvas.width = window.innerWidth * devicePixelRatio;
//           canvas.height = window.innerHeight * devicePixelRatio;
//           app.graphicsDevice.updateClientRect();
//         };
//         app.on("resize", resizeCanvas);
//         resizeCanvas();

//         setApp(app);

//         MiniStats(extendedPc, app);

//         // Create a Plane
//         const plane = new extendedPc.Entity("iframe TV");

//         const newURL = getYoutubeEmbedSrc(URL);

//         // plane.setEulerAngles(180, -90, 270);
//         // plane.setLocalPosition(4, 3, 4);
//         plane.setLocalScale(1, 1, 1);

//         plane.setEulerAngles(90, 0, 0);
//         plane.setLocalPosition(0, 3, -1.4391355514526367);

//         app.root.addChild(plane);

//         const childPlane = new extendedPc.Entity("ChildPlane");

//         childPlane.setLocalPosition(-0.367, 0.877, 0.709); // Position relative to the parent
//         childPlane.setLocalScale(1.492, 1, 1.305);

//         childPlane.addComponent("render", {
//           type: "plane",
//         });

//         plane.addChild(childPlane);

//         // Connect to Socket.io Server
//         const socket = io("http://172.16.15.155:5000", {
//           transports: ["websocket"], // 🔥 Use only WebSocket transport
//         });
//         socketRef.current = socket;

//         socket.on("connect", () => {
//           //console.log("✅ Connected to server with ID:", socket.id);
//           const byteCharacters = atob(playerData.image.split(",")[1]);
//           const byteNumbers = new Array(byteCharacters.length);
//           for (let i = 0; i < byteCharacters.length; i++) {
//             byteNumbers[i] = byteCharacters.charCodeAt(i);
//           }
//           const byteArray = new Uint8Array(byteNumbers);
//           const blob = new Blob([byteArray], { type: "image/png" });

//           // Send player data (name & Blob) to server
//           const formData = new FormData();
//           formData.append("name", playerData.name);
//           formData.append("image", blob);

//           socket.emit("newPlayer", { name: playerData.name, image: blob });
//         });

//         app.assets.add(store);
//         app.assets.load(store);

//         store.on("load", () => {
//           const container = store.resource;
//           const model = container.instantiateRenderEntity();
//           //console.log(container);

//           const scenes = container.data.gltf.scenes;
//           const nodes = container.data.gltf.nodes;
//           //console.log(nodes);

//           const renders = model.findComponents("render");
//           //console.log("Renders", renders);

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

//           //console.log(renders[20]);

//           const frame02Entity = model.findByName("frame_02");
//           if (frame02Entity) {
//             // Create a texture asset
//             const textureAsset = new extendedPc.Asset(
//               "frameTexture",
//               "texture",
//               {
//                 url: "/fonts/ASTERA v2.png", // Replace with your image URL
//               }
//             );

//             app.assets.add(textureAsset);

//             textureAsset.on("load", () => {
//               const frameMaterial = new extendedPc.StandardMaterial();

//               frameMaterial.useLighting = true;

//               frameMaterial.diffuseMap = textureAsset.resource;

//               frameMaterial.update();
//               const renderEntity = app.root.findByName("frame_02");

//               if (renderEntity && renderEntity.render) {
//                 // If it has multiple mesh instances:
//                 renderEntity.render.meshInstances.forEach((meshInstance) => {
//                   meshInstance.material = frameMaterial;
//                 });
//                 //console.log(`Texture applied to frame 02`);
//               } else {
//                 //console.log(currentButtonIndex);
//                 //console.warn(`No entity found with name: frame 02`);
//               }
//             });

//             textureAsset.on("error", (err) => {
//               //console.error("Error loading texture:", err);
//             });

//             app.assets.load(textureAsset);
//           } else {
//             //console.log("Entity 'frame_02' not found.");
//           }

//           app.root.addChild(model);
//         });

//         // Function to Create Local Player (with camera and controls)
//         const createLocalPlayer = (id, x, y, z, color) => {
//           const entity = new extendedPc.Entity(`player-${id}`);
//           entity.addComponent("model", { type: "capsule" });

//           // Create Camera for the Local Player
//           const playerCamera = new extendedPc.Entity(`camera-${id}`);
//           playerCamera.addComponent("camera", {
//             farClip: 100,
//             fov: 75,
//           });
//           playerCamera.setLocalPosition(0, 0.5, 0);
//           entity.addChild(playerCamera);

//           entity.addComponent("collision", {
//             type: "capsule",
//             radius: 0.5,
//             height: 2,
//           });

//           // Assign Unique Color
//           const material = new extendedPc.StandardMaterial();
//           material.diffuse = new extendedPc.Color(...color);
//           material.update();
//           entity.model.meshInstances[0].material = material;

//           entity.setLocalPosition(x, y, z);
//           entity.addComponent("rigidbody", {
//             type: "dynamic",
//             mass: 85,
//             linearDamping: 0.9,
//             angularDamping: 0.9,
//           });

//           entity.addComponent("script");
//           entity.script.create("characterController", {
//             attributes: {
//               camera: playerCamera,
//               sensitivity: 0.2,
//               speed: 8,
//               fastSpeed: 20,
//             },
//           });

//           app.root.addChild(entity);

//           childPlane.addComponent("script");
//           childPlane.script.create("iframePlane", {
//             attributes: {
//               iframeUrl: newURL,
//               pixelsPerUnit: 320,
//             },
//           });

//           playersRef.current[id] = entity;
//           localPlayerRef.current = entity;

//           // Set up position update sending to server
//           app.on("update", (dt) => {
//             if (localPlayerRef.current) {
//               const pos = localPlayerRef.current.getPosition();
//               socket.emit("updatePosition", {
//                 x: pos.x,
//                 y: pos.y,
//                 z: pos.z,
//               });
//             }
//           });

//           return entity;
//         };

//         const fontAsset = new extendedPc.Asset("ASTERA v2", "font", {
//           url: "/public/fonts/ASTERA v2.json", // Set the correct path
//         });
//         app.assets.add(fontAsset);
//         app.assets.load(fontAsset);
//         if (!fontAsset) {
//           //console.error(
//             "❌ Font Asset Not Found! Make sure 'Arial' font is added to PlayCanvas."
//           );
//         }

//         if (fontAsset) {
//           //console.log("Font loaded");
//         }

//         const createRemotePlayer = (id, x, y, z, color, playerName, image) => {
//           const entity = new extendedPc.Entity(`player-${id}`);
//           entity.addComponent("model", { type: "capsule" });

//           entity.addComponent("collision", {
//             type: "capsule",
//             radius: 0.5,
//             height: 2,
//           });

//           // Assign Unique Color
//           const material = new extendedPc.StandardMaterial();
//           material.diffuse = new extendedPc.Color(...color);
//           material.update();
//           entity.model.meshInstances[0].material = material;

//           entity.setLocalPosition(x, y, z);
//           entity.addComponent("rigidbody", {
//             type: "kinematic",
//             mass: 20,
//           });

//           // 📌 Create Text Element (Main Front)
//           const nameTextFront = new extendedPc.Entity(`nameTextFront-${id}`);
//           nameTextFront.addComponent("element", {
//             type: "text",
//             text: playerName,
//             fontSize: 0.8,
//             fontAsset: fontAsset,
//             color: new extendedPc.Color(1, 0, 0), // 🔴 Red text
//             pivot: new extendedPc.Vec2(0.5, 0.5),
//             width: 2,
//             height: 0.5,
//           });

//           nameTextFront.setLocalPosition(0, 1.18, 0.05); // Slight offset to appear on the plane
//           nameTextFront.setLocalEulerAngles(0, 0, 0);
//           nameTextFront.setLocalScale(0.3, 0.3, 1);

//           // 📌 Create Text Element (Back Side)
//           const nameTextBack = new extendedPc.Entity(`nameTextBack-${id}`);
//           nameTextBack.addComponent("element", {
//             type: "text",
//             text: playerName,
//             fontSize: 0.8,
//             fontAsset: fontAsset,
//             color: new extendedPc.Color(1, 0, 0), // 🔴 Red text
//             pivot: new extendedPc.Vec2(0.5, 0.5),
//             width: 2,
//             height: 0.5,
//           });

//           nameTextBack.setLocalPosition(0, 1.18, -0.05); // Reverse side of the plane
//           nameTextBack.setLocalEulerAngles(0, 180, 0);
//           nameTextBack.setLocalScale(0.3, 0.4, 1);

//           // 📌 Convert Base64 to PlayCanvas Texture
//           const texture = new extendedPc.Texture(app.graphicsDevice);
//           const img = new Image();
//           img.src = `data:image/png;base64,${image}`; // Convert Base64 to image

//           img.onload = () => {
//             const canvas = document.createElement("canvas");
//             const ctx = canvas.getContext("2d");

//             // Set canvas size
//             const size = Math.min(img.width, img.height);
//             canvas.width = size;
//             canvas.height = size;

//             // Clip as Circle
//             ctx.beginPath();
//             ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
//             ctx.closePath();
//             ctx.clip();

//             // Draw image inside the clipped circle
//             ctx.drawImage(img, 0, 0, size, size);

//             texture.setSource(canvas);
//             texture.upload();
//           };

//           // 📌 Create Circular Avatar Image
//           const avatarImage = new extendedPc.Entity(`avatarImage-${id}`);
//           avatarImage.addComponent("element", {
//             type: "image",
//             width: 0.5,
//             height: 0.5,
//             opacity: 1,
//             texture: texture, // Apply Base64 texture
//           });

//           avatarImage.setLocalPosition(-0.25, 1.35, 0); // Position slightly to the side
//           avatarImage.setLocalScale(1, 1, 1);

//           // 📌 Create Circular Avatar Image
//           const avatarImageBack = new extendedPc.Entity(`avatarImage-${id}`);
//           avatarImageBack.addComponent("element", {
//             type: "image",
//             width: 0.5,
//             height: 0.5,
//             opacity: 1,
//             texture: texture, // Apply Base64 texture
//           });

//           avatarImageBack.setLocalPosition(0.25, 1.35, 0); // Position slightly to the side
//           avatarImageBack.setLocalScale(1, 1, 1);
//           avatarImageBack.setLocalEulerAngles(0, 180, 0);

//           // Attach Both Nameplates to Player
//           entity.addChild(nameTextFront);
//           entity.addChild(nameTextBack);
//           entity.addChild(avatarImage);
//           entity.addChild(avatarImageBack);

//           app.root.addChild(entity);
//           playersRef.current[id] = entity;

//           return entity;
//         };

//         // Handle New Players Joining
//         socket.on("playerJoined", (data) => {
//           //console.log("🎮 New player joined:", data);
//           // Don't create a duplicate if this player already exists
//           if (playersRef.current[data.id]) return;

//           const color = data.color
//             .match(/\d+/g)
//             .map((num) => parseInt(num) / 255);

//           // Only create remote players for other clients
//           if (data.id !== socket.id) {
//             createRemotePlayer(
//               data.id,
//               data.x,
//               data.y,
//               data.z,
//               color,
//               data.name,
//               data.image
//             );
//           }
//         });

//         // Handle Existing Players
//         socket.on("existingPlayers", (players) => {
//           Object.values(players).forEach((player) => {
//             // Skip if this player already exists
//             if (playersRef.current[player.id]) return;

//             const color = player.color
//               .match(/\d+/g)
//               .map((num) => parseInt(num) / 255);

//             // Create the local player for the current client
//             if (player.id === socket.id) {
//               createLocalPlayer(player.id, player.x, player.y, player.z, color);
//             } else {
//               // Create remote players for other clients
//               createRemotePlayer(
//                 player.id,
//                 player.x,
//                 player.y,
//                 player.z,
//                 color,
//                 player.name,
//                 player.image
//               );
//             }
//           });
//         });

//         // Handle Player Movement Updates
//         socket.on("playerMoved", (data) => {
//           // Only update remote players (not the local player)
//           if (playersRef.current[data.id] && data.id !== socket.id) {
//             // Use lerping for smoother movement
//             const player = playersRef.current[data.id];
//             const targetPos = new extendedPc.Vec3(data.x, data.y, data.z);

//             // Simple lerping approach (you can improve this)
//             const currentPos = player.getPosition();
//             const lerpFactor = 0.1; // Adjust for smoother or more responsive movement

//             const newPos = new extendedPc.Vec3(
//               currentPos.x + (targetPos.x - currentPos.x) * lerpFactor,
//               currentPos.y + (targetPos.y - currentPos.y) * lerpFactor,
//               currentPos.z + (targetPos.z - currentPos.z) * lerpFactor
//             );

//             player.setPosition(newPos);
//           }
//         });

//         // Handle Player Leaving
//         socket.on("playerLeft", (id) => {
//           if (playersRef.current[id]) {
//             playersRef.current[id].destroy();
//             delete playersRef.current[id];
//           }
//         });

//         setIsLoading(false);
//       } catch (error) {
//         //console.error("Error initializing PlayCanvas:", error);
//       }
//     };

//     initializeGame();

//     // Cleanup function
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//       if (appRef.current) {
//         appRef.current.destroy();
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

//   return (
//     <>
//       {/* The PlayCanvas canvas (full screen) */}
//       <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

//       {/* The floating video chat UI */}
//       <VideoChat
//         style={{
//           position: "absolute",
//           top: "1rem",
//           left: "1rem",
//           zIndex: 10,
//         }}
//       />
//     </>
//   );
// };

// export default GameFpsMul;

import React, { useEffect, useRef, useState } from "react";
import { extendedPc } from "../../public/scripts/css3plane";
import { FpsPlaycanvas } from "../components/fps-script";
import { initAmmo } from "../../public/scripts/ammo-draco-loader";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { MiniStats } from "../components/mini-stats";
import VideoChat from "./VideoChat";
import { ChangeColor } from "../../public/scripts/youtube";
import { SetSkyboxDds } from "../components/set-skybox";

function getYoutubeEmbedSrc(url) {
  const regExp = /[?&]v=([^&#]+)/;
  const match = url.match(regExp);
  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
}

const GameFpsMul = () => {
  const [isLoading, setIsLoading] = useState(true);
  const playersRef = useRef({}); // Store all players
  const socketRef = useRef(null);
  const localPlayerRef = useRef(null); // Reference to the local player entity
  const appRef = useRef(null); // Reference to the PlayCanvas app
  const deviceType = extendedPc.DEVICETYPE_WEBGL2;
  const store = new extendedPc.Asset("Store", "container", {
    url: "/models/ExportFrames.glb",
  });
  const URL = "https://www.youtube.com/embed/F2JCjVSZlG0?si=y6INKPfGaH9syR2n";
  const [app, setApp] = useState(null);

  const location = useLocation();
  const playerData = location.state?.playerData;

  //console.log(playerData);
  if (!playerData) {
    return (
      <h2 className="text-center text-red-500">
        No player data found! Go back and enter your details.
      </h2>
    );
  }

  useEffect(() => {
    const initializeGame = async () => {
      const canvas = document.getElementById("application-canvas");
      if (!canvas) return;

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
          //console.error("Failed to create WebGL device.");
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
        appRef.current = app;
        ChangeColor(extendedPc, app);

        FpsPlaycanvas(extendedPc);

        app.setCanvasFillMode(extendedPc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(extendedPc.RESOLUTION_AUTO);
        app.start();
        app.scene.ambientLight = new extendedPc.Color(0.5, 0.5, 0.5);

        const resizeCanvas = () => {
          const canvas = app.graphicsDevice.canvas;
          const devicePixelRatio = window.devicePixelRatio;
          canvas.width = window.innerWidth * devicePixelRatio;
          canvas.height = window.innerHeight * devicePixelRatio;
          app.graphicsDevice.updateClientRect();
        };
        app.on("resize", resizeCanvas);
        resizeCanvas();

        setApp(app);

        let beforeWorld = app.scene.layers.getLayerByName("Before World");
        if (!beforeWorld) {
          beforeWorld = new extendedPc.Layer({ name: "Before World" });
          app.scene.layers.insert(beforeWorld, 0);
        }

        const immediateLayer = app.scene.layers.getLayerByName("Immediate");
        immediateLayer.opaqueSortMode = extendedPc.SORTMODE_NONE;

        const uiLayer = app.scene.layers.getLayerByName("UI");
        uiLayer.opaqueSortMode = extendedPc.SORTMODE_MANUAL;
        uiLayer.transparentSortMode = extendedPc.SORTMODE_MANUAL;

        const skyboxLayer = app.scene.layers.getLayerByName("Skybox");
        skyboxLayer.opaqueSortMode = extendedPc.SORTMODE_NONE;

        MiniStats(extendedPc, app);
        SetSkyboxDds(app);

        console.log(app.scene.layers.layerList);
        console.log(beforeWorld.id);

        const childPlane = new extendedPc.Entity("ChildPlane");

        childPlane.setLocalPosition(0, 3, -1.4391355514526367); // Position relative to the parent
        childPlane.setLocalScale(1.492, 1, 1.305);
        childPlane.setEulerAngles(90, 0, 0);

        childPlane.addComponent("render", {
          type: "plane",
        });

        childPlane.render.castShadows = true;
        childPlane.render.castShadowsLightmap = true;
        childPlane.render.receiveShadows = true;
        childPlane.render.layers = [beforeWorld.id];

        app.root.addChild(childPlane);

        // Connect to Socket.io Server
        const socket = io("https://livestream-backend.tenant-7654b5-asrpods.ord1.ingress.coreweave.cloud/", {
          transports: ["websocket"], // 🔥 Use only WebSocket transport
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          //console.log("✅ Connected to server with ID:", socket.id);
          const byteCharacters = atob(playerData.image.split(",")[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "image/png" });

          // Send player data (name & Blob) to server
          const formData = new FormData();
          formData.append("name", playerData.name);
          formData.append("image", blob);

          socket.emit("newPlayer", { name: playerData.name, image: blob });
        });

        app.assets.add(store);
        app.assets.load(store);

        store.on("load", () => {
          const container = store.resource;
          const model = container.instantiateRenderEntity();
          //console.log(container);

          const scenes = container.data.gltf.scenes;
          const nodes = container.data.gltf.nodes;
          //console.log(nodes);

          const renders = model.findComponents("render");
          //console.log("Renders", renders);

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

          //console.log(renders[20]);

          const frame02Entity = model.findByName("frame_02");
          if (frame02Entity) {
            // Create a texture asset
            const textureAsset = new extendedPc.Asset(
              "frameTexture",
              "texture",
              {
                url: "/fonts/ASTERA v2.png", // Replace with your image URL
              }
            );

            app.assets.add(textureAsset);

            textureAsset.on("load", () => {
              const frameMaterial = new extendedPc.StandardMaterial();

              frameMaterial.useLighting = true;

              frameMaterial.diffuseMap = textureAsset.resource;

              frameMaterial.update();
              const renderEntity = app.root.findByName("frame_02");

              if (renderEntity && renderEntity.render) {
                // If it has multiple mesh instances:
                renderEntity.render.meshInstances.forEach((meshInstance) => {
                  meshInstance.material = frameMaterial;
                });
                //console.log(`Texture applied to frame 02`);
              } else {
                //console.log(currentButtonIndex);
                //console.warn(`No entity found with name: frame 02`);
              }
            });

            textureAsset.on("error", (err) => {
              //console.error("Error loading texture:", err);
            });

            app.assets.load(textureAsset);
          } else {
            //console.log("Entity 'frame_02' not found.");
          }

          app.root.addChild(model);
        });

        // Function to Create Local Player (with camera and controls)
        const createLocalPlayer = (id, x, y, z, color) => {
          const entity = new extendedPc.Entity(`player`);
          entity.addComponent("model", { type: "capsule" });

          // Create Camera for the Local Player
          const playerCamera = new extendedPc.Entity(`camera`);
          playerCamera.addComponent("camera", {
            farClip: 100,
            fov: 75,
          });
          playerCamera.setLocalPosition(0, 0.5, 0);
          playerCamera.camera.clearColorBuffer = true;
          playerCamera.camera.clearDepthBuffer = true;
          playerCamera.camera.clearColor = new extendedPc.Color(0, 0, 0);
          playerCamera.camera.frustumCulling = true;

          playerCamera.camera.layers = [
            extendedPc.LAYERID_WORLD,
            extendedPc.LAYERID_DEPTH,
            extendedPc.LAYERID_SKYBOX,
            extendedPc.LAYERID_IMMEDIATE,
            extendedPc.LAYERID_UI,
            beforeWorld.id,
          ];
          entity.addChild(playerCamera);

          entity.addComponent("collision", {
            type: "capsule",
            radius: 0.5,
            height: 2,
          });

          // Assign Unique Color
          const material = new extendedPc.StandardMaterial();
          material.diffuse = new extendedPc.Color(...color);
          material.update();
          entity.model.meshInstances[0].material = material;

          entity.setLocalPosition(x, y, z);
          entity.addComponent("rigidbody", {
            type: "dynamic",
            mass: 85,
            linearDamping: 0.9,
            angularDamping: 0.9,
          });

          entity.addComponent("script");
          entity.script.create("characterController", {
            attributes: {
              camera: playerCamera,
              sensitivity: 0.2,
              speed: 8,
              fastSpeed: 20,
            },
          });

          app.root.addChild(entity);

          childPlane.addComponent("script");
          childPlane.script.create("iframePlane", {
            attributes: {
              iframeUrl: URL,
              pixelsPerUnit: 320,
            },
          });

          playersRef.current[id] = entity;
          localPlayerRef.current = entity;

          // Set up position update sending to server
          app.on("update", (dt) => {
            if (localPlayerRef.current) {
              const pos = localPlayerRef.current.getPosition();
              socket.emit("updatePosition", {
                x: pos.x,
                y: pos.y,
                z: pos.z,
              });
            }
          });

          return entity;
        };

        const fontAsset = new extendedPc.Asset("ASTERA v2", "font", {
          url: "/public/fonts/ASTERA v2.json", // Set the correct path
        });
        app.assets.add(fontAsset);
        app.assets.load(fontAsset);
        if (!fontAsset) {
          //console.error(
          //   "❌ Font Asset Not Found! Make sure 'Arial' font is added to PlayCanvas."
          // );
        }

        if (fontAsset) {
          //console.log("Font loaded");
        }

        const createRemotePlayer = (id, x, y, z, color, playerName, image) => {
          const entity = new extendedPc.Entity(`player-${id}`);
          entity.addComponent("model", { type: "capsule" });

          entity.addComponent("collision", {
            type: "capsule",
            radius: 0.5,
            height: 2,
          });

          // Assign Unique Color
          const material = new extendedPc.StandardMaterial();
          material.diffuse = new extendedPc.Color(...color);
          material.update();
          entity.model.meshInstances[0].material = material;

          entity.setLocalPosition(x, y, z);
          entity.addComponent("rigidbody", {
            type: "kinematic",
            mass: 85,
          });

          // 📌 Create Text Element (Main Front)
          const nameTextFront = new extendedPc.Entity(`nameTextFront-${id}`);
          nameTextFront.addComponent("element", {
            type: "text",
            text: playerName,
            fontSize: 0.8,
            fontAsset: fontAsset,
            color: new extendedPc.Color(1, 0, 0), // 🔴 Red text
            pivot: new extendedPc.Vec2(0.5, 0.5),
            width: 2,
            height: 0.5,
          });

          nameTextFront.setLocalPosition(0, 1.18, 0.05); // Slight offset to appear on the plane
          nameTextFront.setLocalEulerAngles(0, 0, 0);
          nameTextFront.setLocalScale(0.3, 0.3, 1);

          // 📌 Create Text Element (Back Side)
          const nameTextBack = new extendedPc.Entity(`nameTextBack-${id}`);
          nameTextBack.addComponent("element", {
            type: "text",
            text: playerName,
            fontSize: 0.8,
            fontAsset: fontAsset,
            color: new extendedPc.Color(1, 0, 0), // 🔴 Red text
            pivot: new extendedPc.Vec2(0.5, 0.5),
            width: 2,
            height: 0.5,
          });

          nameTextBack.setLocalPosition(0, 1.18, -0.05); // Reverse side of the plane
          nameTextBack.setLocalEulerAngles(0, 180, 0);
          nameTextBack.setLocalScale(0.3, 0.4, 1);

          // 📌 Convert Base64 to PlayCanvas Texture
          const texture = new extendedPc.Texture(app.graphicsDevice);
          const img = new Image();
          img.src = `data:image/png;base64,${image}`; // Convert Base64 to image

          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Set canvas size
            const size = Math.min(img.width, img.height);
            canvas.width = size;
            canvas.height = size;

            // Clip as Circle
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // Draw image inside the clipped circle
            ctx.drawImage(img, 0, 0, size, size);

            texture.setSource(canvas);
            texture.upload();
          };

          // 📌 Create Circular Avatar Image
          const avatarImage = new extendedPc.Entity(`avatarImage-${id}`);
          avatarImage.addComponent("element", {
            type: "image",
            width: 0.5,
            height: 0.5,
            opacity: 1,
            texture: texture, // Apply Base64 texture
          });

          avatarImage.setLocalPosition(-0.25, 1.35, 0); // Position slightly to the side
          avatarImage.setLocalScale(1, 1, 1);

          // 📌 Create Circular Avatar Image
          const avatarImageBack = new extendedPc.Entity(`avatarImage-${id}`);
          avatarImageBack.addComponent("element", {
            type: "image",
            width: 0.5,
            height: 0.5,
            opacity: 1,
            texture: texture, // Apply Base64 texture
          });

          avatarImageBack.setLocalPosition(0.25, 1.35, 0); // Position slightly to the side
          avatarImageBack.setLocalScale(1, 1, 1);
          avatarImageBack.setLocalEulerAngles(0, 180, 0);

          // Attach Both Nameplates to Player
          entity.addChild(nameTextFront);
          entity.addChild(nameTextBack);
          entity.addChild(avatarImage);
          entity.addChild(avatarImageBack);

          app.root.addChild(entity);
          playersRef.current[id] = entity;

          return entity;
        };

        // Handle New Players Joining
        socket.on("playerJoined", (data) => {
          //console.log("🎮 New player joined:", data);
          // Don't create a duplicate if this player already exists
          if (playersRef.current[data.id]) return;

          const color = data.color
            .match(/\d+/g)
            .map((num) => parseInt(num) / 255);

          // Only create remote players for other clients
          if (data.id !== socket.id) {
            createRemotePlayer(
              data.id,
              data.x,
              data.y,
              data.z,
              color,
              data.name,
              data.image
            );
          }
        });

        // Handle Existing Players
        socket.on("existingPlayers", (players) => {
          Object.values(players).forEach((player) => {
            // Skip if this player already exists
            if (playersRef.current[player.id]) return;

            const color = player.color
              .match(/\d+/g)
              .map((num) => parseInt(num) / 255);

            // Create the local player for the current client
            if (player.id === socket.id) {
              createLocalPlayer(player.id, player.x, player.y, player.z, color);
            } else {
              // Create remote players for other clients
              createRemotePlayer(
                player.id,
                player.x,
                player.y,
                player.z,
                color,
                player.name,
                player.image
              );
            }
          });
        });

        // Handle Player Movement Updates
        socket.on("playerMoved", (data) => {
          // Only update remote players (not the local player)
          if (playersRef.current[data.id] && data.id !== socket.id) {
            // Use lerping for smoother movement
            const player = playersRef.current[data.id];
            const targetPos = new extendedPc.Vec3(data.x, data.y, data.z);

            // Simple lerping approach (you can improve this)
            const currentPos = player.getPosition();
            const lerpFactor = 0.1; // Adjust for smoother or more responsive movement

            const newPos = new extendedPc.Vec3(
              currentPos.x + (targetPos.x - currentPos.x) * lerpFactor,
              currentPos.y + (targetPos.y - currentPos.y) * lerpFactor,
              currentPos.z + (targetPos.z - currentPos.z) * lerpFactor
            );

            player.setPosition(newPos);
          }
        });

        // Handle Player Leaving
        socket.on("playerLeft", (id) => {
          if (playersRef.current[id]) {
            playersRef.current[id].destroy();
            delete playersRef.current[id];
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing PlayCanvas:", error);
      }
    };

    initializeGame();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (appRef.current) {
        appRef.current.destroy();
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
    <>
      {/* The PlayCanvas canvas (full screen) */}
      <canvas id="application-canvas" className=" inset-5" />

      {/* The floating video chat UI */}
      <VideoChat
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          zIndex: 50,
        }}
      />
    </>
  );
};

export default GameFpsMul;
