import CameraShaker from "@rbxts/camera-shaker";
import { Workspace } from "@rbxts/services";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";

namespace Shaker {
    export const CAMERA_SHAKER = new CameraShaker(Enum.RenderPriority.Camera.Value, (shakeCFrame) => {
        const cam = Workspace.CurrentCamera;
        if (cam !== undefined) cam.CFrame = cam.CFrame.mul(shakeCFrame);
    });

    /**
     * Shake the camera with the given shake instance.
     * @param shakeInstance The shake instance to use for shaking.
     */
    export function shake(shakeInstance: Parameters<CameraShaker["Shake"]>[0] = CameraShaker.Presets.Bump) {
        CAMERA_SHAKER.Shake(shakeInstance);
    }

    CAMERA_SHAKER.Start();
    const connection = Packets.shakeCamera.fromServer((presetName) => shake(CameraShaker.Presets[presetName]));
    eat(() => {
        connection.Disconnect();
        CAMERA_SHAKER.Stop();
    });
}

export default Shaker;
