const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 64, 128, 192, 512];
const inputSvgDark = path.join(__dirname, '../public/logo-dark.svg');
const inputSvgLight = path.join(__dirname, '../public/logo-light.svg');
const outputDir = path.join(__dirname, '../public');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate favicon.ico (16x16, 32x32) - using dark mode for better visibility
sharp(inputSvgDark)
  .resize(32, 32)
  .toFile(path.join(outputDir, 'favicon.ico'))
  .then(() => console.log('Generated favicon.ico'))
  .catch(err => console.error('Error generating favicon.ico:', err));

// Generate PNG files for different sizes - both dark and light modes
sizes.forEach(size => {
  // Dark mode
  sharp(inputSvgDark)
    .resize(size, size)
    .toFile(path.join(outputDir, `favicon-dark-${size}x${size}.png`))
    .then(() => console.log(`Generated favicon-dark-${size}x${size}.png`))
    .catch(err => console.error(`Error generating favicon-dark-${size}x${size}.png:`, err));

  // Light mode
  sharp(inputSvgLight)
    .resize(size, size)
    .toFile(path.join(outputDir, `favicon-light-${size}x${size}.png`))
    .then(() => console.log(`Generated favicon-light-${size}x${size}.png`))
    .catch(err => console.error(`Error generating favicon-light-${size}x${size}.png:`, err));
});

// Generate apple-touch-icon - using dark mode for better visibility
sharp(inputSvgDark)
  .resize(180, 180)
  .toFile(path.join(outputDir, 'apple-touch-icon.png'))
  .then(() => console.log('Generated apple-touch-icon.png'))
  .catch(err => console.error('Error generating apple-touch-icon.png:', err)); 