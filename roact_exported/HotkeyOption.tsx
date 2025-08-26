import Roact from "@rbxts/roact";

<frame
	Key="HotkeyOption"
	BackgroundTransparency={1}
	LayoutOrder={56}
	Position={new UDim2(0.8, 0, 0.15, 0)}
	Size={new UDim2(1, 0, 0.16, 0)}
>
	<textbutton
		Key="Bind"
		AnchorPoint={new Vector2(1, 0.5)}
		BackgroundColor3={Color3.fromRGB(85, 255, 127)}
		BorderColor3={Color3.fromRGB(27, 42, 53)}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.975, 0, 0.5, 0)}
		Size={new UDim2(0.2, 0, 1, 0)}
		Text={""}
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
		TextStrokeTransparency={0}
		TextWrapped={true}
		ZIndex={25}
	>
		<uicorner CornerRadius={new UDim(0.25, 0)} />
		<uistroke
			ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
			Color={Color3.fromRGB(170, 255, 127)}
			Thickness={2}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
			/>
		</uistroke>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
			Rotation={90}
		/>
		<uipadding
			PaddingBottom={new UDim(0, 5)}
			PaddingLeft={new UDim(0, 5)}
			PaddingRight={new UDim(0, 5)}
			PaddingTop={new UDim(0, 5)}
		/>
		<textlabel
			Key="KeybindLabel"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={-1}
			Size={new UDim2(1, 0, 1, 0)}
			Text="Deselect"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={30}
			TextStrokeTransparency={0}
			ZIndex={25}
		>
			<uistroke Color={Color3.fromRGB(85, 255, 127)}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
				/>
			</uistroke>
		</textlabel>
	</textbutton>
	<textlabel
		Key="TitleLabel"
		AnchorPoint={new Vector2(0, 0.5)}
		AutomaticSize={Enum.AutomaticSize.XY}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		LayoutOrder={-1}
		Position={new UDim2(0.025, 0, 0.5, 0)}
		Text="Deselect"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextSize={30}
		TextStrokeTransparency={0}
		ZIndex={25}
	/>
</frame>