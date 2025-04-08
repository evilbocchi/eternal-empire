import { Service } from "@flamework/core";

@Service()
export class LeaderstatsService {
    getLeaderstats(player: Player) {
        let leaderstats = player.FindFirstChild("leaderstats");
        if (leaderstats === undefined) {
            leaderstats = new Folder();
            leaderstats.Name = "leaderstats";
            leaderstats.Parent = player;
        }
        return leaderstats;
    }

    getLeaderstat(player: Player, leaderstat: string) {
        const leaderstats = this.getLeaderstats(player);
        const statValueObject = leaderstats.FindFirstChild(leaderstat) as IntValue | NumberValue | StringValue;
        return statValueObject ? statValueObject.Value : undefined;
    }

    setLeaderstat(player: Player, leaderstat: string, value: string | number) {
        const leaderstats = this.getLeaderstats(player);
        let statValueObject = leaderstats.FindFirstChild(leaderstat) as IntValue | NumberValue | StringValue | undefined;
        if (statValueObject === undefined) {
            statValueObject = new Instance(
                typeOf(value) === "number" ? ((value as number) % 1 > 0 ? "NumberValue" : "IntValue") : "StringValue");
            statValueObject.Name = leaderstat;
            statValueObject.Parent = leaderstats;
        }
        statValueObject.Value = value;
    }

    load(player: Player) {
        const leaderstats = this.getLeaderstats(player);
        return leaderstats;
    }
}