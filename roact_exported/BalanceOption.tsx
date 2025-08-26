import Roact from "@rbxts/roact";

<frame
	Key="BalanceOption"
	AutomaticSize={Enum.AutomaticSize.X}
	BackgroundColor3={Color3.fromRGB(0, 200, 0)}
	BorderColor3={Color3.fromRGB(50, 50, 50)}
	BorderSizePixel={3}
	LayoutOrder={1}
	Size={new UDim2(0, 0, 1, 0)}
>
	<imagelabel
		AnchorPoint={new Vector2(0, 0.5)}
		BackgroundTransparency={1}
		Image="rbxassetid://17574921441"
		ImageContent={Content}
		LayoutOrder={-2}
		Position={new UDim2(0, 0, 0.5, 0)}
		ScaleType={Enum.ScaleType.Fit}
		Size={new UDim2(0.85, 0, 0.85, 0)}
		SizeConstraint={Enum.SizeConstraint.RelativeYY}
		ZIndex={0}
	/>
	<frame
		Key="Amount"
		AnchorPoint={new Vector2(0, 0.5)}
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Position={new UDim2(0.2, 0, 0.5, 0)}
		Size={new UDim2(0, 0, 1, -6)}
	>
		<textlabel
			Key="BalanceLabel"
			Active={true}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			Size={new UDim2(0, 0, 0.6, 0)}
			Text="$100.32M"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={31}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)), new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63))])}
					Rotation={90}
				/>
			</uistroke>
		</textlabel>
		<frame
			Key="Income"
			Active={true}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			LayoutOrder={2}
			Position={new UDim2(0, 62, 0.625, 0)}
			Size={new UDim2(0, 0, 0.3, 0)}
		>
			<textlabel
				Key="IncomeLabel"
				Active={true}
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
				LayoutOrder={2}
				Position={new UDim2(0, 0, 0.625, 0)}
				Size={new UDim2(0, 0, 1, 0)}
				Text="0.00/s"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={16}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)), new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63))])}
						Rotation={90}
					/>
				</uistroke>
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, 4)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<textlabel
				Key="SoftcapLabel"
				Active={true}
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
				LayoutOrder={2}
				Position={new UDim2(0, 0, 0.625, 0)}
				Size={new UDim2(0, 0, 1, 0)}
				Text="/0"
				TextColor3={Color3.fromRGB(255, 0, 0)}
				TextScaled={true}
				TextSize={16}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke
					Color={Color3.fromRGB(54, 0, 0)}
					Thickness={2}
					Transparency={0.2}
				/>
			</textlabel>
		</frame>
		<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} VerticalAlignment={Enum.VerticalAlignment.Center} />
	</frame>
	<uistroke Color={Color3.fromRGB(0, 255, 0)}>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.73, Color3.fromRGB(124, 124, 124)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
			Rotation={60}
		/>
	</uistroke>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(125, 125, 125)), new ColorSequenceKeypoint(1, Color3.fromRGB(217, 217, 217))])}
		Rotation={272}
	/>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		Padding={new UDim(0, 10)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
</frame>