import Roact from "@rbxts/roact";

<textbutton
	Key="DialogueWindow"
	AnchorPoint={new Vector2(0.5, 1)}
	AutoButtonColor={false}
	BackgroundColor3={Color3.fromRGB(165, 165, 165)}
	BorderSizePixel={0}
	Font={Enum.Font.SourceSans}
	FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
	Position={new UDim2(0.5, 0, 0.975, -30)}
	Size={new UDim2(0.25, 250, 0.15, 100)}
	Text={""}
	TextColor3={Color3.fromRGB(0, 0, 0)}
	TextSize={14}
	Visible={false}
>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(189, 189, 189)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
		Rotation={272}
	/>
	<uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
	<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(165, 165, 165)} Thickness={2}>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)), new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63))])}
			Rotation={90}
		/>
	</uistroke>
	<textlabel
		Key="NameLabel"
		Active={true}
		AnchorPoint={new Vector2(0, 0.5)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Position={new UDim2(0, 10, 0, 0)}
		Size={new UDim2(0.5, 0, 0, 40)}
		Text="Apple"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={34}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
	>
		<uistroke Color={Color3.fromRGB(50, 50, 50)} Thickness={2}>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)), new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63))])}
				Rotation={90}
			/>
		</uistroke>
	</textlabel>
	<textlabel
		Active={true}
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.5, 0, 0, 25)}
		Size={new UDim2(1, -30, 1, -75)}
		Text="How's your day?"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={25}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
		TextYAlignment={Enum.TextYAlignment.Top}
	>
		<uistroke Color={Color3.fromRGB(50, 50, 50)} Thickness={2}>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)), new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63))])}
				Rotation={90}
			/>
		</uistroke>
		<uitextsizeconstraint MaxTextSize={25} />
	</textlabel>
	<textlabel
		Key="HintLabel"
		Active={true}
		AnchorPoint={new Vector2(0.5, 1)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.5, 0, 1, -20)}
		Size={new UDim2(1, -30, 0, 20)}
		Text="Click to continue"
		TextColor3={Color3.fromRGB(198, 198, 198)}
		TextScaled={true}
		TextSize={25}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Right}
		TextYAlignment={Enum.TextYAlignment.Top}
	>
		<uistroke Color={Color3.fromRGB(50, 50, 50)} Thickness={2}>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)), new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63))])}
				Rotation={90}
			/>
		</uistroke>
	</textlabel>
	<viewportframe
		AnchorPoint={new Vector2(1, 0.5)}
		BackgroundTransparency={1}
		Position={new UDim2(1, 0, 0, 0)}
		Size={new UDim2(0, 45, 0, 45)}
	/>
</textbutton>