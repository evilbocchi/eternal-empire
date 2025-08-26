import Roact from "@rbxts/roact";

<surfacegui
	Key="UpgradeOptionsGui"
	ClipsDescendants={true}
	LightInfluence={1}
	MaxDistance={1000}
	SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<uipadding
		PaddingBottom={new UDim(0, 25)}
		PaddingLeft={new UDim(0, 25)}
		PaddingRight={new UDim(0, 25)}
		PaddingTop={new UDim(0, 25)}
	/>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 5)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
</surfacegui>