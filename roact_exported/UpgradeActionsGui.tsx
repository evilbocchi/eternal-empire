import Roact from "@rbxts/roact";

<surfacegui
	Key="UpgradeActionsGui"
	ClipsDescendants={true}
	LightInfluence={1}
	MaxDistance={1000}
	SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<imagelabel
		BackgroundTransparency={1}
		Image="rbxassetid://4743601341"
		ImageContent={Content}
		Size={new UDim2(0.25, 0, 0.25, 0)}
		SizeConstraint={Enum.SizeConstraint.RelativeXX}
	/>
	<textlabel
		Key="TitleLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Position={new UDim2(0.25, 0, 0, 0)}
		Size={new UDim2(0.75, 0, 0.125, 0)}
		Text="More Funds"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
	>
		<uistroke />
	</textlabel>
	<textlabel
		Key="DescriptionLabel"
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		Position={new UDim2(0.25, 0, 0.125, 0)}
		Size={new UDim2(0.75, 0, 0, 0)}
		Text="Increases value of droplets by 1.1x compounding."
		TextColor3={Color3.fromRGB(172, 172, 172)}
		TextSize={30}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
	>
		<uistroke />
		<uipadding PaddingLeft={new UDim(0, 25)} PaddingRight={new UDim(0, 25)} />
	</textlabel>
	<frame
		Key="PurchaseOptions"
		Active={true}
		BackgroundTransparency={1}
		Position={new UDim2(0, 0, 0.47500000000000003, 0)}
		Size={new UDim2(1, 0, 0.5, 0)}
	>
		<uilistlayout Padding={new UDim(0, 15)} SortOrder={Enum.SortOrder.LayoutOrder} />
	</frame>
	<uipadding
		PaddingBottom={new UDim(0, 25)}
		PaddingLeft={new UDim(0, 25)}
		PaddingRight={new UDim(0, 25)}
		PaddingTop={new UDim(0, 25)}
	/>
	<textlabel
		Key="AmountLabel"
		AnchorPoint={new Vector2(0, 0.5)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Position={new UDim2(0, 0, 0.35000000000000003, 0)}
		Size={new UDim2(0.25, 0, 0.125, 0)}
		Text="2"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
		ZIndex={2}
	>
		<uistroke Thickness={2} />
	</textlabel>
</surfacegui>