// Script pour générer les icônes à partir du logo SVG
// Nécessite sharp: npm install sharp

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Obtenir le chemin du répertoire courant (équivalent de __dirname en ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleur principale
const PRIMARY_COLOR = '#1a73e8';

// Fonction pour créer un répertoire s'il n'existe pas
async function ensureDirectoryExists(directory) {
  try {
    await fs.promises.mkdir(directory, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Fonction pour générer une image PNG à partir du SVG
async function generatePNG(svgBuffer, size, outputPath) {
  try {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Image générée: ${outputPath}`);
  } catch (error) {
    console.error(`Erreur lors de la génération de l'image ${outputPath}:`, error);
  }
}

// Fonction pour générer un SVG carré avec le texte "EVS CATALA"
async function generateLogoSVG() {
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="512" height="512" rx="102" fill="${PRIMARY_COLOR}" />
      <text x="256" y="280" font-family="Arial, sans-serif" font-size="200" text-anchor="middle" font-weight="bold" fill="white">EVS</text>
      <text x="256" y="380" font-family="Arial, sans-serif" font-size="90" text-anchor="middle" font-weight="bold" fill="white">CATALA</text>
    </svg>
  `;
  
  return Buffer.from(svgContent);
}

// Fonction pour générer un SVG d'image OpenGraph (1200x630)
async function generateOpenGraphSVG() {
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="white" />
      <rect x="50" y="50" width="1100" height="530" rx="20" fill="${PRIMARY_COLOR}" />
      <text x="600" y="250" font-family="Arial, sans-serif" font-size="100" text-anchor="middle" font-weight="bold" fill="white">Portail</text>
      <text x="600" y="380" font-family="Arial, sans-serif" font-size="140" text-anchor="middle" font-weight="bold" fill="white">EVS CATALA</text>
      <text x="600" y="480" font-family="Arial, sans-serif" font-size="40" text-anchor="middle" fill="white">Plateforme de gestion associative</text>
    </svg>
  `;
  
  return Buffer.from(svgContent);
}

// Fonction principale
async function main() {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    await ensureDirectoryExists(publicDir);
    
    // Générer le logo SVG
    const logoSvgBuffer = await generateLogoSVG();
    
    // Générer l'image OpenGraph
    const openGraphSvgBuffer = await generateOpenGraphSVG();
    
    // Générer les images PNG
    const sizes = [
      { name: 'logo-192x192.png', size: 192 },
      { name: 'logo-512x512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'favicon.png', size: 64 }
    ];
    
    for (const { name, size } of sizes) {
      await generatePNG(logoSvgBuffer, size, path.join(publicDir, name));
    }
    
    // Générer l'image OpenGraph
    await generatePNG(openGraphSvgBuffer, 1200, path.join(publicDir, 'opengraph-image.png'));
    
    console.log('Toutes les images ont été générées avec succès!');
  } catch (error) {
    console.error('Erreur lors de la génération des images:', error);
  }
}

main(); 