import * as pc from "playcanvas";
export function ChangeColor(extendedPc, app) {
  var IframePlane = pc.createScript("iframePlane");
  IframePlane.attributes.add("iframeUrl", { type: "string" });
  IframePlane.attributes.add("pixelsPerUnit", {
    type: "number",
    default: 640,
    description:
      "Number of canvas pixels per unit of world space. The larger the number, the higher the resolution of the iframe.",
  });

  console.log(
    "camera in iframe plane script",
    app.root.findComponent("camera")
  );

  // initialize code called once per entity
  IframePlane.prototype.initialize = function () {
    // WARNING: IframePlane does not work with touch events

    var element;

    if (this.iframeUrl) {
      element = document.createElement("iframe");
      element.src = this.iframeUrl;
      element.style.border = "0px";
    } else {
      element = null;
    }

    this._css3Plane = new extendedPc.Css3Plane(
      element,
      this.entity,
      this.pixelsPerUnit,
      app.root.findComponent("camera")
    );

    var material = new pc.StandardMaterial();
    material.depthWrite = true;
    material.redWrite = false;
    material.greenWrite = false;
    material.blueWrite = false;
    material.alphaWrite = false;
    material.blendType = pc.BLEND_NONE;
    material.opacity = 0;
    material.cull = pc.CULLFACE_BACK;
    material.update();

    this.entity.render.material = material;

    console.log("PLANE", this.entity);

    this.on(
      "enable",
      function () {
        this._css3Plane.enable();
      },
      this
    );

    this.on(
      "disable",
      function () {
        this._css3Plane.disable();
      },
      this
    );
  };
}

// import { ThreeVideoRenderer } from "./three-video-renderer";
// import * as pc from "playcanvas";

// export function ChangeColor() {
//   var IframePlane = pc.createScript("iframePlane");
//   IframePlane.attributes.add("videoUrl", { type: "string" });
//   IframePlane.prototype.initialize = function () {
//     var app = this.app;
//     var entity = this.entity;

//     this.videoRenderer = new ThreeVideoRenderer(this.videoUrl, 512, 512);

//     var videoTexture = new pc.Texture(app.graphicsDevice, {
//       format: pc.PIXELFORMAT_R8_G8_B8_A8,
//       minFilter: pc.FILTER_LINEAR,
//       magFilter: pc.FILTER_LINEAR,
//       addressU: pc.ADDRESS_CLAMP_TO_EDGE,
//       addressV: pc.ADDRESS_CLAMP_TO_EDGE,
//     });
//     videoTexture.setSource(this.videoRenderer.getTexture());

//     var material = new pc.StandardMaterial();
//     material.diffuseMap = videoTexture;
//     material.update();

//     entity.render.material = material;

//     app.on("update", function () {
//       videoTexture.upload(); // Update texture every frame
//     });
//   };
// }

// import * as pc from "playcanvas";
// import { initializeCss3Extensions } from "./css3plane";

// export function ChangeColor(app) {
//   // Initialize CSS3 extensions
//   const obj = initializeCss3Extensions(pc);

//   var IframePlane = pc.createScript("iframePlane");

//   IframePlane.attributes.add("iframeUrl", { type: "string" });
//   IframePlane.attributes.add("pixelsPerUnit", {
//     type: "number",
//     default: 640,
//     description:
//       "Number of canvas pixels per unit of world space. The larger the number, the higher the resolution of the iframe.",
//   });

//   // initialize code called once per entity
//   IframePlane.prototype.initialize = function () {
//     // WARNING: IframePlane does not work with touch events
//     var element;

//     if (this.iframeUrl) {
//       element = document.createElement("iframe");
//       element.src = this.iframeUrl;
//       element.style.border = "0px";
//       element.style.backfaceVisibility = "hidden";
//       element.style.WebkitBackfaceVisibility = "hidden";
//     } else {
//       element = null;
//     }

//     // Use the Css3Plane from PlayCanvas
//     this._css3Plane = new obj.Css3Plane(
//       element,
//       this.entity,
//       this.pixelsPerUnit,
//       app.root.findComponent("camera")
//     );

//     var material = new pc.StandardMaterial();
//     material.depthWrite = true;
//     material.redWrite = false;
//     material.greenWrite = false;
//     material.blueWrite = false;
//     material.alphaWrite = false;
//     material.blendType = pc.BLEND_NONE;
//     material.opacity = 0;
//     material.cull = pc.CULLFACE_BACK;
//     material.update();

//     this.entity.render.material = material;

//     this.on(
//       "enable",
//       function () {
//         this._css3Plane.enable();
//       },
//       this
//     );

//     this.on(
//       "disable",
//       function () {
//         this._css3Plane.disable();
//       },
//       this
//     );
//   };

//   return IframePlane;
// }
