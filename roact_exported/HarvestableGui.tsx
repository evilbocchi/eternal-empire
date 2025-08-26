import Roact from "@rbxts/roact";

<billboardgui
	Key="HarvestableGui"
	Active={true}
	AlwaysOnTop={true}
	Enabled={false}
	MaxDistance={25}
	Size={new UDim2(4, 0, 2, 0)}
	StudsOffset={new Vector3(0, 2.5, 0)}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<textlabel
		Key="NameLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
		Size={new UDim2(1, 0, 0.5, 0)}
		Text="Grass"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
	>
		<uistroke Thickness={4} />
	</textlabel>
	<frame
		Key="HealthBar"
		BackgroundColor3={Color3.fromRGB(39, 39, 39)}
		BorderSizePixel={0}
		Size={new UDim2(1, 0, 0.35000000000000003, 0)}
	>
		<uistroke Thickness={4}>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(0, 0, 0)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0))])}
			/>
		</uistroke>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(107, 107, 107))])}
			Rotation={90}
		/>
		<frame
			Key="Fill"
			BackgroundColor3={Color3.fromRGB(85, 255, 127)}
			BorderSizePixel={0}
			Size={new UDim2(0.5, 0, 1, 0)}
		>
			<uistroke Thickness={4}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(0, 0, 0)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0))])}
				/>
			</uistroke>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 189, 95))])}
				Rotation={90}
			/>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<frame
				BackgroundColor3={Color3.fromRGB(0, 0, 0)}
				BackgroundTransparency={0.85}
				BorderSizePixel={0}
				Size={new UDim2(1, 0, 0.8, 0)}
			/>
		</frame>
		<textlabel
			Key="BarLabel"
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(0.5, 0, 0.8, 0)}
			Text="2/4"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
		>
			<uistroke Thickness={4} />
		</textlabel>
	</frame>
	<uilistlayout Padding={new UDim(0.05, 0)} SortOrder={Enum.SortOrder.LayoutOrder} />
</billboardgui>