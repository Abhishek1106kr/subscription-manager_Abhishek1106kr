const fs = require('fs');

// Path configs
const srcPath = 'src/config/currency.ts';
const srvPath = 'server/config/currencies.js';
const uiPath = 'src/components/ExchangeRateManager.tsx';

let tsFile = fs.readFileSync(srcPath, 'utf8');

// Update Types
tsFile = tsFile.replace(
  /export type CurrencyType = 'USD' \| 'EUR' \| 'GBP' \| 'CAD' \| 'AUD' \| 'JPY' \| 'CNY' \| 'TRY' \| 'HKD';/,
  "export type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'TRY' | 'HKD' | 'INR';"
);
tsFile = tsFile.replace(
  /const ALL_SUPPORTED_CURRENCIES: CurrencyType\[\] = \['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'TRY', 'HKD'\];/,
  "const ALL_SUPPORTED_CURRENCIES: CurrencyType[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'TRY', 'HKD', 'INR'];"
);

// Update Info Array
tsFile = tsFile.replace(
  /HKD: \{ name: 'Hong Kong Dollar', symbol: 'HK\$' \}/g,
  "HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },\n  INR: { name: 'Indian Rupee', symbol: '₹' }"
);

// Inject INR inside EVERY base block
const blocksToReplace = tsFile.match(/[A-Z]+: \{[\s\S]*?HKD: [\d.]+\s*\}/g);
if (blocksToReplace) {
  blocksToReplace.forEach(block => {
    if (!block.includes('INR: 0.0') && !block.includes('INR: 1')) {
      const newBlock = block.replace(/HKD: ([\d.]+)(\s*)\}/, "HKD: $1,\n    INR: 0.0$2}");
      tsFile = tsFile.replace(block, newBlock);
    }
  });
}

// Add the INR base block at the end of BASE_RATES if not present
if (!tsFile.includes('INR: {\n    INR: 1,')) {
    tsFile = tsFile.replace(/(HKD: \{[\s\S]*?HKD: 1[\s\S]*?\})/, `$1,\n  INR: {\n    INR: 1,\n    USD: 0.012,\n    CNY: 0.086,\n    EUR: 0.011,\n    GBP: 0.0094,\n    CAD: 0.016,\n    AUD: 0.018,\n    JPY: 1.81,\n    TRY: 0.38,\n    HKD: 0.093\n  }`);
}

fs.writeFileSync(srcPath, tsFile);

let jsFile = fs.readFileSync(srvPath, 'utf8');

jsFile = jsFile.replace(
  /const ALL_CURRENCY_CODES = \['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'TRY', 'HKD'\];/,
  "const ALL_CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'TRY', 'HKD', 'INR'];"
);

jsFile = jsFile.replace(
  /\{ code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK\$' \}/g,
  "{ code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },\n    { code: 'INR', name: 'Indian Rupee', symbol: '₹' }"
);

const jsBlocksToReplace = jsFile.match(/[A-Z]+: \{[\s\S]*?HKD: [\d.]+\s*\}/g);
if (jsBlocksToReplace) {
  jsBlocksToReplace.forEach(block => {
    if (!block.includes('INR: 0.0') && !block.includes('INR: 1.0000')) {
      const newBlock = block.replace(/HKD: ([\d.]+)(\s*)\}/, "HKD: $1,\n        INR: 0.0$2}");
      jsFile = jsFile.replace(block, newBlock);
    }
  });
}

if (!jsFile.includes('INR: {\n        INR: 1.0000,')) {
    jsFile = jsFile.replace(/(HKD: \{[\s\S]*?HKD: 1.0000[\s\S]*?\})/, `$1,\n    INR: {\n        INR: 1.0000,\n        USD: 0.012,\n        CNY: 0.086,\n        EUR: 0.011,\n        GBP: 0.0094,\n        CAD: 0.016,\n        AUD: 0.018,\n        JPY: 1.81,\n        TRY: 0.38,\n        HKD: 0.093\n    }`);
}

fs.writeFileSync(srvPath, jsFile);

// Add to UI component
let uiFile = fs.readFileSync(uiPath, 'utf8');
if (!uiFile.includes('value="INR"')) {
    uiFile = uiFile.replace(
      /<SelectItem value="HKD">HKD - \{t\('hongKongDollar'\)\}<\/SelectItem>/,
      "<SelectItem value=\"HKD\">HKD - {t('hongKongDollar')}</SelectItem>\n                  <SelectItem value=\"INR\">INR - {t('indianRupee')}</SelectItem>"
    );
    fs.writeFileSync(uiPath, uiFile);
}

console.log("Success");
