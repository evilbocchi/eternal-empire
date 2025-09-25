import { Controller, OnInit } from "@flamework/core";
import Shaker from "client/ui/components/effect/Shaker";
import { playSound } from "shared/asset/GameAssets";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

@Controller()
export default class PermissionsController implements OnInit {
    /**
     * Initializes the PermissionsController, sets up listeners for donations and game modifications.
     */
    onInit() {
        Packets.donationGiven.fromServer(() => {
            playSound("PowerUp.mp3");
            Shaker.shake();
        });

        Packets.modifyGame.fromServer((param) => {
            if (param === "markplaceableeverywhere") {
                Items.itemsPerId.forEach((item) => item.placeableEverywhere());
            }
        });
    }
}
