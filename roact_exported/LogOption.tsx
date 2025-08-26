import Roact from "@rbxts/roact";

<frame
	Key="LogOption"
	BackgroundColor3={Color3.fromRGB(0, 0, 0)}
	BackgroundTransparency={0.5}
	BorderSizePixel={0}
	ClipsDescendants={true}
	Size={new UDim2(1, 0, 0, 80)}
>
	<uicorner CornerRadius={new UDim(0.25, 0)} />
	<textlabel
		Key="TimestampLabel"
		Active={true}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Size={new UDim2(1, 0, 0.35000000000000003, 0)}
		Text="17/25/2024 00:00:00"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
	>
		<uistroke Thickness={2} />
	</textlabel>
	<textlabel
		Key="DetailsLabel"
		Active={true}
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.5, 0, 0, 0)}
		Size={new UDim2(1, 0, 0.6, 0)}
		Text="someperson placed Item at 13"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={25}
		TextWrapped={true}
		TextYAlignment={Enum.TextYAlignment.Top}
	>
		<uitextsizeconstraint MaxTextSize={25} />
		<uistroke Thickness={2} />
	</textlabel>
	<uipadding
		PaddingBottom={new UDim(0, 5)}
		PaddingLeft={new UDim(0, 5)}
		PaddingRight={new UDim(0, 5)}
		PaddingTop={new UDim(0, 5)}
	/>
	<uilistlayout
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 10)}
		SortOrder={Enum.SortOrder.LayoutOrder}
	/>
</frame>