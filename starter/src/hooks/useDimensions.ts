import { useEffect, useState } from "react";
import { calculateDimensions } from "../helpers/common";

const useDimensions = () => {
  const [dimensions, setDimensions] = useState(() => calculateDimensions());

  useEffect(() => {
    const handleResize = () => setDimensions(calculateDimensions());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

export default useDimensions;
