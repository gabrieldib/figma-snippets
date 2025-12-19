img = figma.createImageAsync(
    'https://127.0.0.1:8000/uploads/cropped_test_eadafca5af16edd0_2025-11-03T16-20-31-456502.png')
    .then( async (image) => {
    	// Create a rectangle that's the same dimensions as the image.
  const node = figma.createRectangle()

  const { width, height } = await image.getSizeAsync()
  node.resize(width, height)

  // Render the image by filling the rectangle.
  node.fills = [
    {
      type: 'IMAGE',
      imageHash: image.hash,
      scaleMode: 'FILL'
    }
  ]
})