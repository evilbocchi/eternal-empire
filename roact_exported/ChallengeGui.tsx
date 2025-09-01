import Roact from "@rbxts/roact";

<surfacegui
	ClipsDescendants={true}
	MaxDistance={30}
	SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<textlabel
		Key="Label"
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
		Size={new UDim2(0.9, 0, 0.15, 0)}
		Text="Challenges"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
	>
		<uistroke Thickness={3} />
	</textlabel>
	<uilistlayout
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<scrollingframe
		Key="ChallengeOptions"
		Active={true}
		AutomaticCanvasSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		CanvasSize={new UDim2(0, 0, 0, 0)}
		LayoutOrder={1}
		Selectable={false}
		Size={new UDim2(0.9, 0, 0.75, 0)}
		Visible={false}
	>
		<uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} SortOrder={Enum.SortOrder.LayoutOrder} />
	</scrollingframe>
	<frame
		Key="CurrentChallenge"
		BackgroundTransparency={1}
		Size={new UDim2(0.9, 0, 0.75, 0)}
		Visible={false}
	>
		<textlabel
			Key="Label"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			Size={new UDim2(0.9, 0, 0.15, 0)}
			Text="You are currently in:"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextWrapped={true}
		>
			<uistroke Thickness={3} />
		</textlabel>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<textlabel
			Key="TitleLabel"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={2}
			Position={new UDim2(0.025, 0, 0.05, 0)}
			Size={new UDim2(1, 0, 0.2, 0)}
			Text="Melting Economy I"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextWrapped={true}
		>
			<uistroke Thickness={4} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 151)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 170, 255))])}
			/>
		</textlabel>
		<textbutton
			Key="LeaveButton"
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderSizePixel={0}
			Font={Enum.Font.SourceSans}
			FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
			LayoutOrder={4}
			Position={new UDim2(0.55, 0, 0.5, 0)}
			Size={new UDim2(0.3, 0, 0.15, 0)}
			Text={""}
			TextColor3={Color3.fromRGB(0, 0, 0)}
			TextSize={14}
		>
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
			<uicorner CornerRadius={new UDim(0.2, 0)} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 96, 75)), new ColorSequenceKeypoint(1, Color3.fromRGB(180, 32, 32))])}
				Rotation={90}
			/>
			<textlabel
				Key="Label"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
				Size={new UDim2(1, 0, 1, 0)}
				Text="Quit"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={3}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14))])}
						Rotation={90}
					/>
				</uistroke>
			</textlabel>
			<uipadding
				PaddingBottom={new UDim(0, 7)}
				PaddingLeft={new UDim(0, 7)}
				PaddingRight={new UDim(0, 7)}
				PaddingTop={new UDim(0, 7)}
			/>
		</textbutton>
		<frame BackgroundTransparency={1} LayoutOrder={3} Size={new UDim2(0, 0, 0.1, 0)} />
		<textlabel
			Key="RequirementLabel"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={2}
			Size={new UDim2(0.9, 0, 0.1, 0)}
			Text="Requirement: Sets"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextWrapped={true}
		>
			<uistroke Thickness={3} />
		</textlabel>
	</frame>
</surfacegui>