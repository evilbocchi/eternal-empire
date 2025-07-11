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

export function findModels(instance: Instance): Model[] {
    let models = new Array<Model>();
    const children = instance.GetChildren();
    for (const child of children) {
        if (child.IsA("Folder")) {
            const found = findModels(child);
            models = [...models, ...found];
        }
        else if (child.IsA("Model")) {
            models.push(child);
        }
    }
    return models;
}