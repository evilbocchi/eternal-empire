import { OnoeNum } from "@rbxts/serikanum";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import { LeaderboardEntry, LeaderboardType } from "client/components/world/leaderboard/Leaderboard";
import LeaderboardRenderer from "client/components/world/leaderboard/LeaderboardRenderer";
import Packets from "shared/Packets";

// Mock data for different leaderboard types
const mockEntries: { [key: string]: LeaderboardEntry[] } = {
    Funds: [
        { place: 1, name: "RichEmpire", amount: 1500000000 },
        { place: 2, name: "MoneyMakers Inc", amount: 987000000 },
        { place: 3, name: "GoldRush Co", amount: 654000000 },
        { place: 4, name: "DiamondDiggers", amount: 432000000 },
        { place: 5, name: "CashFlow Empire", amount: 298000000 },
        { place: 6, name: "ProfitKings", amount: 187000000 },
        { place: 7, name: "WealthBuilders", amount: 123000000 },
        { place: 8, name: "FortuneHunters", amount: 89000000 },
        { place: 9, name: "SuccessLtd", amount: 67000000 },
        { place: 10, name: "EconomyMasters", amount: 45000000 },
    ],
    Power: [
        { place: 1, name: "PowerPlant Pro", amount: 850000000 },
        { place: 2, name: "EnergyTycoon", amount: 672000000 },
        { place: 3, name: "VoltageVillage", amount: 543000000 },
        { place: 4, name: "ElectricEmpire", amount: 398000000 },
        { place: 5, name: "GeneratorGuru", amount: 287000000 },
        { place: 6, name: "CurrentCorp", amount: 198000000 },
        { place: 7, name: "WattageWorks", amount: 134000000 },
        { place: 8, name: "CircuitCity", amount: 98000000 },
        { place: 9, name: "BatteryBase", amount: 76000000 },
        { place: 10, name: "ChargeChamps", amount: 54000000 },
    ],
    Skill: [
        { place: 1, name: "SkillMaster9000", amount: 750 },
        { place: 2, name: "TalentedTycoon", amount: 698 },
        { place: 3, name: "ExpertEmpire", amount: 643 },
        { place: 4, name: "ProPlayers", amount: 587 },
        { place: 5, name: "MasterCrafters", amount: 523 },
        { place: 6, name: "SkillfulSuite", amount: 467 },
        { place: 7, name: "CompetentCorp", amount: 398 },
        { place: 8, name: "AbleCorp", amount: 334 },
        { place: 9, name: "CapableInc", amount: 287 },
        { place: 10, name: "TalentTraders", amount: 234 },
    ],
    TimePlayed: [
        { place: 1, name: "AlwaysOnline", amount: 2847 },
        { place: 2, name: "TimeSpender", amount: 2156 },
        { place: 3, name: "DedicatedPlayer", amount: 1987 },
        { place: 4, name: "LongTimeGamer", amount: 1654 },
        { place: 5, name: "MarathonPlayer", amount: 1432 },
        { place: 6, name: "TimeInvestor", amount: 1298 },
        { place: 7, name: "PatientPlayer", amount: 1067 },
        { place: 8, name: "SteadyGamer", amount: 987 },
        { place: 9, name: "ConsistentUser", amount: 854 },
        { place: 10, name: "RegularPlayer", amount: 743 },
    ],
    Level: [
        { place: 1, name: "LevelMax", amount: 999 },
        { place: 2, name: "HighLeveler", amount: 876 },
        { place: 3, name: "TopTier", amount: 745 },
        { place: 4, name: "ElitePlayer", amount: 698 },
        { place: 5, name: "AdvancedUser", amount: 634 },
        { place: 6, name: "SkilledGamer", amount: 587 },
        { place: 7, name: "ExperiencedOne", amount: 523 },
        { place: 8, name: "LeveledUp", amount: 467 },
        { place: 9, name: "ProgressMaker", amount: 398 },
        { place: 10, name: "RisingPlayer", amount: 334 },
    ],
    Donated: [
        { place: 1, name: "GenerousGiver", amount: 50000000 },
        { place: 2, name: "BigDonator", amount: 37500000 },
        { place: 3, name: "CharityChamp", amount: 28900000 },
        { place: 4, name: "KindHeart", amount: 19800000 },
        { place: 5, name: "GivingSpirit", amount: 15600000 },
        { place: 6, name: "DonationKing", amount: 12300000 },
        { place: 7, name: "HelpfulHero", amount: 9870000 },
        { place: 8, name: "SupportiveOne", amount: 7650000 },
        { place: 9, name: "CaringPlayer", amount: 5430000 },
        { place: 10, name: "ThoughtfulUser", amount: 3210000 },
    ],
};

// Convert amounts to OnoeNum
for (const [_, entries] of pairs(mockEntries)) {
    for (const entry of entries) {
        entry.amount = new OnoeNum(entry.amount).toSingle();
    }
}

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        const map = new Map<LeaderboardType, LeaderboardEntry[]>();
        for (const [key, entries] of pairs(mockEntries)) {
            map.set(key as LeaderboardType, entries);
        }

        Packets.leaderboardData.set(map);

        // NOTE: You need to switch to Viewport mode to see this story in the world
        return <LeaderboardRenderer />;
    },
);
