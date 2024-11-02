// Create this temporary file to convert your image to base64
const fs = require('fs');

const imagePath = './hb-removebg-preview.png';
const imageData = fs.readFileSync(imagePath);
const base64Image = Buffer.from(imageData).toString('base64');

console.log(`data:image/png;base64,${base64Image}`);
