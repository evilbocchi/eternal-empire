<surfacegui
	ClipsDescendants={true}
	LightInfluence={1}
	MaxDistance={150}
	SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<textlabel
		Key="Header"
		BackgroundTransparency={1}
		Font={Enum.Font.SourceSansBold}
		FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Bold, Style = Normal }}
		Position={new UDim2(0, 0, 0.02, 0)}
		Size={new UDim2(1, 0, 0.1, 0)}
		Text="Richest Empires"
		TextColor3={Color3.fromRGB(170, 255, 144)}
		TextScaled={true}
		TextSize={36}
		TextWrapped={true}
	>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 68, 34))])}
			Rotation={89}
		/>
	</textlabel>
	<scrollingframe
		Key="Display"
		AutomaticCanvasSize={Enum.AutomaticSize.Y}
		BackgroundColor3={Color3.fromRGB(209, 209, 209)}
		BorderSizePixel={0}
		CanvasSize={new UDim2(0, 0, 0, 0)}
		Position={new UDim2(0.1, 0, 0.12, 0)}
		Selectable={false}
		Size={new UDim2(0.8, 0, 0.8, 0)}
	>
		<uilistlayout Padding={new UDim(0, 5)} SortOrder={Enum.SortOrder.LayoutOrder}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 5)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
		</uilistlayout>
		<uipadding
			PaddingBottom={new UDim(0, 15)}
			PaddingLeft={new UDim(0, 15)}
			PaddingRight={new UDim(0, 15)}
			PaddingTop={new UDim(0, 15)}
		/>
		<frame
			Key="Display"
			BackgroundTransparency={1}
			LayoutOrder={-1}
			Size={new UDim2(1, 0, 0, 40)}
		>
			<textlabel
				Key="PlaceLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.SourceSansBold}
				FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Bold, Style = Normal }}
				Size={new UDim2(0.125, 0, 1, 0)}
				Text="#"
				TextColor3={Color3.fromRGB(0, 0, 0)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
				TextStrokeTransparency={0.9}
				TextWrapped={true}
			/>
			<textlabel
				Key="ServerLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.SourceSans}
				FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
				Position={new UDim2(0.15, 0, 0, 0)}
				Size={new UDim2(0.6, 0, 1, 0)}
				Text="Name"
				TextColor3={Color3.fromRGB(0, 0, 0)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
				TextStrokeTransparency={0.9}
				TextWrapped={true}
			/>
			<textlabel
				Key="AmountLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.SourceSans}
				FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
				Position={new UDim2(0.85, 0, 0, 0)}
				Size={new UDim2(0.2, 0, 1, 0)}
				Text="Funds"
				TextColor3={Color3.fromRGB(0, 0, 0)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
				TextStrokeTransparency={0.9}
				TextWrapped={true}
			/>
			<uicorner CornerRadius={new UDim(0, 9)} />
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 5)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<uipadding PaddingLeft={new UDim(0, 6)} PaddingRight={new UDim(0, 6)} />
		</frame>
	</scrollingframe>
</surfacegui>