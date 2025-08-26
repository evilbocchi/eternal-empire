import Roact from "@rbxts/roact";

<imagelabel
	Key="ItemReceive"
	AnchorPoint={new Vector2(0.5, 0)}
	BackgroundColor3={Color3.fromRGB(81, 81, 81)}
	BackgroundTransparency={0.5}
	BorderColor3={Color3.fromRGB(0, 0, 0)}
	BorderSizePixel={3}
	Image="rbxassetid://9734894135"
	ImageColor3={Color3.fromRGB(126, 126, 126)}
	ImageContent={Content}
	ImageTransparency={0.6}
	LayoutOrder={-2}
	Position={new UDim2(0.5, 0, 0, 20)}
	ScaleType={Enum.ScaleType.Tile}
	Size={new UDim2(0, 250, 0, 70)}
	TileSize={new UDim2(0, 100, 0, 100)}
	Visible={false}
	ZIndex={-3}
>
	<uistroke
		ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
		Color={Color3.fromRGB(255, 255, 255)}
		Thickness={2}
		Transparency={0.5}
	>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(236, 236, 236)), new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)), new ColorSequenceKeypoint(0.8220000000000001, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(220, 220, 220))])}
			Rotation={35}
		/>
	</uistroke>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(39, 39, 39)), new ColorSequenceKeypoint(1, Color3.fromRGB(58, 58, 58))])}
		Rotation={270}
	/>
	<uipadding
		PaddingBottom={new UDim(0, 10)}
		PaddingLeft={new UDim(0, 15)}
		PaddingRight={new UDim(0, 15)}
		PaddingTop={new UDim(0, 10)}
	/>
	<viewportframe
		AnchorPoint={new Vector2(0, 0.5)}
		BackgroundTransparency={1}
		Position={new UDim2(0, 0, 0.5, 0)}
		Size={new UDim2(1, 0, 1, 0)}
		ZIndex={0}
	>
		<uiaspectratioconstraint />
		<uiflexitem />
	</viewportframe>
	<frame BackgroundTransparency={1} LayoutOrder={1} Size={new UDim2(1, 0, 1, 0)}>
		<textlabel
			Key="TitleLabel"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
			Position={new UDim2(0, 110, 0, 15)}
			Size={new UDim2(1, 0, 0.6, 0)}
			Text="The First Dropper"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={26}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
			<uisizeconstraint MaxSize={new Vector2(400, inf)} />
		</textlabel>
		<frame
			Key="Difficulty"
			AnchorPoint={new Vector2(0, 1)}
			BackgroundTransparency={1}
			LayoutOrder={1}
			Position={new UDim2(0, 110, 1, -15)}
			Size={new UDim2(1, 0, 0.4, 0)}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalFlex={Enum.UIFlexAlignment.Fill}
				Padding={new UDim(0, 10)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<imagelabel
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://14197014108"
				ImageContent={Content}
				LayoutOrder={-1}
				Position={new UDim2(1, -4, 0.5, 0)}
				Size={new UDim2(1, 0, 1, 0)}
			>
				<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
				<uiaspectratioconstraint />
				<uiflexitem />
			</imagelabel>
			<textlabel
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Position={new UDim2(0, 110, 0, 40)}
				Size={new UDim2(1, 0, 1, 0)}
				Text="The First Difficulty"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={20}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.47800000000000004, Color3.fromRGB(225, 225, 225)), new ColorSequenceKeypoint(1, Color3.fromRGB(148, 148, 148))])}
					Rotation={90}
				/>
			</textlabel>
		</frame>
		<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
	</frame>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		HorizontalFlex={Enum.UIFlexAlignment.Fill}
		SortOrder={Enum.SortOrder.LayoutOrder}
	/>
</imagelabel>