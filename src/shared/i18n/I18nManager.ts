import { en } from "./en";
import { th } from "./th";

interface LocaleDictionary {
    [key: string]: string | LocaleDictionary;
}

type LocaleValue = string | LocaleDictionary;
type TranslationParams = Record<string, string | number>;

const locales: Record<string, LocaleDictionary> = { en, th };
const DEFAULT_LANG = "en";

class I18nManager {
    private currentLang: string = DEFAULT_LANG;
    private currentDictionary: LocaleDictionary = en;

    public init(lang?: string) {
        this.setLanguage(lang || import.meta.env.VITE_DEFAULT_LANG);
    }

    public setLanguage(lang?: string) {
        const normalizedLang = this.normalizeLanguage(lang);

        this.currentLang = normalizedLang;
        this.currentDictionary = locales[normalizedLang] || en;
    }

    public getLanguage(): string {
        return this.currentLang;
    }

    public t(keyPath: string, params?: TranslationParams): string {
        const result = this.getValue(this.currentDictionary, keyPath);
        const fallbackResult = this.getValue(en, keyPath);

        const translation =
            typeof result === "string"
                ? result
                : typeof fallbackResult === "string"
                  ? fallbackResult
                  : keyPath;

        return this.interpolate(translation, params);
    }

    private getValue(
        dictionary: LocaleDictionary,
        keyPath: string,
    ): LocaleValue | undefined {
        const keys = keyPath.split(".");
        let result: LocaleValue = dictionary;

        for (const key of keys) {
            if (typeof result === "object" && result[key] !== undefined) {
                result = result[key];
            } else {
                return undefined;
            }
        }

        return result;
    }

    private normalizeLanguage(lang?: string): string {
        return (lang || DEFAULT_LANG)
            .replace(/^localization_/i, "")
            .toLowerCase();
    }

    private interpolate(text: string, params?: TranslationParams): string {
        if (!params) return text;

        return text.replace(/\{(\w+)\}/g, (match, key: string) =>
            params[key] !== undefined ? String(params[key]) : match,
        );
    }
}

export const i18n = new I18nManager();
