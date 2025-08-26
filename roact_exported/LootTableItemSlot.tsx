import Roact from "@rbxts/roact";

<frame Key="LootTableItemSlot" BackgroundTransparency={1} LayoutOrder={55} Size={new UDim2(1, 0, 0, 40)}>
	<viewportframe
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundTransparency={1}
		LayoutOrder={-1}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		Size={new UDim2(0, 0, 1.25, 0)}
		SizeConstraint={Enum.SizeConstraint.RelativeYY}
	>
		<uiaspectratioconstraint AspectType={Enum.AspectType.ScaleWithParentSize} DominantAxis={Enum.DominantAxis.Height} />
	</viewportframe>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 5)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<textlabel
		Key="TitleLabel"
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		RichText={true}
		Size={new UDim2(0, 0, 1, 0)}
		Text="x1 Stone"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextSize={20}
		TextStrokeTransparency={0}
		TextWrapped={true}
	/>
</frame>