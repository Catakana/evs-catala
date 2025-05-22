/**
 * TextLoader
 * Utilitaire pour charger et analyser les textes depuis un fichier CSV
 * 
 * Ce module permet de:
 * - Charger le fichier texts.fr.csv
 * - Analyser son contenu
 * - Construire un objet structuré pour l'utilisation dans TextBank
 */

import { APP_VARIABLES, TextCategory, TEXTS } from './textBank';

interface CSVTextEntry {
  id: string;
  text: string;
  description?: string;
}

/**
 * Charge et analyse le fichier CSV contenant les textes
 * @returns Un objet avec les textes organisés par catégorie
 */
export async function loadTextsFromCSV(): Promise<Record<TextCategory, CSVTextEntry[]>> {
  try {
    // Charger le fichier CSV
    const response = await fetch('/src/lib/texts.fr.csv');
    if (!response.ok) {
      throw new Error(`Failed to load texts.fr.csv: ${response.statusText}`);
    }

    const csvText = await response.text();
    const entries = parseCSV(csvText);
    
    // Organiser les textes par catégorie
    const result: Partial<Record<TextCategory, CSVTextEntry[]>> = {};
    
    for (const entry of entries) {
      const [category] = entry.id.split('.');
      
      if (!category) continue;
      
      const validCategory = category as TextCategory;
      if (!result[validCategory]) {
        result[validCategory] = [];
      }
      
      result[validCategory]?.push(entry);
    }
    
    // S'assurer que toutes les catégories sont présentes
    const allCategories: TextCategory[] = [
      'common', 'auth', 'agenda', 'trombinoscope', 'annonces', 
      'permanences', 'votes', 'projects', 'messages', 'infos'
    ];
    
    for (const category of allCategories) {
      if (!result[category]) {
        result[category] = [];
      }
    }
    
    return result as Record<TextCategory, CSVTextEntry[]>;
  } catch (error) {
    console.error('Error loading texts from CSV:', error);
    return {
      common: [], auth: [], agenda: [], trombinoscope: [], annonces: [],
      permanences: [], votes: [], projects: [], messages: [], infos: []
    };
  }
}

/**
 * Analyse le contenu d'un fichier CSV
 * @param csvText Texte CSV à analyser
 * @returns Tableau d'objets représentant les entrées CSV
 */
function parseCSV(csvText: string): CSVTextEntry[] {
  // Diviser par lignes
  const lines = csvText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#')); // Ignorer les commentaires
  
  if (lines.length === 0) {
    return [];
  }
  
  // Première ligne = en-têtes
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Reste des lignes = données
  const entries: CSVTextEntry[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length >= 2) {
      const entry: CSVTextEntry = {
        id: values[0],
        text: values[1]
      };
      
      if (values.length >= 3) {
        entry.description = values[2];
      }
      
      entries.push(entry);
    }
  }
  
  return entries;
}

/**
 * Analyse une ligne CSV en tenant compte des virgules dans les champs entre guillemets
 * @param line Ligne CSV à analyser
 * @returns Tableau de valeurs
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Ajouter le dernier champ
  if (current.trim().length > 0) {
    result.push(current.trim());
  }
  
  return result;
}

/**
 * Initialise le système de textes en chargeant les données depuis le CSV
 */
export async function initializeTexts(): Promise<void> {
  try {
    const loadedTexts = await loadTextsFromCSV();
    
    // Mise à jour des variables globales si présentes dans les textes chargés
    const appTexts = loadedTexts.common.filter(entry => entry.id.startsWith('app.'));
    
    for (const entry of appTexts) {
      const key = entry.id.replace('app.', '').toUpperCase();
      if (key in APP_VARIABLES) {
        (APP_VARIABLES as Record<string, string>)[key] = entry.text;
      }
    }
    
    // Mise à jour des textes dans chaque catégorie
    Object.keys(loadedTexts).forEach(category => {
      const catKey = category as TextCategory;
      if (catKey in TEXTS) {
        TEXTS[catKey] = loadedTexts[catKey];
      }
    });
    
    console.log('Texts loaded successfully from CSV');
  } catch (error) {
    console.error('Failed to initialize texts:', error);
  }
} 