import { GLView } from "expo-gl";
import React, { useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import Stage from "../src/core/stage";

export default function Index() {
  const stageRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (stageRef.current) {
          stageRef.current.onTouchStart(locationX, locationY);
        }
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (stageRef.current) {
          stageRef.current.onTouchMove(locationX, locationY);
        }
      },
      onPanResponderRelease: (evt) => {
        if (stageRef.current) {
          stageRef.current.onTouchEnd();
        }
      },
    })
  ).current;

  async function onContextCreate(gl) {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const stage = new Stage(gl, width, height);
    stageRef.current = stage;
    stage.loadStage();
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
});
