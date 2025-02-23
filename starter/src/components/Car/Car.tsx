import { useState, useMemo } from "react";
import { Sprite } from "@pixi/react";
import { Texture } from "pixi.js";
import carAsset from '../../assets/RACECAR.png';

export const Car = () => {
  const [pos, setPos] = useState({ x: 200, y: 200, rotation: 0 });
  const texture = useMemo(() => Texture.from(carAsset), []);

  return <Sprite texture={texture} {...pos} rotation={pos.rotation + Math.PI / 2} anchor={0.5} />;
};