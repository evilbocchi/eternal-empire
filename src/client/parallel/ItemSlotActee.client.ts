//!native
//!optimize 2

import { loadItemViewportManagement } from "client/ui/components/item/ItemViewport";

const { bind } = loadItemViewportManagement();
bind(script.GetActor()!);
