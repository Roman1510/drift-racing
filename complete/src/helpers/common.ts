export const calculateCanvasSize = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  return { width, height }
}

export const calculateDimensions = () => {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  return { width: windowWidth, height: windowHeight };
};