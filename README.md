[README.md](https://github.com/user-attachments/files/32131937/README.md)

# Deadbolt

A password generator I built as a starter project while working toward my Cybersecurity Engineering degree. Wanted something small enough to finish in a day but with enough real substance to actually talk about — so instead of just doing the typical `Math.random()` version, I built it around the Web Crypto API and dug into how to avoid the small mistakes that make a "secure" generator not actually secure.

No accounts, no backend, nothing logged or stored. Everything happens in your browser and disappears when you close the tab.

**Live demo:** *(add your link here once deployed)*

## Why I built it this way

Every quick tutorial I found online used `Math.random()`, which is fine for a game but isn't cryptographically secure — it's a pseudo-random generator, not a true one, and its output can theoretically be predicted with enough samples. That's a bad foundation for something whose whole job is being unpredictable.

So I used `crypto.getRandomValues()` instead — it's built into the browser, pulls from the OS's actual entropy source, and is the same category of randomness used for real cryptographic keys.

A few other things I made sure to get right:

- **No modulo bias.** The lazy way to turn a random byte into a character index is `byte % poolSize`, but that quietly makes some characters more likely than others unless poolSize divides evenly into 256. I used rejection sampling instead — if a byte would cause that bias, throw it out and draw again. Check `secureRandomIndex()` in `script.js` if you want to see it.
- **Real entropy math**, not a fake strength bar. It's calculated as `length × log2(poolSize)` in bits, so the number on screen actually means something.
- **Ambiguous characters (0/O, 1/l/I) aren't excluded by default.** Cutting them out shrinks the character pool and lowers entropy for no real reason — this tool is meant to be copy-pasted, not handwritten, so I kept the full set.

## Structure

```
Deadbolt/
├── index.html   → page structure
├── style.css    → styling
├── script.js    → all the actual logic
└── README.md
```

Kept it to plain HTML/CSS/JS on purpose — no framework, no build step, nothing to install. Just open `index.html`.

## Status

This is a starter project — first in a series I'm building to get more comfortable shipping real, finished things instead of half-done tutorials. More to come.

Built September 2026.
