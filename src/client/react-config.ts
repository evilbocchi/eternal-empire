import { backend } from "@rbxts/react-devtools-core";
import ReactGlobals from "@rbxts/react-globals";
import { IS_EDIT, IS_STUDIO } from "shared/Context";

// Upstream from https://github.com/littensy/slither/blob/main/src/client/app/react-config.ts
if (IS_STUDIO && !IS_EDIT) {
    ReactGlobals.__DEV__ = true;
    ReactGlobals.__PROFILE__ = true;

    backend.connectToDevtools();
}
