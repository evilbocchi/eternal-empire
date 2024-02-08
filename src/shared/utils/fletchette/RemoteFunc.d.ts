interface RemoteFunc<T extends Callback = Callback> {
	invoke(player: Player, ...args: Parameters<T>): void;
	onInvoke(handler: (player: Player, ...args: Parameters<T>) => void): void;
	destroy(): void;
	remoteFunction: RemoteFunction;
}

interface RemoteFuncConstructor {
	new <T extends Callback = Callback>(): RemoteFunc<T>;
	readonly is: (obj: unknown) => obj is RemoteFunc;
}

declare const RemoteFunc: RemoteFuncConstructor;

export = RemoteFunc;