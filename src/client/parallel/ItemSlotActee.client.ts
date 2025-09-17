//!native
//!optimize 2

import { loadItemViewportManagement } from "client/ui/components/inventory/ItemViewport";

const { bind } = loadItemViewportManagement();
bind(script.GetActor()!);
