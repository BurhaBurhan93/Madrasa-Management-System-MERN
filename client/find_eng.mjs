import { readFileSync } from 'fs';
const ps = JSON.parse(readFileSync('D:/update/New folder (5)/Madrasa-Management-System-MERN/client/src/i18n/locales/ps/translation.json', 'utf8')).staff;
const en = JSON.parse(readFileSync('D:/update/New folder (5)/Madrasa-Management-System-MERN/client/src/i18n/locales/en/translation.json', 'utf8')).staff;
const eng = /^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/;
function walk(obj, path) {
  if (typeof obj === 'string' && obj.length > 0 && obj.length < 100 && eng.test(obj) && obj !== obj) {
    // skip
  } else if (typeof obj === 'object' && obj !== null) {
    for (const k of Object.keys(obj)) {
      walk(obj[k], path + '.' + k);
    }
  }
}
// Instead, find keys where ps value equals en value (both English)
function findSame(obj1, obj2, path) {
  if (typeof obj1 === 'string' && typeof obj2 === 'string') {
    if (obj1 === obj2 && /^[A-Z]/.test(obj1)) {
      console.log(path + ': ' + obj1);
    }
  } else if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
    for (const k of Object.keys(obj1)) {
      if (obj2[k] !== undefined) findSame(obj1[k], obj2[k], path + '.' + k);
    }
  }
}
console.log('=== Keys still English in Pashto ===');
findSame(en, ps, 'staff');
