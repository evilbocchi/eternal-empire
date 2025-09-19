import { Controller, OnStart } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { Workspace } from "@rbxts/services";
import Packets from "shared/Packets";

@Controller()
export default class ShakeController implements OnStart {
    readonly CAMERA_SHAKER = new CameraShaker(Enum.RenderPriority.Camera.Value, (shakeCFrame) => {
        const cam = Workspace.CurrentCamera;
        if (cam !== undefined) cam.CFrame = cam.CFrame.mul(shakeCFrame);
    });

    /**
     * Shake the camera with the given shake instance.
     * @param shakeInstance The shake instance to use for shaking.
     */
    shake(shakeInstance: Parameters<CameraShaker["Shake"]>[0] = CameraShaker.Presets.Bump) {
        this.CAMERA_SHAKER.Shake(shakeInstance);
    }

    onStart() {
        this.CAMERA_SHAKER.Start();

        Packets.shakeCamera.fromServer((presetName) => this.shake(CameraShaker.Presets[presetName]));
    }
}
