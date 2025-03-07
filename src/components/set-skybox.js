import * as pc from "playcanvas";
export function SetSkyboxDds(app) {
  app.scene.exposure = 0.6; // Matches "Exposure: 0.3"

  // app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
  // app.graphicsDevice.antialias = true; // Matches "Anti-Alias" enabled

  app.scene.skyboxMip = 2;
  app.scene.skyboxIntensity = 1; // Matches Intensity
  app.scene.clusteredLightingEnabled = true;
  app.scene.lighting.cells = new pc.Vec3(10, 3, 10);

  // console.log(app.scene.lighting);
  app.scene.lighting.maxLightsPerCell = 255;
  app.scene.lighting.shadowsEnabled = true;
  app.scene.lighting.shadowAtlasResolution = 2048;
  app.scene.lighting.shadowType = pc.SHADOW_PCF3_16F;

  app.scene.ambientLight = new pc.Color(1, 1, 1);
  // app.scene.ambientLuminance = 1;

  app.scene.lightmapSizeMultiplier = 16;
  app.scene.lightmapMaxResolution = 2048;
  app.scene.lightmapMode = 1;

  const skybox = new pc.Asset(
    "skybox",
    "cubemap",
    {
      url: "/skyboxes/cubemap/New Cubemap.dds",
    },
    {
      textures: [
        "/skyboxes/cubemap/helipad1-posx.png",
        "/skyboxes/cubemap/helipad1-negx.png",
        "/skyboxes/cubemap/helipad1-posy.png",
        "/skyboxes/cubemap/helipad1-negy.png",
        "/skyboxes/cubemap/helipad1-posz.png",
        "/skyboxes/cubemap/helipad1-negz.png",
      ],

      type: pc.SKYTYPE_INFINITE,
      // mipmaps: false,
      // filtering: pc.FILTER_LINEAR,
      name: "skybox",
      // minFilter: 5,
      // magFilter: 1,
      anisotropy: 1,
      // rgbm: true,
      // prefiltered: "sky.png.png.dds",
    }
  );
  app.assets.add(skybox);
  app.assets.load(skybox);

  // const skyboxAsset = new pc.Asset("skybox", "cubemap", {
  //   url: "/skyboxes/sky.png", // Skybox texture path
  //   // mipmaps: false,
  // });

  // console.log(skybox);

  skybox.on("load", function () {
    // const skyLayer = app.scene.layers.getLayerById(pc.LAYERID_SKYBOX);
    //skyLayer.enabled = true;
    // app.renderNextFrame = true;
    // skybox.resources[0].type = "default";
    skybox.resources[1].type = "rgbm";
    skybox.resources[2].type = "rgbm";
    skybox.resources[3].type = "rgbm";
    skybox.resources[4].type = "rgbm";
    skybox.resources[5].type = "rgbm";
    skybox.resources[6].type = "rgbm";
    app.scene.setSkybox(skybox.resources);

    // app.scene.envAtlas = skybox.resource;
    // app.scene.skyboxMip = 0; // Matches Mip level 1

    // console.log("Skybox and scene settings applied.");
  });

  //   Add the asset to the asset registry and load it
  // app.assets.add(skyboxAsset);
  // app.assets.load(skyboxAsset);
}
