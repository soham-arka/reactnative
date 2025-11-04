import React, { useRef, useState } from "react";
import { View, Button, StyleSheet, TouchableWithoutFeedback, SafeAreaView } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";

export default function GridPolygonScreen() {
  const glViewRef = useRef<any>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<Renderer>();
  const polygonRef = useRef<THREE.Line>();
  const addedObjectsRef = useRef<THREE.Object3D[]>([]);
  const raycaster = useRef(new THREE.Raycaster());
  const tapPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const [viewSize, setViewSize] = useState({ width: 1, height: 1 });

  const onContextCreate = async (gl: any) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-10, 10, -10, 10, 0.1, 100);
    camera.position.set(10, 20, 0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new Renderer({ gl });
    renderer.setSize(viewSize.width * 2, viewSize.height * 2);
    rendererRef.current = renderer;

    const grid = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    scene.add(grid);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([]);
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
    polygonRef.current = line;
    addedObjectsRef.current.push(line);

    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setViewSize({ width, height });

    if (!cameraRef.current || !rendererRef.current) return;

    const cam = cameraRef.current;
    const renderer = rendererRef.current;

    renderer.setSize(width, height);

    const aspect = width / height;
    const d = 10;
    cam.left = -d * aspect;
    cam.right = d * aspect;
    cam.top = d;
    cam.bottom = -d;
    cam.updateProjectionMatrix();
  };

  const handleTap = (event: any) => {
    if (!cameraRef.current || !sceneRef.current) return;
    const { locationX, locationY } = event.nativeEvent;
    const x = (locationX / viewSize.width) * 2 - 1;
    const y = -(locationY / viewSize.height) * 2 + 1;

    raycaster.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersection = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(tapPlane.current, intersection);
    if (intersection) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      sphere.position.copy(intersection);
      sceneRef.current.add(sphere);
      addedObjectsRef.current.push(sphere);
      setPoints((prev) => [...prev, intersection.clone()]);
    }
  };

  const completePolygon = () => {
    if (points.length < 3 || !polygonRef.current) return;
    const pts = [...points, points[0]];
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    polygonRef.current.geometry.dispose();
    polygonRef.current.geometry = geometry;
  };

  const handleZoom = (inward: boolean) => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    const zoomFactor = 1.25;
    cam.zoom *= inward ? zoomFactor : 1 / zoomFactor;
    cam.updateProjectionMatrix();
  };

  const clearGrid = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    const remainingObjects: THREE.Object3D[] = [];
    addedObjectsRef.current.forEach((obj) => {
      if (obj !== polygonRef.current) {
        scene.remove(obj);
        if ((obj as any).geometry) obj.geometry.dispose();
        if ((obj as any).material) (obj.material as THREE.Material).dispose();
      } else {
        remainingObjects.push(obj);
      }
    });

    addedObjectsRef.current = remainingObjects;
    setPoints([]);

    if (polygonRef.current) {
      polygonRef.current.geometry.dispose();
      polygonRef.current.geometry = new THREE.BufferGeometry().setFromPoints([]);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.glContainer} onLayout={onLayout}>
        <TouchableWithoutFeedback onPress={handleTap}>
          <GLView style={styles.glView} onContextCreate={onContextCreate} ref={glViewRef} />
        </TouchableWithoutFeedback>
      </View>

      <View style={styles.controls}>
        <Button title="Zoom In" onPress={() => handleZoom(true)} />
        <Button title="Zoom Out" onPress={() => handleZoom(false)} />
        <Button title="Complete Polygon" onPress={completePolygon} />
        <Button title="Clear Grid" onPress={clearGrid} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  glContainer: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
  },
  glView: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 8,
    borderRadius: 10,
  },
});