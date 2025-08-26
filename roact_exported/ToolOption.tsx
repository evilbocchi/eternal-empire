import Roact from "@rbxts/roact";

<textbutton
	Key="ToolOption"
	BackgroundColor3={Color3.fromRGB(255, 255, 255)}
	BorderColor3={Color3.fromRGB(0, 0, 0)}
	BorderSizePixel={4}
	Font={Enum.Font.SourceSans}
	FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
	Size={new UDim2(1, 0, 1, 0)}
	SizeConstraint={Enum.SizeConstraint.RelativeYY}
	Text={""}
	TextColor3={Color3.fromRGB(0, 0, 0)}
	TextSize={14}
>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(143, 143, 143)), new ColorSequenceKeypoint(1, Color3.fromRGB(198, 198, 198))])}
		Rotation={272}
	/>
	<textlabel
		Key="AmountLabel"
		Active={true}
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		Position={new UDim2(0, 10, 0, 0)}
		Size={new UDim2(1, 0, 0.4, 0)}
		Text="1"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
	>
		<uistroke Thickness={2}>
			<uistroke Thickness={2} />
		</uistroke>
	</textlabel>
	<viewportframe
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundTransparency={1}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		Size={new UDim2(0.8, 0, 0.8, 0)}
	/>
	<imagelabel
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundTransparency={1}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		Size={new UDim2(0.75, 0, 0.75, 0)}
		ZIndex={0}
	/>
	<imagelabel
		Key="Pattern"
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundTransparency={1}
		Image="rbxassetid://15562720000"
		ImageColor3={Color3.fromRGB(0, 0, 0)}
		ImageContent={Content}
		ImageTransparency={0.9500000000000001}
		Position={new UDim2(0.5, 0, 0, 0)}
		ScaleType={Enum.ScaleType.Tile}
		Size={new UDim2(1, 0, 1, 0)}
		TileSize={new UDim2(0, 25, 0, 25)}
		ZIndex={-4}
	/>
	<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} Thickness={2}>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.587, Color3.fromRGB(173, 173, 173)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
			Rotation={75}
		/>
	</uistroke>
</textbutton>