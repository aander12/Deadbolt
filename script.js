/* ============================================================
   CHARACTER POOLS
   Ambiguous characters (0/O, 1/l/I) are deliberately NOT
   excluded by default — excluding them shrinks the pool and
   therefore lowers entropy. A copy paste tool doesn't need
   human readability the way a "write this on a sticky note"
   password would.
   ============================================================ */
const POOLS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}<>?/.,~'
};

const el = {
  password: document.getElementById('password'),
  copyBtn: document.getElementById('copyBtn'),
  generateBtn: document.getElementById('generateBtn'),
  lengthSlider: document.getElementById('lengthSlider'),
  lengthVal: document.getElementById('lengthVal'),
  entropyVal: document.getElementById('entropyVal'),
  strengthBars: document.querySelectorAll('#strengthBars span'),
  strengthLabel: document.getElementById('strengthLabel'),
  optUpper: document.getElementById('optUpper'),
  optLower: document.getElementById('optLower'),
  optNumbers: document.getElementById('optNumbers'),
  optSymbols: document.getElementById('optSymbols'),
};

/* ------------------------------------------------------------
   Functionality Number 1: unbiased random index via rejection sampling

   Why not just `Math.floor(Math.random() * max)`?
     1. Math.random() is NOT cryptographically secure.
     2. Even swapping in crypto.getRandomValues(), a naive
        `randomByte % max` introduces modulo bias whenever max
        doesn't evenly divide 256 — some characters become
        statistically more likely than others which creates predictability.

   This function draws random bytes from crypto.getRandomValues()
   and discards any byte that would cause that bias, so every index in [0, max) is equally likely.
   ------------------------------------------------------------ */
function secureRandomIndex(max) {
  const range = 256 - (256 % max); // largest multiple of `max` that fits in a byte
  const arr = new Uint8Array(1);
  let byte;
  do {
    crypto.getRandomValues(arr);
    byte = arr[0];
  } while (byte >= range); // reject biased values, draw again
  return byte % max;
}

/* ------------------------------------------------------------
   Functionality Number 2: build the password
   ------------------------------------------------------------ */
function generatePassword(length, options) {
  let pool = '';
  if (options.upper) pool += POOLS.upper;
  if (options.lower) pool += POOLS.lower;
  if (options.numbers) pool += POOLS.numbers;
  if (options.symbols) pool += POOLS.symbols;

  if (pool.length === 0) return null; // no character types selected

  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = secureRandomIndex(pool.length);
    result += pool[idx];
  }
  return { password: result, poolSize: pool.length };
}

/* ------------------------------------------------------------
   ENTROPY: bits = length * log2(poolSize)
   Mathematically “impossible” to brute force this password with current technology available
   ------------------------------------------------------------ */
function calcEntropy(length, poolSize) {
  return Math.round(length * Math.log2(poolSize));
}

function updateStrengthDisplay(bits) {
  el.entropyVal.textContent = `${bits} bits`;

  let level, label, cls;
  if (bits < 40) { level = 1; label = 'Weak'; cls = 'weak'; }
  else if (bits < 70) { level = 2; label = 'Fair'; cls = 'mid'; }
  else if (bits < 100) { level = 3; label = 'Strong'; cls = ''; }
  else { level = 4; label = 'Excellent'; cls = ''; }

  el.strengthBars.forEach((bar, i) => {
    bar.className = i < level ? `on ${cls}` : '';
  });
  el.strengthLabel.textContent = label;
}

function getOptions() {
  return {
    upper: el.optUpper.checked,
    lower: el.optLower.checked,
    numbers: el.optNumbers.checked,
    symbols: el.optSymbols.checked,
  };
}

function handleGenerate() {
  const length = parseInt(el.lengthSlider.value, 10);
  const options = getOptions();
  const result = generatePassword(length, options);

  if (!result) {
    el.password.textContent = 'Select at least one character type';
    el.password.classList.add('placeholder');
    el.entropyVal.textContent = '— bits';
    el.strengthLabel.textContent = '—';
    el.strengthBars.forEach(bar => bar.className = '');
    return;
  }

  el.password.textContent = result.password;
  el.password.classList.remove('placeholder');
  updateStrengthDisplay(calcEntropy(length, result.poolSize));
}

el.lengthSlider.addEventListener('input', () => {
  el.lengthVal.textContent = el.lengthSlider.value;
});

el.generateBtn.addEventListener('click', handleGenerate);

el.copyBtn.addEventListener('click', async () => {
  const text = el.password.textContent;
  if (el.password.classList.contains('placeholder')) return;
  await navigator.clipboard.writeText(text);
  const original = el.copyBtn.innerHTML;
  el.copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6"/></svg>`;
  setTimeout(() => { el.copyBtn.innerHTML = original; }, 1200);
});
