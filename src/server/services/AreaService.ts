import { OnInit, Service } from "@flamework/core";
import { Players, SoundService } from "@rbxts/services";
import { GameAssetService } from "server/services/GameAssetService";
import { LeaderstatsService } from "server/services/LeaderstatsService";
import Area from "shared/Area";
import { AREAS } from "shared/constants";

@Service()
export class AreaService implements OnInit {
    musicGroup = new Instance("SoundGroup");

    constructor(private leaderstatsService: LeaderstatsService, private gameAssetService: GameAssetService) {

    }

    getArea(player: Player): keyof (typeof AREAS) {
        return player.GetAttribute("Area") as keyof (typeof AREAS);
    }

    setArea(player: Player, id: keyof (typeof AREAS)) {
        this.leaderstatsService.setLeaderstat(player, "Area", AREAS[id].name);
        player.SetAttribute("Area", id);
    }

    loadArea(id: keyof (typeof AREAS), area: Area) {
        this.loadAreaGroup(id, area);
        this.loadBoardGui(id, area);
    }

    loadAreaGroup(id: keyof (typeof AREAS), area: Area) {
        const areaSoundGroup = new Instance("SoundGroup");
        areaSoundGroup.Name = id;
        areaSoundGroup.Volume = 1;
        areaSoundGroup.Parent = this.musicGroup;
        for (const sound of area.areaBounds.GetChildren()) {
            if (!sound.IsA("Sound"))
                return;
            sound.SoundGroup = areaSoundGroup;
            sound.Parent = areaSoundGroup;
        }

        area.areaBounds.Touched.Connect((otherPart) => {
            const character = otherPart.Parent;
            if (character === undefined) {
                return;
            }
            const player = Players.GetPlayerFromCharacter(character);
            if (player !== undefined) {
                const cached = this.getArea(player);
                if (cached !== id) {
                    this.setArea(player, id);
                }
            }
        });
    }

    loadBoardGui(id: keyof (typeof AREAS), area: Area) {
        const boardGui = area.serverBoardGui;
        const nv = new Instance("IntValue");
        const updateBar = (n: number) => {
            const max = area.dropletLimit.Value;
            const perc = n / max;
            boardGui.DropletLimit.Bar.Fill.Size = new UDim2(perc, 0, 1, 0);
            boardGui.DropletLimit.Bar.BarLabel.Text = n + "/" + max;
            boardGui.DropletLimit.Bar.Fill.BackgroundColor3 = perc < 0.5 ? Color3.fromRGB(85, 255, 127) : (perc < 0.75 ? Color3.fromRGB(255, 170, 0) : Color3.fromRGB(255, 0, 0));
        }
        area.dropletLimit.Changed.Connect(() => updateBar(nv.Value));
        nv.Changed.Connect((value) => updateBar(value));
        for (const d of this.gameAssetService.placedItemsFolder.GetChildren()) {
            if (d.Name === "Droplet" && d.GetAttribute("Area") === id)
                nv.Value += 1;
        }
        this.gameAssetService.placedItemsFolder.ChildAdded.Connect((d) => {
            if (d.Name === "Droplet" && d.GetAttribute("Area") === id) {
                nv.Value += 1;
                d.Destroying.Once(() => {
                    nv.Value -= 1;
                });
            }
        });
        nv.Name = "DropletCount";
        nv.Parent = area.areaFolder;
        updateBar(nv.Value);
    }

    onInit() {
        this.musicGroup.Name = "Music";
        this.musicGroup.Volume = 1;
        this.musicGroup.Parent = SoundService;
        for (const [id, area] of pairs(AREAS)) {
            this.loadArea(id, area);
        }
    }
}