import React from 'react';
import { Text, View, StyleSheet, Dimensions } from "react-native";
import {Canvas} from '@react-three/fiber/native';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';



export default function App() {
  return <Canvas>
    <mesh position = {[0, 0, -1 ]}>
      <sphereGeometry args = {[1, 32, 32]}/>
      <meshStandardMaterial color='#f6712f' />
    </mesh> ;
<ambientLight color ='#130101'/>
<OrbitControls enablePan enableZoom enableRotate />
  </Canvas>;
}
