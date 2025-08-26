import Roact from "@rbxts/roact";

<frame
	Key="PlayerSlot"
	BackgroundColor3={Color3.fromRGB(163, 163, 163)}
	BackgroundTransparency={0.2}
	BorderSizePixel={0}
	Size={new UDim2(0, 100, 0, 100)}
>
	<uiaspectratioconstraint AspectType={Enum.AspectType.ScaleWithParentSize} DominantAxis={Enum.DominantAxis.Height} />
	<uicorner CornerRadius={new UDim(0.5, 0)} />
	<imagelabel
		Key="Avatar"
		BackgroundTransparency={1}
		ScaleType={Enum.ScaleType.Fit}
		Size={new UDim2(1, 0, 1, 0)}
	/>
</frame>