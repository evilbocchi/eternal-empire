type Toggleable = ParticleEmitter | Beam | Script;

namespace ReserveModels {
    export const reserveModelsPerId = new Map<string, Model[]>();
    export const particles = new Map<Toggleable, boolean>();
    export const itemModels = new Map<string, Model>();

    export function reserveModels(itemId: string, model?: Model) {
        if (model === undefined) {
            model = ReserveModels.itemModels.get(itemId)!;
        }
        else {
            const children = model.GetDescendants();
            for (const child of children) {
                if (child.IsA("ParticleEmitter") || child.IsA("Beam") || child.IsA("Script")) {
                    ReserveModels.particles.set(child, child.Enabled);
                }
            }
            ReserveModels.itemModels.set(itemId, model);
        }
        // let reserveModelFolder = RESERVE_MODELS_FOLDER.FindFirstChild(itemId);
        // if (reserveModelFolder === undefined) {
        //     reserveModelFolder = new Instance("Folder");
        //     reserveModelFolder.Name = itemId;
        // }
        // const models = ReserveModels.reserveModelsPerId.get(itemId) ?? new Array<Model>();
        // for (let i = 0; i < 2; i++) {
        //     const clone = model.Clone();
        //     const children = clone.GetDescendants();
        //     const map = new Map<Toggleable, boolean>();
        //     for (const child of children) {
        //         if (child.IsA("ParticleEmitter") || child.IsA("Beam") || child.IsA("Script")) {
        //             map.set(child, child.Enabled);
        //             child.Enabled = false;
        //         }
        //     }
        //     ReserveModels.particlesPerModel.set(clone, map);
        //     clone.Destroying.Once(() => ReserveModels.particlesPerModel.delete(clone));
        //     clone.PivotTo(new CFrame(0, -1000, 0));
        //     models.push(clone);
        //     clone.Parent = reserveModelFolder;
        // }
        // ReserveModels.reserveModelsPerId.set(itemId, models);
        // reserveModelFolder.Parent = RESERVE_MODELS_FOLDER;

        // disabled for pathfinding
    }

    export function fetchReserve(itemId: string) {
        // const reserveModels = ReserveModels.reserveModelsPerId.get(itemId);
        // if (reserveModels === undefined) {
        //     error("Howoao");
        // }
        // if (reserveModels.isEmpty()) {
        //     ReserveModels.reserveModels(itemId, ReserveModels.itemModels.get(itemId)!);
        // }
        // const model = reserveModels.pop()!;
        // const particles = ReserveModels.particlesPerModel.get(model)!;
        // for (const [particle, enabled] of particles) {
        //     particle.Enabled = enabled;
        // }
        // return model;
        return ReserveModels.itemModels.get(itemId)?.Clone();
    }
}

export = ReserveModels;