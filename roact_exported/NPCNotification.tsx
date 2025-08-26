import Roact from "@rbxts/roact";

<billboardgui
	Key="NPCNotification"
	Active={true}
	ClipsDescendants={true}
	Enabled={false}
	Size={new UDim2(2, 0, 2, 0)}
	StudsOffset={new Vector3(0, 4, 0)}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<imagelabel
		BackgroundTransparency={1}
		Image="rbxassetid://17368181531"
		ImageContent={Content}
		Rotation={90}
		Size={new UDim2(1, 0, 1, 0)}
	/>
</billboardgui>