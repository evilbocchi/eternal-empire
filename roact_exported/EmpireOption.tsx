import Roact from "@rbxts/roact";

<textbutton
	Key="EmpireOption"
	BackgroundColor3={Color3.fromRGB(0, 170, 0)}
	BackgroundTransparency={0.5}
	BorderSizePixel={0}
	Selectable={false}
	Size={new UDim2(1, 0, 0, 85)}
	Text={""}
>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(156, 156, 156))])}
		Rotation={90}
	/>
	<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(0, 170, 0)} />
	<uicorner CornerRadius={new UDim(0, 4)} />
	<uipadding PaddingLeft={new UDim(0, 5)} PaddingRight={new UDim(0, 5)} />
	<frame Key="EmpireInformation" BackgroundTransparency={1} Size={new UDim2(0.65, 0, 1, 0)}>
		<frame Key="Labels" BackgroundTransparency={1} Size={new UDim2(0.65, 0, 1, -10)}>
			<textlabel
				Key="OwnerLabel"
				Active={true}
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				LayoutOrder={1}
				Position={new UDim2(0.5, 0, 0, 0)}
				Size={new UDim2(1, 0, 0.3, 0)}
				Text="please wait"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
						Rotation={90}
					/>
				</uistroke>
			</textlabel>
			<textlabel
				Key="TitleLabel"
				Active={true}
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.5, 0, 0.25, 0)}
				Size={new UDim2(1, 0, 0.4, 0)}
				Text="loading"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
						Rotation={90}
					/>
				</uistroke>
			</textlabel>
			<uilistlayout
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
		</frame>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			Padding={new UDim(0.05, 0)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<imagelabel
			Key="OwnerAvatar"
			BackgroundTransparency={1}
			LayoutOrder={-1}
			Size={new UDim2(1, -10, 1, -10)}
			SizeConstraint={Enum.SizeConstraint.RelativeYY}
		/>
	</frame>
	<frame
		Key="Stats"
		AnchorPoint={new Vector2(1, 0.5)}
		BackgroundTransparency={1}
		LayoutOrder={1}
		Position={new UDim2(1, 0, 0.5, 0)}
		Size={new UDim2(0.25, 0, 1, -10)}
	>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0.05, 0)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<textlabel
			Key="ItemsLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
			Position={new UDim2(0.5, 0, 0.25, 0)}
			Size={new UDim2(1, 0, 0.25, 0)}
			Text="Items: 0"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
		>
			<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
					Rotation={90}
				/>
			</uistroke>
		</textlabel>
		<textlabel
			Key="PlaytimeLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0.25, 0)}
			Size={new UDim2(1, 0, 0.25, 0)}
			Text="Playtime:"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
		>
			<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
					Rotation={90}
				/>
			</uistroke>
		</textlabel>
		<textlabel
			Key="DateCreatedLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
			LayoutOrder={2}
			Position={new UDim2(0.5, 0, 0.25, 0)}
			Size={new UDim2(1, 0, 0.25, 0)}
			Text="Created:"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
		>
			<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
					Rotation={90}
				/>
			</uistroke>
		</textlabel>
	</frame>
	<textlabel
		Key="EmpireIDLabel"
		Active={true}
		AnchorPoint={new Vector2(0.5, 1)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.5, 0, 0.9500000000000001, 0)}
		Size={new UDim2(1, 0, 0.01, 15)}
		Text="ID: 0"
		TextColor3={Color3.fromRGB(156, 156, 156)}
		TextScaled={true}
		TextSize={14}
		TextTransparency={0.9}
		TextWrapped={true}
	/>
</textbutton>