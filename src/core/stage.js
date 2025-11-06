import { Renderer } from "expo-three";
import * as THREE from "three";
import SelectionControls from "../lib/selectionControls";

export default class Stage {
  constructor(gl, width, height) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.controls = []; // store all manager instances
  }

  loadStage() {
    const gl = this.gl;
    this.renderer = new Renderer({ gl });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x202020);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 3;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // === Add managers ===
    this.selectionControls = new SelectionControls(this.scene, this.camera, this.renderer);
    this.selectionControls.enable();
    this.controls.push(this.selectionControls);

    this.animate();
  }

  // === Touch Broadcasts ===
  onTouchStart(x, y) {
    this.controls.forEach((ctrl) => ctrl.enabled && ctrl.onTouchStart?.(x, y));
  }
  onTouchMove(x, y) {
    this.controls.forEach((ctrl) => ctrl.enabled && ctrl.onTouchMove?.(x, y));
  }
  onTouchEnd() {
    this.controls.forEach((ctrl) => ctrl.enabled && ctrl.onTouchEnd?.());
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
    this.gl.endFrameEXP();
  }
}
