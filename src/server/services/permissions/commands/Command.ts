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

export const CommandAPI = {} as unknown as CommandAPI;
