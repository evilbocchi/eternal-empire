import Command, { CommandAPI } from "shared/commands/Command";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("mpe")
    .setDescription("Make the specified item placeable everywhere.")
    .setExecute((_player, itemId) => {
        Packets.modifyGame.toAllClients("markplaceableeverywhere");
        Items.getItem(itemId)?.placeableEverywhere();
    })
    .setPermissionLevel(4);
