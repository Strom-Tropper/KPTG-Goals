import { Container } from "pixi.js";
import type { MainGameLayoutMode } from "@/components/layouts";
import { i18n } from "@/shared/i18n/I18nManager";
import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
import { applyInfoTitleStyle } from "./applyInfoTitleStyle";

const BODY_KEYS = [
  "goal.infoPlay.board",
  "goal.infoPlay.steps",
  "goal.infoPlay.safe",
  "goal.infoPlay.cashout",
  "goal.infoPlay.trap",
  "goal.infoPlay.timer",
  "goal.infoPlay.multipliers",
] as const;

export type InfoGoalView = Container & {
  setLayout: (mode: MainGameLayoutMode) => void;
};

export function createInfoGoal(): InfoGoalView {
  const page = new Container({ label: "InfoGoal" }) as InfoGoalView;
  const title = createText({
    text: i18n.t("goal.infoPlay.title"),
    fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
    fontSize: 64,
    align: "center",
  });
  title.anchor.set(0.5);
  applyInfoTitleStyle(title, 64);

  const body = createText({
    text: BODY_KEYS.map((key) => i18n.t(key)).join("\n"),
    fontFamily: FONT_FAMILY.EB_GARAMOND,
    fontSize: 28,
    fill: "#3a2a16",
    align: "center",
    wordWrap: true,
    wordWrapWidth: 980,
    lineHeight: 36,
  });
  body.anchor.set(0.5, 0);

  const place = (mode: MainGameLayoutMode) => {
    const portrait = mode === "portrait";
    title.position.set(0, portrait ? -520 : -300);
    title.style.fontSize = portrait ? 52 : 64;
    body.style.fontSize = portrait ? 26 : 28;
    body.style.wordWrapWidth = portrait ? 720 : 980;
    body.position.set(0, portrait ? -440 : -210);
  };

  page.setLayout = place;
  page.addChild(title, body);
  place("landscape");
  return page;
}
