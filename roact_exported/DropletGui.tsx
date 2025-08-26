import Roact from "@rbxts/roact";

<billboardgui
	Key="DropletGui"
	Active={true}
	AlwaysOnTop={true}
	Enabled={false}
	Size={new UDim2(10, 0, 8, 0)}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<canvasgroup
		Key="Frame"
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		Size={new UDim2(1, 0, 1, 0)}
	>
		<textlabel
			Key="ValueLabel"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			RichText={true}
			Size={new UDim2(1, 0, 0.125, 0)}
			Text="$1 Funds"
			TextColor3={Color3.fromRGB(0, 170, 0)}
			TextScaled={true}
			TextSize={20}
			TextWrapped={true}
		>
			<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(62, 62, 62)), new ColorSequenceKeypoint(0.548, Color3.fromRGB(0, 0, 0)), new ColorSequenceKeypoint(1, Color3.fromRGB(62, 62, 62))])}
					Rotation={90}
				/>
			</uistroke>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.588, Color3.fromRGB(217, 217, 217)), new ColorSequenceKeypoint(1, Color3.fromRGB(166, 166, 166))])}
				Rotation={90}
			/>
		</textlabel>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
	</canvasgroup>
</billboardgui>