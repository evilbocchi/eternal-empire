declare namespace Signal {
	export interface Connection {
		disconnect(): void;
		connected: boolean;
	}
}

interface Signal<T extends Callback = Callback> {
	fire(...args: Parameters<T>): void;
	wait(): LuaTuple<Parameters<T>>;
	connect(handler: T): Signal.Connection;
	disconnectAll(): void;
	destroy(): void;
}

interface SignalConstructor {
	new <T extends Callback = Callback>(): Signal<T>;
	readonly is: (obj: unknown) => obj is Signal<Callback>;
	readonly wrap: <T extends Callback>(rbxScriptSignal: RBXScriptSignal<T>) => Signal<T>;
}

declare const Signal: SignalConstructor;
export = Signal;