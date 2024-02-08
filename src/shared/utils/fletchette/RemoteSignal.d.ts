interface RemoteSignal<T extends Callback = Callback> {
	fire(player: Player, ...args: Parameters<T>): void;
	fireAll(...args: Parameters<T>): void;
	fireExcept(player: Player, ...args: Parameters<T>): void;
	isUnreliable(): boolean;
	connect(handler: (player: Player, ...args: Parameters<T>) => void): RBXScriptConnection;
	destroy(): void;
	remoteEvent: RemoteEvent & UnreliableRemoteEvent;
}

interface RemoteSignalConstructor {
	new <T extends Callback = Callback>(unreliable?: boolean): RemoteSignal<T>;
	readonly is: (obj: unknown) => obj is RemoteSignal;
}

declare const RemoteSignal: RemoteSignalConstructor;

export = RemoteSignal;