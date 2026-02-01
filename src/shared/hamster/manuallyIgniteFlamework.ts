import { Flamework, Modding, OnInit, OnPhysics, OnRender, OnStart, OnTick, Reflect } from "@flamework/core";
import { isConstructor } from "@flamework/core/out/utility";
import { Players, RunService } from "@rbxts/services";

export default function manuallyIgniteFlamework() {
    // preload
    let isPreloading = false;
    const paths = [["ServerScriptService", "services"]];
    const preloadPaths = new Array<Instance>();
    for (const arg of paths) {
        const service = arg.shift();
        let currentPath = game.GetService(service as keyof Services) as Instance;
        if (service === "StarterPlayer") {
            if (arg[0] !== "StarterPlayerScripts") throw "StarterPlayer only supports StarterPlayerScripts";
            if (!RunService.IsClient()) throw "The server cannot load StarterPlayer content";
            currentPath = Players.LocalPlayer.WaitForChild("PlayerScripts");
            arg.shift();
        }
        for (let i = 0; i < arg.size(); i++) {
            currentPath = currentPath.WaitForChild(arg[i]);
        }
        preloadPaths.push(currentPath);
    }

    const preload = (moduleScript: ModuleScript) => {
        isPreloading = true;
        const start = os.clock();
        const [success, value] = pcall(() => require(moduleScript));
        const endTime = math.floor((os.clock() - start) * 1000);
        isPreloading = false;
        if (!success) {
            throw `${moduleScript.GetFullName()} failed to preload (${endTime}ms): ${value}`;
        }
    };

    for (const path of preloadPaths) {
        if (path.IsA("ModuleScript")) {
            preload(path);
        }
        for (const instance of path.GetDescendants()) {
            if (instance.IsA("ModuleScript")) {
                preload(instance);
            }
        }
    }

    // ignite
    const idToObj = (Reflect as unknown as { idToObj: Map<string, object> }).idToObj;

    let inactiveThread: thread | undefined;
    function reusableThread(func: () => void) {
        const thread = coroutine.running();

        while (true) {
            if (inactiveThread === thread) {
                inactiveThread = undefined;
            }

            func();

            // If there's a different idle thread, we should end the current thread.
            if (inactiveThread !== undefined) {
                break;
            }

            inactiveThread = thread;
            [func] = coroutine.yield() as LuaTuple<[never]>;
        }
    }
    function reuseThread(func: () => void) {
        if (inactiveThread) {
            task.spawn(inactiveThread, func);
        } else {
            task.spawn(reusableThread, func);
        }
    }
    function profileYielding(func: () => void, _identifier: string) {
        return func;
    }
    function getIdentifier(obj: object, suffix = ""): string {
        return Reflect.getMetadata<string>(obj, "identifier") ?? `UnidentifiedFlameworkListener${suffix}`;
    }
    function topologicalSort(objects: string[]) {
        // This implementation ignores circular dependency trees.
        let currentSize = 0;
        const sorted = new Map<string, number>();
        const visited = new Set<string>();
        const visitor = (node: string) => {
            if (visited.has(node)) return;
            visited.add(node);

            const object = idToObj.get(node);
            if (!object) return;

            const dependencies = Reflect.getMetadata<string[]>(object, "flamework:parameters");
            for (const dependency of dependencies ?? []) {
                visitor(dependency);
            }

            sorted.set(node, currentSize++);
        };

        for (const node of objects) {
            visitor(node);
        }

        return sorted;
    }

    for (const [, ctor] of idToObj) {
        if (!isConstructor(ctor)) continue;
        //if (!Reflect.getMetadata<boolean>(ctor, "flamework:singleton")) continue;
        if (Reflect.getMetadata<boolean>(ctor, "flamework:optional")) continue;

        Modding.resolveSingleton(ctor);
    }

    const dependencies = new Array<[instance: object, loadOrder: number]>();
    type Constructor<T = object> = new (...args: never[]) => T;
    const singletons = (Modding as unknown as { getSingletons: () => Map<Constructor, object> }).getSingletons();
    for (const [ctor, dependency] of singletons) {
        const loadOrder = Reflect.getMetadata<number>(ctor, "flamework:loadOrder") ?? 1;
        dependencies.push([dependency, loadOrder]);
    }

    const sortedDependencies = topologicalSort(dependencies.map(([obj]) => getIdentifier(obj)));
    const start = new Array<[OnStart, string]>();
    const init = new Array<[OnInit, string]>();

    const tick = new Map<OnTick, string>();
    const render = new Map<OnRender, string>();
    const physics = new Map<OnPhysics, string>();

    dependencies.sort(([depA, aOrder], [depB, bOrder]) => {
        if (aOrder !== bOrder) {
            return aOrder < bOrder;
        }

        const aIndex = sortedDependencies.get(getIdentifier(depA))!;
        const bIndex = sortedDependencies.get(getIdentifier(depB))!;
        return aIndex < bIndex;
    });

    Modding.onListenerAdded<OnTick>((object) => tick.set(object, getIdentifier(object, "/OnTick")));
    Modding.onListenerAdded<OnPhysics>((object) => physics.set(object, getIdentifier(object, "/OnPhysics")));
    Modding.onListenerAdded<OnRender>((object) => render.set(object, getIdentifier(object, "/OnRender")));

    Modding.onListenerRemoved<OnTick>((object) => tick.delete(object));
    Modding.onListenerRemoved<OnPhysics>((object) => physics.delete(object));
    Modding.onListenerRemoved<OnRender>((object) => render.delete(object));

    for (const [dependency] of dependencies) {
        if (Flamework.implements<OnInit>(dependency)) init.push([dependency, getIdentifier(dependency)]);
        if (Flamework.implements<OnStart>(dependency)) start.push([dependency, getIdentifier(dependency)]);
    }

    for (const [dependency, identifier] of init) {
        const initResult = dependency.onInit();
        if (Promise.is(initResult)) {
            const [status, value] = initResult.awaitStatus();
            if (status === Promise.Status.Rejected) {
                throw `OnInit failed for dependency '${identifier}'. ${tostring(value)}`;
            }
        }
    }

    debug.resetmemorycategory();

    const heartbeatConn = RunService.Heartbeat.Connect((dt) => {
        for (const [dependency, identifier] of tick) {
            reuseThread(profileYielding(() => dependency.onTick(dt), identifier));
        }
    });

    const steppedConn = RunService.Stepped.Connect((time, dt) => {
        for (const [dependency, identifier] of physics) {
            reuseThread(profileYielding(() => dependency.onPhysics(dt, time), identifier));
        }
    });

    for (const [dependency, identifier] of start) {
        reuseThread(profileYielding(() => dependency.onStart(), identifier));
    }

    return {
        cleanup: () => {
            heartbeatConn.Disconnect();
            steppedConn.Disconnect();

            task.delay(5, () => {
                for (const [, ctor] of idToObj) {
                    if (!isConstructor(ctor)) continue;
                    table.clear(ctor);
                }
                idToObj.clear();

                for (const [dependency] of dependencies) {
                    table.clear(dependency);
                }
                dependencies.clear();
                sortedDependencies.clear();
            });
        },
        dependencies,
        init,
        start,
        tick,
        render,
        physics,
    };
}
