import Roact from "@rbxts/roact";

<frame
	Key="BuildWindow"
	Active={true}
	AnchorPoint={new Vector2(0.5, 1)}
	BackgroundTransparency={1}
	Position={new UDim2(0.5, 0, 0.9500000000000001, -5)}
	Size={new UDim2(0.3, 0, 0, 75)}
	Visible={false}
>
	<textbutton
		Key="Deselect"
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundColor3={Color3.fromRGB(102, 102, 102)}
		BorderColor3={Color3.fromRGB(27, 42, 53)}
		ClipsDescendants={true}
		LayoutOrder={2}
		Position={new UDim2(0.5, 0, 0.05, 0)}
		Selectable={false}
		Size={new UDim2(0.7000000000000001, 0, 0.4, -2)}
		Text={""}
		Visible={false}
	>
		<uicorner CornerRadius={new UDim(0, 4)} />
		<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(77, 77, 77)} />
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
			Rotation={270}
		/>
		<textlabel
			Key="PositionLabel"
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			Size={new UDim2(1, 0, 1, 0)}
			Text="Deselect"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<uipadding
			PaddingBottom={new UDim(0, 5)}
			PaddingLeft={new UDim(0, 5)}
			PaddingRight={new UDim(0, 5)}
			PaddingTop={new UDim(0, 5)}
		/>
		<uiscale />
	</textbutton>
	<frame
		Key="Options"
		AnchorPoint={new Vector2(0, 1)}
		BackgroundTransparency={1}
		Position={new UDim2(0, 0, 1, 0)}
		Size={new UDim2(1, 0, 0.5, -2)}
	>
		<textbutton
			Key="Rotate"
			AnchorPoint={new Vector2(0, 1)}
			BackgroundColor3={Color3.fromRGB(102, 102, 102)}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			ClipsDescendants={true}
			LayoutOrder={4}
			Position={new UDim2(0, 0, 1, 0)}
			Selectable={false}
			Size={new UDim2(0.5, 0, 1, 0)}
			Text={""}
			Visible={false}
		>
			<uicorner CornerRadius={new UDim(0, 4)} />
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(77, 77, 77)} />
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://6710235432"
				ImageContent={Content}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255))])}
					Rotation={90}
				/>
			</imagelabel>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
				Rotation={270}
			/>
			<textlabel
				Key="PositionLabel"
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Size={new UDim2(0, 0, 0.55, 0)}
				Text="Rotate"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
				<uipadding PaddingLeft={new UDim(0, 10)} />
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<uiscale />
		</textbutton>
		<textbutton
			Key="Delete"
			AnchorPoint={new Vector2(1, 1)}
			BackgroundColor3={Color3.fromRGB(102, 102, 102)}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			ClipsDescendants={true}
			LayoutOrder={6}
			Position={new UDim2(1, 0, 1, 0)}
			Selectable={false}
			Size={new UDim2(0.5, 0, 1, 0)}
			Text={""}
			Visible={false}
		>
			<uicorner CornerRadius={new UDim(0, 4)} />
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(77, 77, 77)} />
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://16353080084"
				ImageColor3={Color3.fromRGB(255, 70, 70)}
				ImageContent={Content}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255))])}
					Rotation={90}
				/>
			</imagelabel>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
				Rotation={270}
			/>
			<textlabel
				Key="PositionLabel"
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Size={new UDim2(0, 0, 0.55, 0)}
				Text="Delete"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
				<uipadding PaddingLeft={new UDim(0, 10)} />
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<uiscale />
		</textbutton>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 5)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<textbutton
			Key="Place"
			AnchorPoint={new Vector2(0, 1)}
			BackgroundColor3={Color3.fromRGB(102, 102, 102)}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			ClipsDescendants={true}
			LayoutOrder={5}
			Position={new UDim2(0, 0, 1, 0)}
			Selectable={false}
			Size={new UDim2(0.5, 0, 1, 0)}
			Text={""}
			Visible={false}
		>
			<uicorner CornerRadius={new UDim(0, 4)} />
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(77, 77, 77)} />
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://5715427603"
				ImageColor3={Color3.fromRGB(170, 255, 127)}
				ImageContent={Content}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255))])}
					Rotation={90}
				/>
			</imagelabel>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
				Rotation={270}
			/>
			<textlabel
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Size={new UDim2(0, 0, 0.55, 0)}
				Text="Place"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
				<uipadding PaddingLeft={new UDim(0, 10)} />
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<uiscale />
		</textbutton>
	</frame>
</frame>