interface ClientRemoteSignal<T extends Callback = Callback> {
	fire(...args: Parameters<T>): void;
	connect(handler: T): RBXScriptConnection;
	destroy(): void;
}

interface ClientRemoteSignalConstructor {
	new <T extends Callback>(remoteEvent: RemoteEvent<T>): ClientRemoteSignal<T>;
}

declare const ClientRemoteSignal: ClientRemoteSignalConstructor;

export = ClientRemoteSignal;
