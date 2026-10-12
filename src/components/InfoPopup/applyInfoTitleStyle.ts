import { FONT_FAMILY } from "@/shared/utils/text/createText";
import { FillGradient, type Text } from "pixi.js";

export function applyInfoTitleStyle(
  title: Text,
  fontSize = 48,
  applyTypography = true,
) {
  const gradient = new FillGradient({
    type: "linear",
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    colorStops: [
      { offset: 0, color: 0xf5eaba },
      { offset: 0.25, color: 0xffefa2 },
      { offset: 0.5, color: 0xf7d070 },
      { offset: 0.75, color: 0xe8aa32 },
      { offset: 1, color: 0xebcf5a },
    ],
    textureSpace: "local",
  });

  if (applyTypography) {
    title.style.fontFamily = FONT_FAMILY.CORMORANT_GARAMOND_BOLD;
    title.style.fontWeight = "600";
  }
  title.style.fontSize = fontSize;
  title.style.fill = gradient;
  title.style.lineHeight = fontSize * 1.18;
  title.style.stroke = { color: 0x5a3500, width: 1, join: "round" };
  title.style.dropShadow = {
    color: 0x000000,
    alpha: 0.8,
    angle: Math.PI / 2,
    blur: 2,
    distance: 2,
  };

  title.on("destroyed", () => gradient.destroy());
}
