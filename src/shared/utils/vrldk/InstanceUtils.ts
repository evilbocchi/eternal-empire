export function destroyInstance(instance?: Instance, delayBeforeDestruction?: number) {
    const destroy = () => {
        if (instance) {
            instance.Destroy();
        }
    };
    if (delayBeforeDestruction) {
        task.delay(delayBeforeDestruction, destroy);
    }
    else {
        destroy();
    }
}

export function findChildren(instance: Instance, name: string) {
    return instance.GetChildren().filter((v) => v.Name === name);
}