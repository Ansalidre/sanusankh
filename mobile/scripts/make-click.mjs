// Erzeugt assets/sounds/click.wav: 1000-Hz-Klick, 60 ms, exponentiell abklingend
// (wie der Web-Audio-Klick der Web-Version). Aufruf: node scripts/make-click.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const RATE = 44100;
const DURATION = 0.06;
const samples = Math.round(RATE * DURATION);
const data = Buffer.alloc(samples * 2);

for (let i = 0; i < samples; i++) {
  const t = i / RATE;
  const envelope = 0.6 * Math.pow(0.001 / 0.6, Math.min(t / 0.05, 1));
  data.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 1000 * t) * envelope * 32767), i * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16); // Größe des fmt-Blocks
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28); // Byte-Rate
header.writeUInt16LE(2, 32); // Block-Ausrichtung
header.writeUInt16LE(16, 34); // Bit pro Sample
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const dir = new URL("../assets/sounds/", import.meta.url);
mkdirSync(dir, { recursive: true });
writeFileSync(new URL("click.wav", dir), Buffer.concat([header, data]));
console.log(`click.wav geschrieben (${samples} Samples).`);
