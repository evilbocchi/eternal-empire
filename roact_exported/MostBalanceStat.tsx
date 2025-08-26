import Roact from "@rbxts/roact";

<frame
	Key="MostBalanceStat"
	BackgroundColor3={Color3.fromRGB(89, 89, 89)}
	BackgroundTransparency={0.8}
	BorderSizePixel={0}
	LayoutOrder={4}
	Size={new UDim2(1, 0, 0, 35)}
>
	<uicorner />
	<uistroke Color={Color3.fromRGB(24, 24, 24)} />
	<textlabel
		Key="StatLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Size={new UDim2(0.6, 0, 0.7000000000000001, 0)}
		Text="Most Funds"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
	>
		<uistroke Thickness={2} />
	</textlabel>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0.05, 0)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<textlabel
		Key="AmountLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		Size={new UDim2(0.2, 0, 0.7000000000000001, 0)}
		Text="$0"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
	>
		<uistroke Thickness={2} />
	</textlabel>
</frame>