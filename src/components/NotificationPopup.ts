import {
  Application,
  Assets,
  Container,
  NineSliceSprite,
  Renderer,
  Texture,
} from "pixi.js";
import Popup from "@/components/base/Popup";
import {
  goalLabel,
  labeledButton,
  type ButtonSkin,
} from "@/components/GameControls";
import { GOAL_INK, GOAL_KNOB_EDGE } from "@/shared/constants/goal";
import { i18n } from "@/shared/i18n/I18nManager";
import { GAME_ERROR_CODES } from "@/modules/game/engine/game.constants";
import { normalizeGameErrorCode } from "@/modules/game/engine/game.errors";
import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
import { gameRequests } from "@/modules/game/handlers/game.requests";
import { socketClient } from "@/modules/game/ws/game.ws";
import { audioSystem } from "@/systems/audio";
import plateUrl from "../../raw-assets/board{m}{copy}/popup-plate.svg";
import buttonFaceUrl from "../../raw-assets/board{m}{copy}/button-face.svg";
import buttonFaceHoverUrl from "../../raw-assets/board{m}{copy}/button-face-hover.svg";
import buttonFaceActiveUrl from "../../raw-assets/board{m}{copy}/button-face-active.svg";

const PLATE_WIDTH = 640;
const PLATE_HEIGHT = 360;
const MESSAGE_SIZE = 22;
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 52;

const RELOAD_ERROR_KEYS = new Set<string>([
  GAME_ERROR_CODES.CONNECTION_FAILED,
  GAME_ERROR_CODES.SESSION_EXPIRED,
  GAME_ERROR_CODES.TOKEN_CONFLICT,
]);

const CONNECTION_ERROR_KEYS = new Set<string>([
  GAME_ERROR_CODES.CONNECTING,
  GAME_ERROR_CODES.CONNECTION_FAILED,
]);

type NoticeAction = "confirm" | "reload" | "none";

export class NotificationPopup extends Popup {
  private static instance: NotificationPopup | null = null;
  private readonly app: Application<Renderer>;
  private readonly body = new Container();
  private plate: NineSliceSprite | null = null;
  private skin: ButtonSkin | null = null;
  private ready: Promise<void> | null = null;
  private errorKey = "";
  private action: NoticeAction = "none";
  private readonly stopError: () => void;
  private readonly stopConnected: () => void;

  private constructor(app: Application<Renderer>) {
    super({
      closeOnEscape: false,
      closeOnOverlay: false,
      ticker: app.ticker ?? null,
    });

    this.app = app;
    this.label = "NotificationPopup";
    this.zIndex = 50;
    this.content.addChild(this.body);
    this.place();
    this.app.renderer.on("resize", this.place);
    this.stopError = eventBus.on(EVENT_NAMES.ERROR_OCCURRED, (data) => {
      const payload = data as { errorKey?: string; errorMessage?: string };
      this.present(payload.errorMessage ?? "", payload.errorKey ?? "");
    });
    this.stopConnected = eventBus.on(EVENT_NAMES.SOCKET_CONNECTED, () => {
      if (CONNECTION_ERROR_KEYS.has(this.errorKey) && socketClient.isReady()) {
        this.hide();
      }
    });
    window.addEventListener("keydown", this.onKeyDown);
  }

  static attach(app: Application<Renderer>): void {
    NotificationPopup.instance ??= new NotificationPopup(app);
  }

  static show(
    app: Application<Renderer>,
    message: string,
    errorKey = "",
  ): void {
    NotificationPopup.attach(app);
    NotificationPopup.instance?.present(message, errorKey);
  }

  static close(): void {
    const popup = NotificationPopup.instance;
    if (!popup) return;

    popup.stopError();
    popup.stopConnected();
    window.removeEventListener("keydown", popup.onKeyDown);
    popup.app.renderer.off("resize", popup.place);
    popup.destroy();
    NotificationPopup.instance = null;
  }

