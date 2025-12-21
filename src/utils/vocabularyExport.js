/**
 * Vocabulary Export/Import Utility
 * Kelime listesini dışa aktarma ve içe aktarma
 */

/**
 * Kelime listesini JSON formatında dışa aktar
 * @param {Array} vocabulary - Kelime listesi
 * @param {string} filename - Dosya adı (opsiyonel)
 */
export const exportToJSON = (vocabulary, filename = 'wordbox-vocabulary') => {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    wordCount: vocabulary.length,
    words: vocabulary.map(word => ({
      word: word.word,
      turkish: word.turkish,
      definition: word.definition || '',
      phonetic: word.phonetic || '',
      partOfSpeech: word.partOfSpeech || '',
      examples: word.examples || [],
      level: word.level || 'B1',
      status: word.status || 'new',
      addedAt: word.addedAt || new Date().toISOString()
    }))
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
  
  return { success: true, wordCount: vocabulary.length };
};

/**
 * Kelime listesini CSV formatında dışa aktar
 * @param {Array} vocabulary - Kelime listesi
 * @param {string} filename - Dosya adı (opsiyonel)
 */
export const exportToCSV = (vocabulary, filename = 'wordbox-vocabulary') => {
  const headers = ['word', 'turkish', 'definition', 'phonetic', 'partOfSpeech', 'level', 'status'];
  const rows = vocabulary.map(word => [
    escapeCsvValue(word.word),
    escapeCsvValue(word.turkish),
    escapeCsvValue(word.definition || ''),
    escapeCsvValue(word.phonetic || ''),
    escapeCsvValue(word.partOfSpeech || ''),
    escapeCsvValue(word.level || 'B1'),
    escapeCsvValue(word.status || 'new')
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' }); // BOM for Excel
  downloadBlob(blob, `${filename}.csv`);
  
  return { success: true, wordCount: vocabulary.length };
};

/**
 * Kelime listesini Anki formatında dışa aktar
 * @param {Array} vocabulary - Kelime listesi
 * @param {string} filename - Dosya adı (opsiyonel)
 */
export const exportToAnki = (vocabulary, filename = 'wordbox-anki') => {
  // Anki TSV format: front\tback
  const rows = vocabulary.map(word => {
    const front = word.word + (word.phonetic ? ` [${word.phonetic}]` : '');
    const back = `${word.turkish}${word.definition ? `\n\n${word.definition}` : ''}${word.examples?.length ? `\n\nÖrnek: ${word.examples[0]}` : ''}`;
    return `${escapeTsvValue(front)}\t${escapeTsvValue(back)}`;
  });
  
  const tsvContent = rows.join('\n');
  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8' });
  downloadBlob(blob, `${filename}.txt`);
  
  return { success: true, wordCount: vocabulary.length };
};

/**
 * Kelime listesini Quizlet formatında dışa aktar
 * @param {Array} vocabulary - Kelime listesi
 * @param {string} filename - Dosya adı (opsiyonel)
 */
export const exportToQuizlet = (vocabulary, filename = 'wordbox-quizlet') => {
  // Quizlet format: term\tdefinition (tab separated)
  const rows = vocabulary.map(word => {
    const term = word.word;
    const definition = word.turkish;
    return `${escapeTsvValue(term)}\t${escapeTsvValue(definition)}`;
  });
  
  const content = rows.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${filename}.txt`);
  
  return { success: true, wordCount: vocabulary.length };
};

/**
 * JSON dosyasından kelime listesi içe aktar
 * @param {File} file - JSON dosyası
 * @returns {Promise<Object>} - İçe aktarma sonucu
 */
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate structure
        if (!data.words || !Array.isArray(data.words)) {
          reject(new Error('Geçersiz dosya formatı: "words" dizisi bulunamadı'));
          return;
        }
        
        // Validate and normalize words
        const validWords = data.words
          .filter(w => w.word && w.turkish)
          .map(w => ({
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            word: w.word.trim(),
            turkish: w.turkish.trim(),
            definition: w.definition || '',
            phonetic: w.phonetic || '',
            partOfSpeech: w.partOfSpeech || '',
            examples: w.examples || [],
            level: validateLevel(w.level) || 'B1',
            status: w.status || 'new',
            addedAt: new Date().toISOString(),
            source: 'import'
          }));
        
        resolve({
          success: true,
          words: validWords,
          totalCount: data.words.length,
          validCount: validWords.length,
          skippedCount: data.words.length - validWords.length
        });
      } catch (error) {
        reject(new Error('JSON dosyası okunamadı: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Dosya okuma hatası'));
    reader.readAsText(file);
  });
};

/**
 * CSV dosyasından kelime listesi içe aktar
 * @param {File} file - CSV dosyası
 * @returns {Promise<Object>} - İçe aktarma sonucu
 */
export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV dosyası boş veya geçersiz'));
          return;
        }
        
        // Parse header
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
        const wordIndex = headers.indexOf('word');
        const turkishIndex = headers.indexOf('turkish');
        
        if (wordIndex === -1 || turkishIndex === -1) {
          reject(new Error('CSV dosyasında "word" ve "turkish" sütunları gerekli'));
          return;
        }
        
        // Parse rows
        const validWords = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const word = values[wordIndex]?.trim();
          const turkish = values[turkishIndex]?.trim();
          
          if (word && turkish) {
            validWords.push({
              id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              word,
              turkish,
              definition: values[headers.indexOf('definition')]?.trim() || '',
              phonetic: values[headers.indexOf('phonetic')]?.trim() || '',
              partOfSpeech: values[headers.indexOf('partofspeech')]?.trim() || '',
              level: validateLevel(values[headers.indexOf('level')]) || 'B1',
              status: values[headers.indexOf('status')]?.trim() || 'new',
              examples: [],
              addedAt: new Date().toISOString(),
              source: 'import'
            });
          }
        }
        
        resolve({
          success: true,
          words: validWords,
          totalCount: lines.length - 1,
          validCount: validWords.length,
          skippedCount: lines.length - 1 - validWords.length
        });
      } catch (error) {
        reject(new Error('CSV dosyası okunamadı: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Dosya okuma hatası'));
    reader.readAsText(file);
  });
};

/**
 * Dosya indirme yardımcısı
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * CSV değeri escape et
 */
const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * TSV değeri escape et
 */
const escapeTsvValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\t/g, ' ').replace(/\n/g, '<br>');
};

/**
 * CSV satırı parse et
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

/**
 * Seviye validasyonu
 */
const validateLevel = (level) => {
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  return validLevels.includes(level?.toUpperCase()) ? level.toUpperCase() : null;
};

/**
 * Desteklenen format bilgisi
 */
export const SUPPORTED_FORMATS = {
  export: [
    { id: 'json', label: 'JSON', description: 'Tam veri (yedekleme için ideal)', extension: '.json' },
    { id: 'csv', label: 'CSV', description: 'Excel ve diğer uygulamalar için', extension: '.csv' },
    { id: 'anki', label: 'Anki', description: 'Anki flashcard uygulaması için', extension: '.txt' },
    { id: 'quizlet', label: 'Quizlet', description: 'Quizlet için kopyala-yapıştır', extension: '.txt' },
    { id: 'print', label: 'Yazdır', description: 'Yazdırılabilir kelime listesi', extension: '' }
  ],
  import: [
    { id: 'json', label: 'JSON', description: 'WordBox JSON formatı', extensions: ['.json'] },
    { id: 'csv', label: 'CSV', description: 'word,turkish sütunları gerekli', extensions: ['.csv'] }
  ]
};

/**
 * Yazdırılabilir HTML formatında dışa aktar
 * @param {Array} vocabulary - Kelime listesi
 * @param {Object} options - Yazdırma seçenekleri
 */
export const exportToPrint = (vocabulary, options = {}) => {
  const {
    title = 'Kelime Listem',
    columns = 2,
    showStats = false,
    groupByLevel = false,
  } = options;

  const levelLabels = {
    A1: 'Başlangıç (A1)',
    A2: 'Temel (A2)',
    B1: 'Orta (B1)',
    B2: 'Orta Üstü (B2)',
    C1: 'İleri (C1)',
    C2: 'Ustalaşmış (C2)',
  };

  // Gruplama
  let groups = { all: vocabulary };
  if (groupByLevel) {
    groups = vocabulary.reduce((acc, word) => {
      const level = word.level || 'Diğer';
      if (!acc[level]) acc[level] = [];
      acc[level].push(word);
      return acc;
    }, {});
  }

  let wordCards = '';
  Object.entries(groups).forEach(([groupName, words]) => {
    if (groupByLevel) {
      const label = levelLabels[groupName] || groupName;
      wordCards += `<h2 class="group-title">${label} <span>(${words.length} kelime)</span></h2>`;
    }

    wordCards += '<div class="word-grid">';
    words.forEach((word) => {
      wordCards += `
        <div class="word-card">
          <div class="word-header">
            <span class="word">${word.word}</span>
            ${word.phonetic ? `<span class="phonetic">${word.phonetic}</span>` : ''}
          </div>
          <div class="turkish">${word.turkish}</div>
          ${word.partOfSpeech ? `<div class="pos">${word.partOfSpeech}</div>` : ''}
          ${word.definition ? `<div class="definition">${word.definition}</div>` : ''}
          ${word.examples?.length ? `<div class="example">"${word.examples[0]}"</div>` : ''}
          ${showStats ? `
            <div class="stats">
              <span>📊 ${word.accuracy || 0}%</span>
              <span>🔥 ${word.streak || 0}</span>
            </div>
          ` : ''}
        </div>
      `;
    });
    wordCards += '</div>';
  });

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${title} - WordBox</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: white;
      color: #1a1a1a;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e5e5;
    }
    .header h1 { font-size: 28px; color: #3b82f6; margin-bottom: 8px; }
    .header .meta { color: #666; font-size: 14px; }
    .group-title {
      margin: 24px 0 16px;
      font-size: 18px;
      color: #374151;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 8px;
    }
    .group-title span { font-weight: normal; color: #9ca3af; font-size: 14px; }
    .word-grid {
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: 16px;
    }
    .word-card {
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 12px;
      background: #fafafa;
      break-inside: avoid;
    }
    .word-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
    .word { font-size: 18px; font-weight: 700; color: #1a1a1a; }
    .phonetic { font-size: 12px; color: #9ca3af; }
    .turkish { font-size: 15px; color: #3b82f6; font-weight: 600; margin-bottom: 4px; }
    .pos { font-size: 11px; color: #6b7280; font-style: italic; margin-bottom: 4px; }
    .definition { font-size: 12px; color: #4b5563; margin-bottom: 4px; }
    .example { font-size: 11px; color: #9ca3af; font-style: italic; }
    .stats { 
      display: flex; 
      gap: 12px; 
      margin-top: 8px; 
      padding-top: 8px; 
      border-top: 1px dashed #e5e5e5;
      font-size: 11px;
      color: #6b7280;
    }
    @media print {
      body { padding: 0; }
      .word-card { break-inside: avoid; page-break-inside: avoid; }
      .group-title { break-after: avoid; page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📚 ${title}</h1>
    <div class="meta">
      ${vocabulary.length} kelime • ${new Date().toLocaleDateString('tr-TR')} • WordBox
    </div>
  </div>
  ${wordCards}
</body>
</html>
  `;

  // Yeni pencerede aç ve yazdır
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  return { success: true, wordCount: vocabulary.length };
};
