import * as THREE from "three";

export default class SelectionControls {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.raycaster = new THREE.Raycaster();
    this.selectedObjects = [];
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
    console.log("SelectionControls enabled");
  }

  disable() {
    this.enabled = false;
    this.clearSelection();
    console.log("SelectionControls disabled");
  }

  onTouchStart(x, y) {
    console.log('touchStart');
    if (!this.enabled) return;
    this.checkIntersection(x, y);
  }

  onTouchMove(x, y) {
    console.log('onTouchMove: ');
    // optional: handle drag selection or hover highlighting
  }

  onTouchEnd() {
    console.log('onTouchEnd: ');
    // optional: finalize selection, etc.
  }

  checkIntersection(x, y) {
      console.log('x: ', x);
      console.log('y: ', y);
    const width = this.renderer.width;
    const height = this.renderer.height;

    const pointer = {
      x: (x / width) * 2 - 1,
      y: -(y / height) * 2 + 1,
    };

    this.raycaster.setFromCamera(pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      this.selectedObjects = [intersects[0].object];
      console.log("Selected object:", intersects[0].object);
    } else {
      this.selectedObjects = [];
    }
  }

  clearSelection() {
    this.selectedObjects = [];
  }
}
