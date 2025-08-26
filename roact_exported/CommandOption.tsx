import Roact from "@rbxts/roact";

<frame
	Key="CommandOption"
	BackgroundColor3={Color3.fromRGB(0, 0, 0)}
	BackgroundTransparency={0.5}
	BorderSizePixel={0}
	ClipsDescendants={true}
	Size={new UDim2(1, 0, 0, 80)}
>
	<uicorner CornerRadius={new UDim(0.25, 0)} />
	<textlabel
		Key="DescriptionLabel"
		Active={true}
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		Size={new UDim2(1, 0, 0.5, 0)}
		Text="Funds"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={25}
		TextWrapped={true}
		TextYAlignment={Enum.TextYAlignment.Top}
	>
		<uitextsizeconstraint MaxTextSize={25} />
		<uistroke Thickness={2} />
	</textlabel>
	<textlabel
		Key="AliasLabel"
		Active={true}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Position={new UDim2(0, 0, 0.1, 0)}
		Size={new UDim2(0.5, 0, 0.4, 0)}
		Text="/command"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
	>
		<uistroke Thickness={2} />
	</textlabel>
	<textlabel
		Key="PermLevelLabel"
		Active={true}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		Position={new UDim2(0.5, 0, 0.15, 0)}
		Size={new UDim2(0.5, 0, 0.3, 0)}
		Text="Permission Level 1"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
	>
		<uistroke Thickness={2} />
	</textlabel>
</frame>