import Roact from "@rbxts/roact";

<textbutton
	Key="ItemSlot"
	BackgroundColor3={Color3.fromRGB(52, 155, 255)}
	BorderColor3={Color3.fromRGB(0, 0, 0)}
	BorderSizePixel={5}
	Position={new UDim2(0.5, 0, 0.5, 0)}
	Selectable={false}
	Size={new UDim2(0, 100, 0, 100)}
	Text={""}
>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(72, 72, 72)), new ColorSequenceKeypoint(1, Color3.fromRGB(76, 76, 76))])}
		Rotation={90}
	/>
	<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(52, 155, 255)} Thickness={2}>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)), new ColorSequenceKeypoint(0.8220000000000001, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
			Rotation={35}
		/>
	</uistroke>
	<textlabel
		Key="AmountLabel"
		Active={true}
		AnchorPoint={new Vector2(0.5, 0.5)}
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		Position={new UDim2(0.5, 0, 0.9, 0)}
		Size={new UDim2(0.5, 0, 0.4, 0)}
		Text="1"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Right}
	>
		<uistroke Thickness={2}>
			<uistroke Thickness={2} />
		</uistroke>
	</textlabel>
	<imagelabel
		Key="Reflection"
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundTransparency={1}
		Image="rbxassetid://9734894135"
		ImageColor3={Color3.fromRGB(126, 126, 126)}
		ImageContent={Content}
		ImageTransparency={0.85}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		ScaleType={Enum.ScaleType.Tile}
		Size={new UDim2(1, 0, 1, 0)}
		TileSize={new UDim2(0.5, 0, 0.5, 0)}
		ZIndex={-5}
	>
		<uicorner CornerRadius={new UDim(0, 4)} />
	</imagelabel>
	<viewportframe
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundTransparency={1}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		Size={new UDim2(0.8, 0, 0.8, 0)}
		ZIndex={0}
	/>
	<imagelabel
		BackgroundTransparency={1}
		Image="rbxassetid://4576475446"
		ImageContent={Content}
		ImageTransparency={0.2}
		Size={new UDim2(1, 0, 1, 0)}
		ZIndex={-4}
	/>
</textbutton>
<textbutton
	Key="ItemSlot"
	BackgroundColor3={Color3.fromRGB(52, 155, 255)}
	BorderColor3={Color3.fromRGB(0, 0, 0)}
	BorderSizePixel={5}
	Position={new UDim2(0.5, 0, 0.5, 0)}
	Selectable={false}
	Size={new UDim2(0, 100, 0, 100)}
	Text={""}
>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(72, 72, 72)), new ColorSequenceKeypoint(1, Color3.fromRGB(76, 76, 76))])}
		Rotation={90}
	/>
	<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(52, 155, 255)} Thickness={2}>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)), new ColorSequenceKeypoint(0.8220000000000001, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
			Rotation={35}
		/>
	</uistroke>
	<textlabel
		Key="AmountLabel"
		Active={true}
		AnchorPoint={new Vector2(0.5, 0.5)}
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		Position={new UDim2(0.5, 0, 0.9, 0)}
		Size={new UDim2(1, 0, 0.4, 0)}
		Text="1"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
	>
		<uistroke Thickness={2}>
			<uistroke Thickness={2} />
		</uistroke>
	</textlabel>
	<imagelabel
		Key="Reflection"
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundTransparency={1}
		Image="rbxassetid://9734894135"
		ImageColor3={Color3.fromRGB(126, 126, 126)}
		ImageContent={Content}
		ImageTransparency={0.85}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		ScaleType={Enum.ScaleType.Tile}
		Size={new UDim2(1, 0, 1, 0)}
		TileSize={new UDim2(0.5, 0, 0.5, 0)}
		ZIndex={-5}
	>
		<uicorner CornerRadius={new UDim(0, 4)} />
	</imagelabel>
	<viewportframe
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundTransparency={1}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		Size={new UDim2(0.8, 0, 0.8, 0)}
		ZIndex={0}
	/>
	<imagelabel
		BackgroundTransparency={1}
		Image="rbxassetid://4576475446"
		ImageContent={Content}
		ImageTransparency={0.2}
		ScaleType={Enum.ScaleType.Fit}
		Size={new UDim2(1, 0, 1, 0)}
		ZIndex={-4}
	/>
</textbutton>