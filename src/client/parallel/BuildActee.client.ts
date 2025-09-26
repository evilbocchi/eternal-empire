//!optimize 2
//!native

import loadBuildProcessing from "client/components/build/loadBuildProcessing";

declare global {
    interface Assets {
        ChargerRing: Beam;
    }
}

loadBuildProcessing();
