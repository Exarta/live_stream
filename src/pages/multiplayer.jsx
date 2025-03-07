// import React, { useEffect, useRef } from "react";
// import * as pc from "playcanvas";
// import { io } from "socket.io-client";

// const GameScene = () => {
//   const canvasRef = useRef(null);
//   const playersRef = useRef({});
//   const socketRef = useRef(null);
//     const deviceType = pc.DEVICETYPE_WEBGL2;

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     // Initialize PlayCanvas App
//     const app = new pc.Application(canvasRef.current, {
//       graphicsDeviceOptions: { alpha: true },
//     });
//     app.start();
//     app.scene.ambientLight = new pc.Color(0.5, 0.5, 0.5);

//     // Create a camera
//     const camera = new pc.Entity("camera");
//     camera.addComponent("camera", { clearColor: new pc.Color(0.2, 0.2, 0.2) });
//     camera.setLocalPosition(0, 10, 15);
//     camera.lookAt(new pc.Vec3(0, 0, 0));
//     app.root.addChild(camera);

//     // Create a directional light
//     const light = new pc.Entity("light");
//     light.addComponent("light");
//     light.setEulerAngles(45, 0, 0);
//     app.root.addChild(light);

//     // Create ground
//     const ground = new pc.Entity("ground");
//     ground.addComponent("model", { type: "box" });
//     ground.setLocalScale(20, 0.2, 10);
//     ground.addComponent("rigidbody", { type: "static" });

//     // Create a blue material
//     const blueMaterial = new pc.StandardMaterial();
//     blueMaterial.diffuse = new pc.Color(0, 0, 1); // RGB for Blue
//     blueMaterial.update();

//     // Apply the material to the ground
//     ground.model.meshInstances[0].material = blueMaterial;

//     app.root.addChild(ground);

//     // Connect to Socket.io Server
//     const socket = io("http://localhost:5000"); // Adjust for deployment URL
//     socketRef.current = socket;

//     socket.on("connect", () => {
//       console.log("✅ Connected to server with ID:", socket.id);
//     });

//     // Function to create a player entity (cube)
//     const createPlayerEntity = (id, x, y, z, color) => {
//       const entity = new pc.Entity(`player-${id}`);
//       entity.addComponent("model", { type: "box" });

//       const cameraEntity = new pc.Entity("camera");
//       cameraEntity.addComponent("camera", {
//         farClip: 100,
//         fov: 90,
//       });
//       cameraEntity.setLocalPosition(0, 0.5, 0);

//       // Set the material color
//       const material = new pc.StandardMaterial();
//       material.diffuse = new pc.Color(...color);
//       material.update();
//       entity.model.meshInstances[0].material = material;

//       entity.setLocalPosition(x, y, z);
//       app.root.addChild(entity);

//       entity.addComponent("script");
//       entity.script.create("characterController", {
//         attributes: {
//           camera: cameraEntity,
//           sensitivity: 0.2,
//           speed: 8,
//           fastSpeed: 20,
//         },
//       });

//       playersRef.current[id] = entity;
//     };

//     // Handle new player joining
//     socket.on("playerJoined", (data) => {
//       console.log("🎮 New player joined:", data.id);

//       // Convert RGB string to normalized float values for PlayCanvas
//       const color = data.color.match(/\d+/g).map((num) => parseInt(num) / 255);

//       createPlayerEntity(data.id, data.x, data.y, data.z, color);
//     });

//     // Handle receiving existing players
//     socket.on("existingPlayers", (players) => {
//       Object.values(players).forEach((player) => {
//         const color = player.color
//           .match(/\d+/g)
//           .map((num) => parseInt(num) / 255);
//         createPlayerEntity(player.id, player.x, player.y, player.z, color);
//       });
//     });

//     // Handle player movement updates
//     socket.on("playerMoved", (data) => {
//       if (playersRef.current[data.id]) {
//         playersRef.current[data.id].setLocalPosition(data.x, data.y, data.z);
//       }
//     });

//     // Handle player leaving
//     socket.on("playerLeft", (id) => {
//       console.log("❌ Player left:", id);
//       if (playersRef.current[id]) {
//         playersRef.current[id].destroy();
//         delete playersRef.current[id];
//       }
//     });

//     // Send player position updates periodically
//     const updatePosition = () => {
//       if (socket.id && playersRef.current[socket.id]) {
//         const playerEntity = playersRef.current[socket.id];
//         socket.emit("updatePosition", {
//           id: socket.id,
//           x: playerEntity.getLocalPosition().x,
//           y: playerEntity.getLocalPosition().y,
//           z: playerEntity.getLocalPosition().z,
//         });
//       }
//     };

//     app.on("update", updatePosition);

//     return () => {
//       app.destroy();
//       socket.disconnect();
//     };
//   }, []);

//   return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
// };

// export default GameScene;
import React, { useEffect, useRef, useState } from "react";
import * as pc from "playcanvas";
import { io } from "socket.io-client";
import { initAmmo } from "../../public/scripts/ammo-draco-loader"; // Ensure the path is correct
import { FpsPlaycanvas } from "../components/fps-script";

