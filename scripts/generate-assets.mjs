#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateSync } from "node:zlib";

const root = process.cwd();
function pixels(width, height) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) / 200;
      const diamond = Math.abs(x - cx) + Math.abs(y - cy) < 58 * scale;
      const i = (y * width + x) * 4;
      rgba.set(diamond ? [245, 181, 66, 255] : [22, 50, 79, 255], i);
    }
  return rgba;
}
function crc32(buffer) {
  let c = 0xffffffff;
  for (const n of buffer) {
    c ^= n;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type);
  const body = Buffer.concat([t, data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), data.length + 8);
  return out;
}
function png(width, height, source) {
  const rows = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    rows[y * (width * 4 + 1)] = 0;
    source.copy(rows, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0);
  head.writeUInt32BE(height, 4);
  head[8] = 8;
  head[9] = 6;
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", head),
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
function ico(image) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 64;
  entry[1] = 64;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, image]);
}
await mkdir(path.join(root, "public"), { recursive: true });
await writeFile(path.join(root, "public/logo.png"), png(200, 200, pixels(200, 200)));
await writeFile(path.join(root, "public/favicon.ico"), ico(png(64, 64, pixels(64, 64))));
await writeFile(
  path.join(root, "public/og-image.png"),
  png(1200, 630, pixels(1200, 630)),
);
console.log("Generated project-owned geometric placeholder assets.");
