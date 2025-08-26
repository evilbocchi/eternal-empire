import Roact from "@rbxts/roact";

<frame
	Key="LeaderboardSlot"
	BackgroundColor3={Color3.fromRGB(255, 255, 255)}
	BorderSizePixel={0}
	Size={new UDim2(1, 0, 0, 40)}
>
	<textlabel
		Key="PlaceLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.SourceSansBold}
		FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Bold, Style = Normal }}
		Size={new UDim2(0.125, 0, 1, 0)}
		Text="1"
		TextColor3={Color3.fromRGB(0, 0, 0)}
		TextScaled={true}
		TextSize={14}
		TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
		TextStrokeTransparency={0.9}
		TextWrapped={true}
	/>
	<textlabel
		Key="ServerLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.SourceSans}
		FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.15, 0, 0, 0)}
		Size={new UDim2(0.65, 0, 1, 0)}
		Text="someone's priv"
		TextColor3={Color3.fromRGB(0, 0, 0)}
		TextScaled={true}
		TextSize={14}
		TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
		TextStrokeTransparency={0.9}
		TextWrapped={true}
	/>
	<textlabel
		Key="AmountLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.SourceSans}
		FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.85, 0, 0, 0)}
		Size={new UDim2(0.15, 0, 1, 0)}
		Text="10.00k"
		TextColor3={Color3.fromRGB(0, 0, 0)}
		TextScaled={true}
		TextSize={14}
		TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
		TextStrokeTransparency={0.9}
		TextWrapped={true}
	/>
	<uicorner CornerRadius={new UDim(0, 9)} />
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 5)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<uipadding PaddingLeft={new UDim(0, 6)} PaddingRight={new UDim(0, 6)} />
</frame>