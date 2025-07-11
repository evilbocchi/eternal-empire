import Signal from "./Signal";

interface ClientRemoteProperty<T> {
	get(): T;
	isReady(): boolean;
	destroy(): void;
	observe(observer: (value: T) => void): Signal.Connection; 
	readonly changed: Signal<(value: T) => void>;
}

interface ClientRemotePropertyConstructor {
	new <T>(valueObject: RemoteEvent): ClientRemoteProperty<T>;
}

declare const ClientRemoteProperty: ClientRemotePropertyConstructor;

export = ClientRemoteProperty;
