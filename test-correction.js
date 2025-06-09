// Test per verificare la correzione del matching di Skyrim
function normalizeGameTitle(title) {
  if (!title) return '';
  let normalized = title.trim().toLowerCase();

  // Rimuovi punteggiatura comune e sostituisci con spazio
  normalized = normalized.replace(/[:\-–—_\.]/g, ' ');
  
  // Converti numeri romani in numeri arabi (con spazi intorno)
  const romanToArabic = {
    ' iii ': ' 3 ',
    ' ii ': ' 2 ',
    ' iv ': ' 4 ',
    ' v ': ' 5 ',
    ' vi ': ' 6 ',
    ' vii ': ' 7 ',
    ' viii ': ' 8 ',
    ' ix ': ' 9 ',
    ' x ': ' 10 ',
    // Anche senza spazi alla fine (per gestire fine titolo)
    ' iii': ' 3',
    ' ii': ' 2',
    ' iv': ' 4',
    ' v': ' 5',
    ' vi': ' 6',
    ' vii': ' 7',
    ' viii': ' 8',
    ' ix': ' 9',
    ' x': ' 10',
  };
  
  // Aggiungi spazi all'inizio e fine per facilitare il matching
  normalized = ' ' + normalized + ' ';
  
  for (const [roman, arabic] of Object.entries(romanToArabic)) {
    normalized = normalized.replace(roman, arabic);
  }
  
  // Rimuovi spazi multipli e trim
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

function removeEditionSuffixes(title) {
  if (!title) return '';
  
  const suffixes = [
    ' special edition',
    ' legendary edition',
    ' anniversary edition',
    ' game of the year edition',
    ' goty edition',
    ' deluxe edition',
    ' ultimate edition',
    ' complete edition',
    ' enhanced edition',
    ' definitive edition',
    ' collectors edition',
    ' platinum edition',
    ' premium edition',
    ' gold edition',
    " director's cut",
    ' remastered',
    ' remake',
    ' hd remaster',
    ' hd',
    ' redux',
    ' (2009)', ' (2010)', ' (2011)', ' (2012)', ' (2013)', ' (2014)',
    ' (2015)', ' (2016)', ' (2017)', ' (2018)', ' (2019)', ' (2020)',
    ' (2021)', ' (2022)', ' (2023)', ' (2024)', ' (2025)'
  ];
  
  let result = title.toLowerCase();
  for (const suffix of suffixes) {
    if (result.endsWith(suffix)) {
      result = result.slice(0, -suffix.length).trim();
      break;
    }
  }
  return result;
}

// Test con i titoli di Skyrim
const catalogTitle = "The Elder Scrolls V: Skyrim";
const libraryTitle = "The Elder Scrolls V: Skyrim Special Edition";

console.log('=== TEST CORREZIONE SKYRIM MATCHING ===');
console.log('Catalogo:', catalogTitle);
console.log('Libreria:', libraryTitle);
console.log('');

const normalizedCatalog = normalizeGameTitle(catalogTitle);
const normalizedLibrary = normalizeGameTitle(libraryTitle);

console.log('Normalizzati:');
console.log('  Catalogo:', normalizedCatalog);
console.log('  Libreria:', normalizedLibrary);
console.log('');

const catalogNoEdition = removeEditionSuffixes(normalizedCatalog);
const libraryNoEdition = removeEditionSuffixes(normalizedLibrary);

console.log('Dopo rimozione suffissi:');
console.log('  Catalogo:', catalogNoEdition);
console.log('  Libreria:', libraryNoEdition);
console.log('');

const shouldMatch = catalogNoEdition === libraryNoEdition;
console.log('DOVREBBERO COINCIDERE?', shouldMatch ? '✅ SÌ' : '❌ NO');

if (shouldMatch) {
  console.log('🎉 CORREZIONE RIUSCITA! I titoli ora coincidono correttamente.');
} else {
  console.log('🔍 Debug dettagliato:');
  console.log('  Catalogo final length:', catalogNoEdition.length);
  console.log('  Libreria final length:', libraryNoEdition.length);
  console.log('  Caratteri diversi:');
  for (let i = 0; i < Math.max(catalogNoEdition.length, libraryNoEdition.length); i++) {
    const c1 = catalogNoEdition[i] || '(fine)';
    const c2 = libraryNoEdition[i] || '(fine)';
    if (c1 !== c2) {
      console.log(`    Posizione ${i}: '${c1}' vs '${c2}'`);
    }
  }
}
