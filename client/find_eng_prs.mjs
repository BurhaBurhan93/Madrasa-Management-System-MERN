import { readFileSync } from 'fs';
const prs = JSON.parse(readFileSync('D:/update/New folder (5)/Madrasa-Management-System-MERN/client/src/i18n/locales/prs/translation.json', 'utf8')).staff;
const en = JSON.parse(readFileSync('D:/update/New folder (5)/Madrasa-Management-System-MERN/client/src/i18n/locales/en/translation.json', 'utf8')).staff;
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
console.log('=== Keys still English in Dari ===');
findSame(en, prs, 'staff');
