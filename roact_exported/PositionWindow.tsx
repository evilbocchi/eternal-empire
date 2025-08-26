import Roact from "@rbxts/roact";

<frame
	Key="PositionWindow"
	AnchorPoint={new Vector2(1, 0)}
	BackgroundTransparency={1}
	Position={new UDim2(1, -20, 0, 10)}
	Size={new UDim2(0, 0, 0, 16)}
>
	<imagelabel
		AnchorPoint={new Vector2(0.5, 0.5)}
		BackgroundTransparency={1}
		Image="rbxassetid://132386902355520"
		ImageContent={Content}
		Position={new UDim2(1, 0, 0.5, 0)}
		Size={new UDim2(1.75, 0, 1.75, 0)}
		SizeConstraint={Enum.SizeConstraint.RelativeYY}
		ZIndex={2}
	/>
	<imagelabel
		Key="Frame"
		AnchorPoint={new Vector2(1, 0.5)}
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundColor3={Color3.fromRGB(255, 255, 255)}
		BorderColor3={Color3.fromRGB(0, 0, 0)}
		BorderSizePixel={2}
		Image="rbxassetid://9734894135"
		ImageContent={Content}
		ImageTransparency={0.6}
		Position={new UDim2(0, 0, 0.5, 0)}
		ScaleType={Enum.ScaleType.Tile}
		Size={new UDim2(0, 0, 0, 16)}
		TileSize={new UDim2(0, 32, 0, 32)}
	>
		<textlabel
			Key="PositionLabel"
			AnchorPoint={new Vector2(1, 0.5)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
			Size={new UDim2(0, 0, 1, 0)}
			Text="0, 0, 0"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={20}
			TextXAlignment={Enum.TextXAlignment.Right}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(85, 254, 171)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 164, 170))])}
			Rotation={90}
		/>
		<uistroke
			ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
			Color={Color3.fromRGB(255, 255, 255)}
			Transparency={0.2}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.587, Color3.fromRGB(173, 173, 173)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
				Rotation={80}
			/>
		</uistroke>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 20)} />
		<uisizeconstraint MinSize={new Vector2(70, 0)} />
	</imagelabel>
</frame>