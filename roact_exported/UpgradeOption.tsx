import Roact from "@rbxts/roact";

<frame
	Key="UpgradeOption"
	Active={true}
	BackgroundTransparency={1}
	Selectable={true}
	Size={new UDim2(0, 125, 0, 125)}
>
	<frame
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundColor3={Color3.fromRGB(115, 115, 115)}
		BorderSizePixel={0}
		LayoutOrder={-5}
		Position={new UDim2(0.5, 4, 0.5, 4)}
		Rotation={-2}
		Size={new UDim2(0.9, 0, 0.9, 0)}
		ZIndex={0}
	/>
	<textlabel
		Key="AmountLabel"
		AnchorPoint={new Vector2(0, 0.5)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		Position={new UDim2(0, 0, 0.9, 0)}
		Size={new UDim2(1, 0, 0.4, 0)}
		Text="2"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
		ZIndex={2}
	>
		<uistroke Thickness={2} />
	</textlabel>
	<imagebutton
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundColor3={Color3.fromRGB(255, 255, 255)}
		BorderSizePixel={0}
		Position={new UDim2(0.5, -2, 0.5, -2)}
		Rotation={-2}
		Selectable={false}
		Size={new UDim2(0.9, 0, 0.9, 0)}
	/>
</frame>