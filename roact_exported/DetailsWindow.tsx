import Roact from "@rbxts/roact";

<frame
	Key="DetailsWindow"
	AnchorPoint={new Vector2(0, 1)}
	AutomaticSize={Enum.AutomaticSize.XY}
	BackgroundColor3={Color3.fromRGB(0, 0, 0)}
	BackgroundTransparency={0.8}
	BorderSizePixel={0}
	Position={new UDim2(0, 0, 1, 0)}
>
	<uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} SortOrder={Enum.SortOrder.LayoutOrder} />
	<textlabel
		Key="FundsBombLabel"
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		LayoutOrder={-5}
		Size={new UDim2(0, 0, 0, 28)}
		Text="Funds Bomb Active (1.2x): 10:00:00"
		TextColor3={Color3.fromRGB(170, 255, 127)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
		Visible={false}
	>
		<uistroke Thickness={2} />
		<uipadding
			PaddingBottom={new UDim(0, 5)}
			PaddingLeft={new UDim(0, 15)}
			PaddingRight={new UDim(0, 15)}
			PaddingTop={new UDim(0, 5)}
		/>
	</textlabel>
</frame>