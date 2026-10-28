import { useState } from "react";
import { Animated } from "react-native";

/** Stabiler Animated.Value (wie RN-`useAnimatedValue`, das react-native-web nicht kennt). */
export function useAnimatedValue(initial) {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}
