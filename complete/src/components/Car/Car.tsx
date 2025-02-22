import { useEffect, useRef, useState, useMemo } from "react";
import { Sprite, useTick } from "@pixi/react";
import p2 from "p2";
import { Texture } from "pixi.js";
import carAsset from '../../assets/RACECAR.png';
import { useControls } from "../../hooks/useControls";

export const Car = () => {
  const [pos, setPos] = useState({ x: 1000, y: 1000, rotation: 0 });
  const { getControlsDirection } = useControls();
  const world = useRef(new p2.World({ gravity: [0, 0] }));
  const carBody = useRef<p2.Body | null>(null);

  const PHYS = {
    width: 100, height: 40, mass: 3,
    steer: 35 * (Math.PI / 180), wheel: 100,
    engine: 900, brake: -700,
    grip: { drift: 0.3, normal: 3, lateral: 5 },
    drag: 0.3, max: 1000,
    drift: { min: 300, factor: 0.3 },
    step: 1 / 60, subs: 10
  };

  const texture = useMemo(() => Texture.from(carAsset), []);

  useEffect(() => {
    const car = new p2.Body({ mass: PHYS.mass, position: [1000, 1000] });
    car.addShape(new p2.Box({ width: PHYS.width, height: PHYS.height }));
    world.current.addBody(car);
    carBody.current = car;

    return () => {
      world.current.removeBody(car);
    };
  }, []);

  useTick((delta) => {
    if (!carBody.current) return;
    const car = carBody.current;
    const { pressedKeys } = getControlsDirection()
    const isUp = pressedKeys.includes('UP');
    const isDown = pressedKeys.includes('DOWN');
    const isLeft = pressedKeys.includes('LEFT');
    const isRight = pressedKeys.includes('RIGHT');

    // Vectors (keep tuple types)
    const forward: [number, number] = [Math.cos(car.angle), Math.sin(car.angle)];
    const right: [number, number] = [-forward[1], forward[0]];
    const vel = car.velocity as [number, number];

    // Input (identical to original)
    const steerInput = (isRight ? 1 : 0) - (isLeft ? 1 : 0);
    const targetSteer = steerInput * PHYS.steer; // Key fix: preserve steer angle scaling

    // Forces (same as original)
    let engine = 0;
    if (isUp) engine = PHYS.engine;
    else if (isDown) engine = PHYS.brake;
    if (engine) car.applyForce([forward[0] * engine, forward[1] * engine]);

    // Steering physics (critical fix)
    const fwdSpeed = p2.vec2.dot(vel, forward);
    if (steerInput !== 0 && Math.abs(fwdSpeed) > 0.1) {
      const turnRadius = PHYS.wheel / Math.tan(Math.abs(targetSteer) || 0.0001);
      car.angularVelocity = (fwdSpeed / turnRadius) * targetSteer; // Original calculation
    } else {
      car.angularVelocity *= 0.9; // Same damping
    }

    // Drift (identical logic)
    const speed = p2.vec2.length(vel);
    const isDrifting = engine > 0 &&
      steerInput !== 0 &&
      speed > PHYS.drift.min &&
      (speed / PHYS.max) > PHYS.drift.factor;

    // Lateral forces (same calculation)
    const lat = p2.vec2.dot(vel, right);
    const grip = isDrifting ? PHYS.grip.drift * (1 + speed / PHYS.max) : PHYS.grip.normal;
    car.applyForce([
      -right[0] * lat * PHYS.grip.lateral * grip,
      -right[1] * lat * PHYS.grip.lateral * grip
    ]);

    // Drag (identical)
    if (!engine) {
      car.applyForce([
        -forward[0] * fwdSpeed * PHYS.drag,
        -forward[1] * fwdSpeed * PHYS.drag
      ]);
    }

    // Same world step
    world.current.step(PHYS.step, Math.min(delta, 0.016), PHYS.subs);
    setPos({ x: car.position[0], y: car.position[1], rotation: car.angle });
  });

  return <Sprite texture={texture} {...pos} rotation={pos.rotation + Math.PI / 2} anchor={0.5} />;
};