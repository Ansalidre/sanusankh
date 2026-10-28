import { Image } from "react-native";

const EMBLEM = require("../../assets/images/emblem.png");

/** Bildmarke: goldenes Ankh-Emblem aus dem SanusAnkh-Logo (assets/brand/logo.jpg). */
export default function BrandMark({ size = 40 }) {
  return <Image source={EMBLEM} style={{ width: size, height: size, borderRadius: size * 0.23 }} accessible={false} />;
}
