export default class Command {
    public static readonly commandsFolder = script.Parent!;
    public readonly aliases = new Array<string>();
    public description = "<no description provided>";
    public execute: (sender?: Player, ...args: string[]) => void = () => {};
    public permissionLevel = 0;

    /**
     * Creates a new Command instance.
     * @param id The unique identifier for the command.
     */
    constructor(public readonly id: string) {}

    /**
     * Sets the description of the command.
     * @param description The description to set.
     * @returns The Command instance for chaining.
     */
    public setDescription(description: string) {
        this.description = description;
        return this;
    }

    /**
     * Adds an alias for the command.
     * @param alias The alias to add.
     * @returns The Command instance for chaining.
     */
    public addAlias(alias: string) {
        this.aliases.push(alias);
        return this;
    }

    /**
     * Sets the function to execute when the command is run.
     * @param execute The function to execute. The first parameter is the player who sent the command, or undefined if in edit mode. Subsequent parameters are the arguments passed to the command.
     * @returns The Command instance for chaining.
     */
    public setExecute(execute: (sender?: Player, ...args: string[]) => void) {
        this.execute = execute;
        return this;
    }

    public setPermissionLevel(level: number) {
        this.permissionLevel = level;
        return this;
    }

    /**
     * Lists all registered commands by scanning the commands folder.
     *
     * @returns An array of all registered commands
     */
    public static listAllCommands() {
        const commands = new Map<string, Command>();
        for (const commandModule of Command.commandsFolder.GetDescendants()) {
            if (commandModule.Name === "Command" || !commandModule.IsA("ModuleScript")) continue;

            const command = require(commandModule) as Command;
            commands.set(command.id, command);
        }
        return commands;
    }
}

export const CommandAPI = {} as unknown as CommandAPI;
