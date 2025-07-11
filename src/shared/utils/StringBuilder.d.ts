declare interface StringBuilder {
    append(str: unknown): StringBuilder;
    appendAll(...str: unknown[]): StringBuilder;
    toString(): string;
}

declare interface StringBuilderConstructor {
    new(...str: string[]): StringBuilder;
}

declare const StringBuilder: StringBuilderConstructor;

export = StringBuilder;