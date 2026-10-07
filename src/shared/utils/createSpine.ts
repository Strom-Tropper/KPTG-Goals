import { Spine } from "@esotericsoftware/spine-pixi-v8";

type CreateSpineOptions = {
    autoUpdate?: boolean;
};

export function CreateSpine(
    skeletonAlias: string,
    atlasAlias: string,
    options: CreateSpineOptions = {},
): Spine {
    return Spine.from({
        skeleton: skeletonAlias,
        atlas: atlasAlias,
        autoUpdate: options.autoUpdate,
    });
}
