type FormatOptions = {
    kThreshold?: number;
    mThreshold?: number;
    bThreshold?: number;
    bbThreshold?: number;
    decimals?: number;
};

const FORMAT_NUMBER_UNITS = {
    k: import.meta.env.VITE_FORMAT_NUMBER_K_UNIT ?? "P",
    m: import.meta.env.VITE_FORMAT_NUMBER_M_UNIT ?? "KP",
    b: import.meta.env.VITE_FORMAT_NUMBER_B_UNIT ?? "MP",
    bb: import.meta.env.VITE_FORMAT_NUMBER_BB_UNIT ?? "BP",
};

const truncate = (num: number, decimals: number = 0) => {
    const factor = 10 ** decimals;
    const scaled = num * factor;
    const adjustment = Math.sign(scaled) * Number.EPSILON * Math.abs(scaled);

    return Math.trunc(scaled + adjustment) / factor;
};

export const format = (num: number, decimals: number = 0) =>
    truncate(num, decimals).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

export function formatNumber(
    value: number,
    options: FormatOptions = {},
): string {
    const {
        kThreshold = 1_000_000,
        mThreshold = 1_000_000_000,
        bThreshold = 1_000_000_000_000,
        bbThreshold = 1_000_000_000_000_000,
        decimals = 0,
    } = options;

    if (value >= bbThreshold) {
        return (
            format(value / 1_000_000_000_000, decimals) + FORMAT_NUMBER_UNITS.bb
        );
    }

    if (value >= bThreshold) {
        return format(value / 1_000_000_000, decimals) + FORMAT_NUMBER_UNITS.b;
    }

    if (value >= mThreshold) {
        return format(value / 1_000_000, decimals) + FORMAT_NUMBER_UNITS.m;
    }

    if (value >= kThreshold) {
        return format(value / 1_000, decimals) + FORMAT_NUMBER_UNITS.k;
    }

    return format(value, decimals);
}
