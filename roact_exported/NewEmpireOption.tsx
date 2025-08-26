import Roact from "@rbxts/roact";

<textbutton
	Key="NewEmpireOption"
	BackgroundColor3={Color3.fromRGB(0, 170, 0)}
	BackgroundTransparency={0.5}
	BorderSizePixel={0}
	LayoutOrder={25252}
	Selectable={false}
	Size={new UDim2(0.4, 0, 0, 40)}
	Text={""}
>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(156, 156, 156))])}
		Rotation={90}
	/>
	<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(0, 170, 0)} />
	<uicorner CornerRadius={new UDim(0, 4)} />
	<uipadding PaddingLeft={new UDim(0, 5)} PaddingRight={new UDim(0, 5)} />
	<textlabel
		Key="MessageLabel"
		Active={true}
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Position={new UDim2(0.5, 0, 0, 0)}
		Size={new UDim2(0.8, 0, 0.6, 0)}
		Text="Create New Empire"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
	>
		<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
				Rotation={90}
			/>
		</uistroke>
	</textlabel>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		Padding={new UDim(0.05, 0)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<imagelabel
		Key="OwnerAvatar"
		BackgroundTransparency={1}
		Image="rbxassetid://5188680291"
		ImageContent={Content}
		LayoutOrder={-1}
		Size={new UDim2(1, -10, 1, -10)}
		SizeConstraint={Enum.SizeConstraint.RelativeYY}
	/>
</textbutton>