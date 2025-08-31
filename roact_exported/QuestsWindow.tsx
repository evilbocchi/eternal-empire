<frame Key="Quests" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
	<scrollingframe
		Key="QuestList"
		AnchorPoint={new Vector2(0.5, 0)}
		AutomaticCanvasSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		CanvasSize={new UDim2(0, 0, 0, 0)}
		Position={new UDim2(0.5, 0, 0, 0)}
		ScrollBarThickness={6}
		Selectable={false}
		Size={new UDim2(1, 0, 1, -50)}
	>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 20)}
			SortOrder={Enum.SortOrder.LayoutOrder}
		/>
		<uipadding
			PaddingBottom={new UDim(0, 5)}
			PaddingLeft={new UDim(0, 10)}
			PaddingRight={new UDim(0, 10)}
			PaddingTop={new UDim(0, 8)}
		/>
	</scrollingframe>
	<uilistlayout
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 15)}
		SortOrder={Enum.SortOrder.LayoutOrder}
	/>
	<frame Key="Level" BackgroundTransparency={1} LayoutOrder={-1} Size={new UDim2(1, 0, 0, 32)}>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 15)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<frame
			Key="ProgressBar"
			BackgroundColor3={Color3.fromRGB(39, 39, 39)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={5}
			LayoutOrder={2}
			Size={new UDim2(0.5, 0, 1, 1)}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(107, 107, 107))])}
				Rotation={90}
			/>
			<frame
				Key="Fill"
				BackgroundColor3={Color3.fromRGB(255, 170, 255)}
				BorderSizePixel={0}
				Size={new UDim2(0.5, 0, 1, 0)}
			>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(255, 255, 255)}
					Thickness={3}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 211, 248)), new ColorSequenceKeypoint(1, Color3.fromRGB(189, 58, 255))])}
						Rotation={90}
					/>
				</uistroke>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(189, 58, 255))])}
					Rotation={90}
				/>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
			</frame>
			<textlabel
				Key="BarLabel"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Size={new UDim2(0.8, 0, 0.8, 0)}
				Text="0/150 XP to Lv. 2"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uistroke
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Color={Color3.fromRGB(48, 48, 48)}
				Thickness={3}
			/>
		</frame>
		<frame
			Key="Current"
			Active={true}
			BackgroundColor3={Color3.fromRGB(255, 223, 62)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={5}
			Selectable={true}
			Size={new UDim2(0.3, 0, 1, 1)}
		>
			<uistroke
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Color={Color3.fromRGB(255, 255, 255)}
				Thickness={3}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 223, 62)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 137, 3))])}
					Rotation={90}
				/>
			</uistroke>
			<textlabel
				Key="LevelLabel"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Size={new UDim2(0.8, 0, 0.8250000000000001, 0)}
				Text="Lv. 1"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 223, 41)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 131, 7))])}
				Rotation={90}
			/>
		</frame>
	</frame>
</frame>