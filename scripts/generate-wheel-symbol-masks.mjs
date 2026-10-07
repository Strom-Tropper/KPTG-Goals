import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "raw-assets/main-scene{m}/main-scene{tps}/maingame_wheel.png";
const OUTPUT_DIR = "raw-assets/main-game{m}{nomip}/masks";
const ALPHA_THRESHOLD = 250;
const PADDING = 2;
const MASKS = [
    { name: "inner", seed: [453, 310] },
    { name: "middle", seed: [453, 225] },
    { name: "outer", seed: [453, 122] },
];

const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

await mkdir(OUTPUT_DIR, { recursive: true });

for (const { name, seed } of MASKS) {
    if (data[(seed[1] * info.width + seed[0]) * 4 + 3] > ALPHA_THRESHOLD) {
        throw new Error(`Mask ${name}: seed must be inside a wheel opening`);
    }
    const visited = new Uint8Array(info.width * info.height);
    const pixels = [seed[1] * info.width + seed[0]];
    visited[pixels[0]] = 1;

    let minX = seed[0];
    let maxX = seed[0];
    let minY = seed[1];
    let maxY = seed[1];

    for (let cursor = 0; cursor < pixels.length; cursor += 1) {
        const pixel = pixels[cursor];
        const x = pixel % info.width;
        const y = Math.floor(pixel / info.width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        const neighbours = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
        ];

        neighbours.forEach(([nextX, nextY]) => {
            if (
                nextX < 0 ||
                nextX >= info.width ||
                nextY < 0 ||
                nextY >= info.height
            ) {
                return;
            }

            const nextPixel = nextY * info.width + nextX;
            if (visited[nextPixel]) return;
            visited[nextPixel] = 1;

            if (data[nextPixel * 4 + 3] <= ALPHA_THRESHOLD) {
                pixels.push(nextPixel);
            }
        });
    }

    if (
        minX === 0 ||
        minY === 0 ||
        maxX === info.width - 1 ||
        maxY === info.height - 1
    ) {
        throw new Error(`Mask ${name}: opening leaks outside the wheel`);
    }
    const cropX = Math.max(0, minX - PADDING);
    const cropY = Math.max(0, minY - PADDING);
    const width = Math.min(info.width - 1, maxX + PADDING) - cropX + 1;
    const height = Math.min(info.height - 1, maxY + PADDING) - cropY + 1;
    console.log(name, {
        cropX,
        cropY,
        width,
        height,
        centerX: cropX + width / 2,
        centerY: cropY + height / 2,
    });
    const output = Buffer.alloc(width * height * 4);

    pixels.forEach((pixel) => {
        const x = (pixel % info.width) - cropX;
        const y = Math.floor(pixel / info.width) - cropY;
        const offset = (y * width + x) * 4;
        output[offset] = 255;
        output[offset + 1] = 255;
        output[offset + 2] = 255;
        output[offset + 3] = 255;
    });

    await sharp(output, { raw: { width, height, channels: 4 } })
        .png()
        .toFile(path.join(OUTPUT_DIR, `winline-mask-${name}.png`));
}
