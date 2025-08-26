import Roact from "@rbxts/roact";

<frame
	Key="PriceOption"
	AutomaticSize={Enum.AutomaticSize.X}
	BackgroundColor3={Color3.fromRGB(0, 0, 0)}
	BackgroundTransparency={0.8}
	BorderSizePixel={0}
	Size={new UDim2(0, 0, 0, 25)}
>
	<textlabel
		Key="AmountLabel"
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Size={new UDim2(0, 0, 1, 0)}
		Text="hag"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={24}
		TextWrapped={true}
	>
		<uistroke Color={Color3.fromRGB(5, 16, 0)} Thickness={2} />
	</textlabel>
	<imagelabel
		BackgroundTransparency={1}
		Image="rbxassetid://17574921441"
		ImageContent={Content}
		Size={new UDim2(1, 0, 1, 0)}
		SizeConstraint={Enum.SizeConstraint.RelativeYY}
	/>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 5)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<viewportframe
		BackgroundTransparency={1}
		Size={new UDim2(1, 0, 1, 0)}
		SizeConstraint={Enum.SizeConstraint.RelativeYY}
		Visible={false}
	/>
	<uipadding
		PaddingBottom={new UDim(0, 1)}
		PaddingLeft={new UDim(0, 10)}
		PaddingRight={new UDim(0, 10)}
		PaddingTop={new UDim(0, 1)}
	/>
	<uicorner CornerRadius={new UDim(0, 4)} />
</frame>