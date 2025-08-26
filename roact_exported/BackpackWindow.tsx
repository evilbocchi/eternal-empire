import Roact from "@rbxts/roact";

<frame
	Key="BackpackWindow"
	AnchorPoint={new Vector2(0.5, 1)}
	BackgroundTransparency={1}
	Position={new UDim2(0.5, 0, 0.985, -5)}
	Size={new UDim2(0.45, 200, 0.035, 35)}
	ZIndex={0}
>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 10)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
</frame>