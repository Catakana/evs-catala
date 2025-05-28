/**
 * Utilitaires pour la gestion des dates
 * Évite les problèmes de fuseau horaire en traitant les dates comme des heures locales
 */

/**
 * Parse une date ISO en tant qu'heure locale (évite le décalage UTC)
 * @param dateTimeString - Chaîne de date au format ISO (ex: "2025-06-02T19:00:00")
 * @returns Date object en heure locale
 */
export function parseAsLocalDateTime(dateTimeString: string): Date {
  // Si la chaîne contient déjà un indicateur de fuseau horaire, l'utiliser tel quel
  if (dateTimeString.includes('Z') || dateTimeString.includes('+') || dateTimeString.includes('-')) {
    return new Date(dateTimeString);
  }
  
  // Sinon, traiter comme une heure locale
  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Formate une date en tant qu'heure locale pour l'affichage
 * @param date - Date object
 * @returns Chaîne formatée pour l'affichage
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formate une heure en tant qu'heure locale pour l'affichage
 * @param date - Date object
 * @returns Chaîne formatée pour l'affichage (HH:MM)
 */
export function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
} 