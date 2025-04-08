declare global {
    type HarvestableId = keyof (typeof RawHarvestable);
    type HarvestableData = {
        health: number,
        tool: ToolType,
        name?: string,
        description?: string,
        gives?: Map<string, number[]>,
    }
}

const RawHarvestable = {
    StaleWood: {
        health: 4,
        tool: "Axe",
        name: "Stale Wood",
        description: "Apparently, wood can go stale too, and these logs have been through tough times to be in such a rotted state."
    },
    Tree: {
        health: 30,
        tool: "Axe",
        name: "Tree",
        gives: new Map([["StaleWood", [3, 7]]]),
    },
    MagicalWood: {
        health: 80,
        tool: "Axe",
        name: "Magical Wood",
    },
    AppleTree: {
        health: 40,
        tool: "Axe",
        name: "Apple Tree",
        gives: new Map([["StaleWood", [3, 7]], ["Apple", [2, 6]]]),
    },

    Grass: {
        health: 3,
        tool: "Scythe",
        description: "Literally just grass. A source of nutrition for those residing in Barren Islands, but serves no other actual purpose... maybe."
    },
    QualityGrass: {
        health: 30,
        tool: "Scythe",
        name: "Quality Grass",
        gives: new Map([["Grass", [3, 7]]]),
    },
    EnchantedGrass: {
        health: 120,
        tool: "Scythe",
    },
    WinsomeSpeck: {
        health: 160,
        name: "Winsome Speck",
        tool: "Scythe",
        description: "A common substance secreted by Slamos while they are asleep. While the Skill level of the average Slamo is generally slightly above Winsome, excess Skill released by this peculiar species usually breaks down into this exact form."
    },
    Apple: {
        health: 10,
        tool: "Scythe",
        description: "The Slamos' favorite past-time snack. Grows extraordinarily well in Slamo Village."
    },
    AppleBush: {
        health: 25,
        tool: "Scythe",
        name: "Apple Bush",
        gives: new Map([["Apple", [2, 4]]]),
    },

    ExcavationStone: {
        health: 4,
        tool: "Pickaxe",
        name: "Stone",
    },
    StonePillar: {
        health: 25,
        tool: "Pickaxe",
        name: "Stone Pillar",
        gives: new Map([["ExcavationStone", [3, 7]]]),
    },
    WhiteGem: {
        health: 80,
        tool: "Pickaxe",
        name: "White Gem",
    },
    Crystal: {
        health: 200,
        tool: "Pickaxe",
        name: "Crystal",
    },
    Iron: {
        health: 480,
        tool: "Pickaxe",
        name: "Iron",
    },
    Gold: {
        health: 1260,
        tool: "Pickaxe",
        name: "Gold",
    },
}

const Harvestable = RawHarvestable as {[id: string]: HarvestableData};

export default Harvestable;