  private present(message: string, errorKey: string): void {
    const nextKey = normalizeGameErrorCode(errorKey);
    const shouldOverride =
      CONNECTION_ERROR_KEYS.has(nextKey) &&
      this.errorKey !== GAME_ERROR_CODES.ANOTHER_LOGIN &&
      this.errorKey !== GAME_ERROR_CODES.MAINTENANCE;
    if (this.isVisible() && !shouldOverride) return;

    this.errorKey = nextKey;
    this.action = noticeAction(nextKey);
    if (!this.parent) this.app.stage.addChild(this);
    this.app.stage.setChildIndex(this, this.app.stage.children.length - 1);
    this.place();
    void this.paint().then(() => {
      if (this.destroyed) return;

      this.fill(message);
      this.show();
    });
  }

  private paint(): Promise<void> {
    if (this.ready) return this.ready;

    this.ready = Promise.all([
      Assets.load<Texture>({ src: plateUrl, data: { resolution: 2 } }),
      Assets.load<Texture>({ src: buttonFaceUrl, data: { resolution: 2 } }),
      Assets.load<Texture>({
        src: buttonFaceHoverUrl,
        data: { resolution: 2 },
      }),
      Assets.load<Texture>({
        src: buttonFaceActiveUrl,
        data: { resolution: 2 },
      }),
    ]).then(([plateTexture, face, hover, active]) => {
      if (this.destroyed) return;

      const slice = 36;
      const plate = new NineSliceSprite({
        texture: plateTexture,
        leftWidth: slice,
        topHeight: slice,
        rightWidth: slice,
        bottomHeight: slice,
        width: PLATE_WIDTH,
        height: PLATE_HEIGHT,
      });
      plate.position.set(-PLATE_WIDTH / 2, -PLATE_HEIGHT / 2);
      this.plate = plate;
      this.skin = { normal: face, hover, active: face };
      this.content.addChildAt(plate, 0);
    });
    return this.ready;
  }

  private fill(message: string): void {
    this.body.removeChildren();
    this.body.addChild(
      goalLabel(i18n.t("notification.title"), 0, -120, 32, GOAL_KNOB_EDGE),
    );
    const text = goalLabel(message, 0, -24, MESSAGE_SIZE, GOAL_INK);
    text.style.wordWrap = true;
    text.style.breakWords = true;
    text.style.wordWrapWidth = PLATE_WIDTH - 140;
    this.body.addChild(text);
    if (!this.skin || this.action === "none") return;

    const label =
      this.action === "reload"
        ? i18n.t("actions.reload")
        : i18n.t("actions.confirm");
    const press = this.action === "reload" ? this.reload : this.confirm;
    this.body.addChild(
      labeledButton(
        -BUTTON_WIDTH / 2,
        78,
        BUTTON_WIDTH,
        BUTTON_HEIGHT,
        [label],
        true,
        press,
        false,
        this.skin,
      ),
    );
  }

  private readonly confirm = (): void => {
    void audioSystem.play("sfx_btn", { singleInstance: true });
    if (this.errorKey === GAME_ERROR_CODES.SESSION_CONFLICT) {
      gameRequests.ConfirmSession();
    }
    if (
      this.errorKey === GAME_ERROR_CODES.INVALID_TOKEN ||
      this.errorKey === GAME_ERROR_CODES.LOGIN_REQUIRED
    ) {
      const homepageUrl = import.meta.env.VITE_HOMEPAGE_URL?.trim();
      if (homepageUrl) {
        window.location.href = homepageUrl;
        return;
      }
      window.location.reload();
      return;
    }
    this.hide();
  };

  private readonly reload = (): void => {
    void audioSystem.play("sfx_btn", { singleInstance: true });
    window.location.reload();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (
      event.defaultPrevented ||
      event.code !== "Space" ||
      event.repeat ||
      !this.isVisible()
    )
      return;
    if (this.action === "none") return;

    event.preventDefault();
    if (this.action === "reload") this.reload();
    else this.confirm();
  };

  private readonly place = (): void => {
    const width = Math.max(1, this.app.screen.width);
    const height = Math.max(1, this.app.screen.height);
    this.content.position.set(width / 2, height / 2);
    const fit = Math.min(
      1,
      (width - 32) / PLATE_WIDTH,
      (height - 32) / PLATE_HEIGHT,
    );
    this.setContentLayoutScale(fit);
  };
}

function noticeAction(errorKey: string): NoticeAction {
  if (RELOAD_ERROR_KEYS.has(errorKey)) return "reload";
  if (errorKey === GAME_ERROR_CODES.CONNECTING) return "none";
  return "confirm";
}
