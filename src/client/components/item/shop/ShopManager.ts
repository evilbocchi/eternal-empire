import Signal from "@antivivi/lemon-signal";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import { getSound } from "shared/asset/GameAssets";
import { IS_EDIT } from "shared/Context";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Shop from "shared/item/traits/Shop";

export interface ShopCandidate {
    guiPart: Part;
    shop: Shop;
}

interface CameraState {
    cframe: CFrame;
    cameraType: Enum.CameraType;
    cameraSubject?: Humanoid | BasePart;
    focus: CFrame;
}

let shopGuiPart: Part | undefined;
let cameraState: CameraState | undefined;
let cameraTween: Tween | undefined;
let focusCameraEnabled = false;
let cameraFocusSuppressed = false;
const CAMERA_DEBOUNCE_SECONDS = 0.4;
let focusRequestToken = 0;
let lastFocusRequest = 0;

const opened = new Signal<(shop?: Shop, adornee?: Part) => void>();

function cancelCameraTween() {
    if (cameraTween) {
        cameraTween.Cancel();
        cameraTween = undefined;
    }
}

function performCameraFocus(guiPart: Part) {
    if (IS_EDIT || focusCameraEnabled === false || cameraFocusSuppressed) return;

    const camera = Workspace.CurrentCamera;
    if (camera === undefined) return;

    if (cameraState === undefined) {
        cameraState = {
            cframe: camera.CFrame,
            cameraType: camera.CameraType,
            cameraSubject: camera.CameraSubject,
            focus: camera.Focus,
        };
    }

    const forward = guiPart.CFrame.LookVector;
    const from = guiPart.Position.add(forward.mul(10));

    camera.CameraType = Enum.CameraType.Scriptable;
    camera.CameraSubject = undefined;

    const targetCFrame = CFrame.lookAt(from, guiPart.Position);
    const tweenInfo = new TweenInfo(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

    cancelCameraTween();
    const tween = TweenService.Create(camera, tweenInfo, { CFrame: targetCFrame });
    cameraTween = tween;
    tween.Completed.Once(() => {
        if (cameraTween === tween) {
            cameraTween = undefined;
        }
    });
    tween.Play();

    lastFocusRequest = tick();
}

function requestCameraFocus(guiPart: Part) {
    if (IS_EDIT || focusCameraEnabled === false || cameraFocusSuppressed) return;

    const now = tick();
    const elapsed = now - lastFocusRequest;
    if (elapsed < CAMERA_DEBOUNCE_SECONDS) {
        const remaining = CAMERA_DEBOUNCE_SECONDS - elapsed;
        const delayDuration = math.max(remaining, 0);
        const tokenAtSchedule = ++focusRequestToken;
        task.delay(delayDuration, () => {
            if (focusRequestToken !== tokenAtSchedule) return;
            if (focusCameraEnabled === false || cameraFocusSuppressed) return;
            if (shopGuiPart !== guiPart) return;
            performCameraFocus(guiPart);
        });
        return;
    }

    focusRequestToken++;
    performCameraFocus(guiPart);
}

function restoreCamera() {
    focusRequestToken++;
    const state = cameraState;
    const camera = Workspace.CurrentCamera;
    if (state === undefined || camera === undefined) {
        cameraState = undefined;
        cancelCameraTween();
        return;
    }

    cancelCameraTween();

    const tweenInfo = new TweenInfo(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
    const tween = TweenService.Create(camera, tweenInfo, { CFrame: state.cframe });
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.CameraSubject = undefined;
    camera.Focus = state.focus;
    cameraTween = tween;
    tween.Completed.Once(() => {
        if (cameraTween === tween) {
            cameraTween = undefined;
        }
        camera.CameraType = state.cameraType;
        camera.CameraSubject = state.cameraSubject;
        if (state.cameraType !== Enum.CameraType.Scriptable && state.cameraSubject === undefined) {
            camera.Focus = state.focus;
        }
    });

    cameraState = undefined;
    tween.Play();

    lastFocusRequest = tick();
}

function hideShopGuiPart(guiPart: Part) {
    TweenService.Create(guiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 1 }).Play();

    const sound = getSound("ShopClose.mp3");
    sound.Play();
    sound.Parent = guiPart;
    Debris.AddItem(sound, 5);
}

function playOpenEffects(guiPart: Part) {
    const sound = getSound("ShopOpen.mp3");
    sound.Play();
    sound.Parent = guiPart;
    Debris.AddItem(sound, 5);

    TweenService.Create(guiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 0 }).Play();
}

function setCameraFocusEnabled(enabled: boolean) {
    if (focusCameraEnabled === enabled) return;
    focusCameraEnabled = enabled;

    if (!enabled) {
        restoreCamera();
        cameraFocusSuppressed = false;
        return;
    }

    if (shopGuiPart !== undefined && cameraFocusSuppressed === false) {
        requestCameraFocus(shopGuiPart);
    }
}

function releaseCameraFocus(): boolean {
    if (focusCameraEnabled === false) return false;
    if (cameraFocusSuppressed === true) return false;
    if (shopGuiPart === undefined) return false;
    if (cameraState === undefined) return false;

    cameraFocusSuppressed = true;
    restoreCamera();
    return true;
}

function refreshShop(guiPart?: Part, shop?: Shop) {
    if (shopGuiPart === guiPart) return;

    const previousShopGuiPart = shopGuiPart;
    shopGuiPart = guiPart;
    focusRequestToken++;

    if (previousShopGuiPart !== undefined && previousShopGuiPart !== guiPart) {
        hideShopGuiPart(previousShopGuiPart);
    }

    if (guiPart === undefined || shop === undefined) {
        restoreCamera();
        cameraFocusSuppressed = false;
        opened.fire();
        return;
    }

    playOpenEffects(guiPart);
    if (cameraFocusSuppressed === false) {
        requestCameraFocus(guiPart);
    }
    opened.fire(shop, guiPart);
}

function checkForShop(candidates: Map<BasePart, ShopCandidate>) {
    const primaryPart = getPlayerCharacter()?.PrimaryPart;
    if (primaryPart === undefined) return;

    let shopFound = false;
    for (const [hitbox, { guiPart, shop }] of candidates) {
        const localPosition = hitbox.CFrame.PointToObjectSpace(primaryPart.Position);
        if (math.abs(localPosition.X) > hitbox.Size.X / 2 || math.abs(localPosition.Z) > hitbox.Size.Z / 2) continue;

        refreshShop(guiPart, shop);
        shopGuiPart = guiPart;
        shopFound = true;
        break;
    }

    if (shopFound === false) {
        refreshShop();
    }
}

const ShopManager = {
    opened,
    setCameraFocusEnabled,
    releaseCameraFocus,
    refreshShop,
    checkForShop,
};

export default ShopManager;
