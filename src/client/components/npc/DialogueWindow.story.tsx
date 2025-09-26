import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import DialogueWindow from "client/components/npc/DialogueWindow";
import StoryMocking from "client/components/StoryMocking";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            npcName: "Merchant Bob",
            dialogueText:
                "Welcome to my shop! I have many fine wares for sale. Would you like to take a look at my inventory?",
        },
    },
    (props) => {
        StoryMocking.mockData();

        Packets.nextDialogue.fromClient(() => {
            return true;
        });

        useEffect(() => {
            const model = new Instance("Model");
            model.Name = props.controls.npcName;

            const head = new Instance("Part");
            head.Name = "Head";
            head.Shape = Enum.PartType.Ball;
            head.Size = new Vector3(2, 1, 1);
            head.BrickColor = new BrickColor("Light orange");
            head.Parent = model;

            const humanoid = new Instance("Humanoid");
            humanoid.Parent = model;

            model.PrimaryPart = head;
            model.Parent = Workspace;

            task.delay(0.5, () => {
                Packets.npcMessage.toAllClients(props.controls.dialogueText, 1, 1, true, model);
            });

            return () => {
                model.Destroy();
            };
        }, [props.controls.dialogueText, props.controls.npcName]);

        // Test the component directly
        return (
            <StrictMode>
                <DialogueWindow />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