const GameScene = () => {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const playersRef = useRef({});
  const socketRef = useRef(null);
  const deviceType = pc.DEVICETYPE_WEBGL2;

  useEffect(() => {
    const initializeGame = async () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;

      // Initialize Ammo.js for physics
      await initAmmo();

      const gfxOptions = {
        deviceTypes: [deviceType],
        glslangUrl: "/public/lib/glslang/glslang.js",
        twgslUrl: "/public/lib/twgsl/twgsl.js",
        antialias: true,
        powerPreference: "high-performance",
      };
      console.log("⚡ Ammo.js physics initialized!");

      // Initialize PlayCanvas
      const device = await pc.createGraphicsDevice(canvas, gfxOptions);
      if (!device) {
        console.error("Failed to create WebGL device.");
        return;
      }

      const createOptions = new pc.AppOptions();
      createOptions.graphicsDevice = device;
      createOptions.mouse = new pc.Mouse(canvas);
      createOptions.touch = new pc.TouchDevice(canvas);
      createOptions.keyboard = new pc.Keyboard(document.body);
      createOptions.elementInput = new pc.ElementInput(canvas);

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
      app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
      app.setCanvasResolution(pc.RESOLUTION_AUTO);
      FpsPlaycanvas(pc);

      app.start();
      app.scene.ambientLight = new pc.Color(0.5, 0.5, 0.5);

      // Create a directional light
      const light = new pc.Entity("light");
      light.addComponent("light", { type: "directional" });
      light.setEulerAngles(45, 30, 0);
      app.root.addChild(light);

      // Create a blue ground
      const ground = new pc.Entity("ground");
      ground.addComponent("model", { type: "box" });
      ground.setLocalScale(20, 0.2, 20);

      // Add rigidbody so it can interact with physics
      ground.addComponent("rigidbody", {
        type: "static", // Static means it won't move
        restitution: 0.2, // Optional: Slight bounce effect
      });

      // Add collision component for physics interaction
      ground.addComponent("collision", {
        type: "box", // Same shape as the model
      });

      // Create a blue material
      const blueMaterial = new pc.StandardMaterial();
      blueMaterial.diffuse = new pc.Color(0, 0, 1); // Blue color
      blueMaterial.update();

      // Apply the material to the ground
      ground.model.meshInstances[0].material = blueMaterial;
      app.root.addChild(ground);

      // Connect to Socket.io Server
      const socket = io("http://172.16.15.155:5000");
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Connected to server with ID:", socket.id);
      });

      // Function to create a player entity (cube) with physics & camera
      const createPlayerEntity = async (id, x, y, z, color) => {
        const entity = new pc.Entity(`player-${id}`);
        entity.addComponent("model", { type: "box" });

        // Assign a unique color
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(...color);
        material.update();
        entity.model.meshInstances[0].material = material;

        entity.setLocalPosition(x, y, z);

        // Add physics for movement
        entity.addComponent("rigidbody", {
          type: "dynamic",
          mass: 1,
        });
        entity.addComponent("collision", {
          type: "box",
        });

        app.root.addChild(entity);

        // Create a camera for the player
        const playerCamera = new pc.Entity(`camera-${id}`);
        playerCamera.addComponent("camera", {
          farClip: 100,
          fov: 75,
        });
        playerCamera.setLocalPosition(0, 2, -5);
        entity.addChild(playerCamera); // Attach camera to player entity

        // Set the camera only for the current player
        if (id === socket.id) {
          app.scene.layers
            .getLayerById(pc.LAYERID_WORLD)
            .addCamera(playerCamera.camera);
        }

        // Add movement script (Ensure the script exists!)
        entity.addComponent("script");
        entity.script.create("characterController", {
          attributes: {
            camera: playerCamera,
            sensitivity: 0.2,
            speed: 5,
            fastSpeed: 10,
          },
        });

        playersRef.current[id] = entity;
      };

      // Handle new player joining
      socket.on("playerJoined", async (data) => {
        console.log("🎮 New player joined:", data.id);
        const color = data.color
          .match(/\d+/g)
          .map((num) => parseInt(num) / 255);
        await createPlayerEntity(data.id, data.x, data.y, data.z, color);
      });

      // Handle receiving existing players
      socket.on("existingPlayers", async (players) => {
        for (const player of Object.values(players)) {
          const color = player.color
            .match(/\d+/g)
            .map((num) => parseInt(num) / 255);
          await createPlayerEntity(
            player.id,
            player.x,
            player.y,
            player.z,
            color
          );
        }
      });

      // Handle player movement updates
      socket.on("playerMoved", (data) => {
        if (playersRef.current[data.id]) {
          playersRef.current[data.id].setLocalPosition(data.x, data.y, data.z);
        }
      });

      // Handle player leaving
      socket.on("playerLeft", (id) => {
        console.log("❌ Player left:", id);
        if (playersRef.current[id]) {
          playersRef.current[id].destroy();
          delete playersRef.current[id];
        }
      });

      // Send player position updates periodically
      // const updatePosition = () => {
      //   if (socket.id && playersRef.current[socket.id]) {
      //     const playerEntity = playersRef.current[socket.id];
      //     socket.emit("updatePosition", {
      //       id: socket.id,
      //       x: playerEntity.getLocalPosition().x,
      //       y: playerEntity.getLocalPosition().y,
      //       z: playerEntity.getLocalPosition().z,
      //     });
      //   }
      // };
      const lastPosition = { x: null, y: null, z: null };

      const updatePosition = () => {
        if (socket.id && playersRef.current[socket.id]) {
          const playerEntity = playersRef.current[socket.id];
          const newPosition = playerEntity.getLocalPosition();

          // Only send updates if the position has changed
          if (
            lastPosition.x !== newPosition.x ||
            lastPosition.y !== newPosition.y ||
            lastPosition.z !== newPosition.z
          ) {
            socket.emit("updatePosition", {
              id: socket.id,
              x: newPosition.x,
              y: newPosition.y,
              z: newPosition.z,
            });

            lastPosition.x = newPosition.x;
            lastPosition.y = newPosition.y;
            lastPosition.z = newPosition.z;
          }
        }
      };

      app.on("update", updatePosition);
      setIsLoading(false);
    };

    initializeGame();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
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
      {isLoading ? <h1>Loading...</h1> : null}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default GameScene;
