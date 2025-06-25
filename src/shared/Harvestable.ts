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
    MagicalTree: {
        health: 300,
        tool: "Axe",
        name: "Magical Tree",
        gives: new Map([["MagicalWood", [2, 4]]]),
    },

    Grass: {
        health: 3,
        tool: "Scythe",
    },
    QualityGrass: {
        health: 30,
        tool: "Scythe",
        name: "Quality Grass",
        gives: new Map([["Grass", [3, 7]]]),
    },
    GrassPack: {
        health: 60,
        tool: "Scythe",
        name: "Grass Pack",
        gives: new Map([["Grass", [6, 26]]]),
    },
    EnchantedGrass: {
        health: 120,
        tool: "Scythe",
    },
    CorruptedGrass: {
        health: 9999,
        tool: "Scythe",
        name: "Corrupted Grass",
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
    },
    Crystal: {
        health: 200,
        tool: "Pickaxe",
    },
    Iron: {
        health: 480,
        tool: "Pickaxe",
    },
    Gold: {
        health: 1260,
        tool: "Pickaxe",
    },
    Quartz: {
        health: 4160,
        tool: "Pickaxe",
    },
    Jade: {
        health: 17520,
        tool: "Pickaxe",
    },
    PureCrystal: {
        health: 2200,
        tool: "Pickaxe",
        name: "Pure Crystal",
        gives: new Map([["Crystal", [2, 4]]]),
    },
    PureIron: {
        health: 6000,
        tool: "Pickaxe",
        name: "Pure Iron",
        gives: new Map([["Iron", [2, 4]]]),
    },

    CorruptedStone: {
        health: 9999,
        tool: "Pickaxe",
        name: "Corrupted Stone",
        gives: new Map([["ExcavationStone", [2, 4]]]),
    }
}

const Harvestable = RawHarvestable as {[id: string]: HarvestableData};

export default Harvestable;