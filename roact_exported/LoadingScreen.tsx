import Roact from "@rbxts/roact";

<screengui
	Key="LoadingScreen"
	DisplayOrder={5}
	IgnoreGuiInset={true}
	ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<frame Key="LoadingWindow" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false} />
</screengui>