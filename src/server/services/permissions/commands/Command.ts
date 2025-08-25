export default class Command {

    public static readonly commandsFolder = script.Parent!; 
    public readonly aliases = new Array<string>();
    public description = "<no description provided>";
    public execute: (sender: Player, ...args: string[]) => void = () => {};
    public permissionLevel = 0;

    constructor(public readonly id: string) {}

    public setDescription(description: string) {
        this.description = description;
        return this;
    }

    public addAlias(alias: string) {
        this.aliases.push(alias);
        return this;
    }

    public setExecute(execute: (sender: Player, ...args: string[]) => void) {
        this.execute = execute;
        return this;
    }

    public setPermissionLevel(level: number) {
        this.permissionLevel = level;
        return this;
    }
}

interface CommandAPI {
    ChatHook: {
        sendPrivateMessage: (player: Player, message: string, color?: string) => void;
    };
    Command: {
        findPlayers: (sender: Player, playerName: string) => Player[];
        id: (playerName: string, useId?: string) => number | undefined;
        fp: (playerName: string, userId: number) => string;
    };
    Data: {
        empireId: string;
        empireData: any;
    };
    Currency: {
        set: (currency: Currency, amount: any) => void;
    };
    Item: {
        setItemAmount: (itemId: string, amount: number) => void;
        setBoughtAmount: (itemId: string, amount: number) => void;
    };
    Permissions: {
        add: (group: string, userId: number) => boolean;
        updatePermissionLevel: (userId: number) => void;
    };
    MarketplaceService: {
        getMarketplaceStats: () => { enabled: boolean };
        setMarketplaceEnabled: (enabled: boolean) => void;
        setTradeTokenWebhook: (url: string) => void;
    };
    SimpleMarketplaceService: {
        testMarketplace: () => void;
    };
}

export const CommandAPI = ({} as unknown) as CommandAPI;