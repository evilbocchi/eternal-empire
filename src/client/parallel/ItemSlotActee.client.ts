//!native
//!optimize 2

import { loadItemViewportManagement } from "client/components/item/ItemViewport";

const { bind } = loadItemViewportManagement();
bind(script.GetActor()!);
