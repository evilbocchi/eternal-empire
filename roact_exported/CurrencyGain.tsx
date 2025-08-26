import Roact from "@rbxts/roact";

<frame
	Key="CurrencyGain"
	AutomaticSize={Enum.AutomaticSize.XY}
	BackgroundTransparency={1}
	Position={new UDim2(0, 500, 0, 550)}
>
	<imagelabel
		AnchorPoint={new Vector2(0, 0.5)}
		BackgroundTransparency={1}
		Image="rbxassetid://17574921441"
		ImageContent={Content}
		LayoutOrder={2}
		Size={new UDim2(0, 20, 0, 20)}
		ZIndex={4}
	/>
	<textlabel
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
		Size={new UDim2(0, 0, 0, 20)}
		Text="2592"
		TextColor3={Color3.fromRGB(183, 255, 161)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
	>
		<uistroke Thickness={2} />
	</textlabel>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		Padding={new UDim(0, 3)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
</frame>