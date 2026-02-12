/**
 * Postni o'qish vaqtini hisoblaydigan murakkab algoritm
 * @param {string} content - Maqola kontenti (Markdown yoki HTML)
 * @returns {number} - Daqiqalarda o'qish vaqti
 */
export const calculateComplexReadingTime = (content) => {
  if (!content) return 0;

  const WPM = 200; // Daqiqasiga o'rtacha so'zlar soni
  let totalSeconds = 0;

  // 1. RASMLARNI HISOBGA OLISH (Medium algoritmi bo'yicha)
  // Markdown rasm formati: ![alt](url)
  const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
  
  // Har bir rasm uchun vaqt qo'shamiz (sekundlarda)
  // 1-rasm: 12s, 2-rasm: 11s, ..., 10-rasm: 3s. Undan keyingilar ham 3s.
  for (let i = 1; i <= imageCount; i++) {
    if (i <= 10) {
      totalSeconds += (13 - i); 
    } else {
      totalSeconds += 3;
    }
  }

  // 2. KOD BLOKLARINI HISOBGA OLISH (Dasturchilar blogi uchun muhim)
  // Kod bloklari orasidagi matnni sekinroq o'qilishini hisobga olamiz
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks = content.match(codeBlockRegex) || [];
  
  // Har bir kod bloki uchun qo'shimcha 5-10 sekund
  totalSeconds += codeBlocks.length * 5;

  // 3. MATNNI TOZALASH VA SO'ZLARNI SANASH
  let cleanText = content
    .replace(codeBlockRegex, '') // Kod bloklarini so'z sifatida sanamaymiz
    .replace(/!\[.*?\]\(.*?\)/g, '') // Rasmlarni olib tashlaymiz
    .replace(/[#*`_~\[\]()]/g, '') // Markdown belgilarini tozalaymiz
    .replace(/\s+/g, ' ') // Ortiqcha bo'shliqlarni bittaga keltiramiz
    .trim();

  const wordCount = cleanText.split(' ').filter(word => word.length > 0).length;

  // 4. SO'ZLAR UCHUN VAQTNI HISOBLASH
  const wordSeconds = (wordCount / WPM) * 60;
  totalSeconds += wordSeconds;

  // 5. YAKUNIY NATIJA (Daqiqaga o'girish va yuqoriga yaxlitlash)
  const finalMinutes = Math.ceil(totalSeconds / 60);

  return finalMinutes;
};