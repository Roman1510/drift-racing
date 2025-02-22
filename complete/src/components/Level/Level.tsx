import { Stage, Container } from "@pixi/react";
import useDimensions from "../../hooks/useDimensions";
import { PropsWithChildren } from "react";


const Level = ({ children }: PropsWithChildren) => {
  const { width, height, } = useDimensions();

  return (
    <Stage width={width} height={height} options={{ backgroundColor: 0x505059 }}>
      <Container>
        {children}
      </Container>
    </Stage>
  )
}


export default Level;