import * as THREE from "three";
export class ThreeVideoRenderer {
  constructor(videoUrl, width = 512, height = 512) {
    this.videoUrl = videoUrl;
    this.width = width;
    this.height = height;

    this.initThreeJs();
    this.initYouTubeIframe();
  }
  initThreeJs() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);

    // Create Planethis.videoTexture = new THREE.Texture();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ map: this.videoTexture });
    this.plane = new THREE.Mesh(geometry, material);
    this.scene.add(this.plane);
  }
  initYouTubeIframe() {
    this.iframe = document.createElement("iframe");
    this.iframe.style.position = "absolute";
    this.iframe.style.width = `${this.width}px`;
    this.iframe.style.height = `${this.height}px`;
    this.iframe.style.opacity = "0"; // Hide the iframe
    this.iframe.src = `https://www.youtube.com/embed/${this.extractVideoID(
      this.videoUrl
    )}?autoplay=1&mute=1&loop=1&playlist=${this.extractVideoID(this.videoUrl)}`;
    document.body.appendChild(this.iframe);

    this.initCanvas();
  }
  initCanvas() {
    this.videoCanvas = document.createElement("canvas");
    this.videoCanvas.width = this.width;
    this.videoCanvas.height = this.height;
    this.videoContext = this.videoCanvas.getContext("2d");

    this.updateVideoFrame();
  }
  updateVideoFrame() {
    this.videoContext.drawImage(this.iframe, 0, 0, this.width, this.height);
    this.videoTexture.image = this.videoCanvas;
    this.videoTexture.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.updateVideoFrame());
  }

  getTexture() {
    return this.renderer.domElement;
  }

  extractVideoID(url) {
    const match = url.match(/[?&]v=([^&#]+)/);
    return match ? match[1] : "";
  }
}
