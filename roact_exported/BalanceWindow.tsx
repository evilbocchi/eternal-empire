import Roact from "@rbxts/roact";

<frame
	Key="BalanceWindow"
	AnchorPoint={new Vector2(0.5, 0)}
	BackgroundTransparency={1}
	Position={new UDim2(0.5, 0, 0.03, 0)}
	Size={new UDim2(1, -350, 0.045, 38)}
>
	<scrollingframe
		Key="Balances"
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundTransparency={1}
		CanvasSize={new UDim2(0, 0, 1, 0)}
		Position={new UDim2(0.5, 0, 0, 5)}
		ScrollBarThickness={6}
		ScrollingDirection={Enum.ScrollingDirection.X}
		Selectable={false}
		Size={new UDim2(1, 0, 1, 0)}
	>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 10)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<frame
			Key="NavigationOptions"
			AnchorPoint={new Vector2(0, 1)}
			BackgroundColor3={Color3.fromRGB(165, 165, 165)}
			BorderColor3={Color3.fromRGB(50, 50, 50)}
			BorderSizePixel={3}
			LayoutOrder={9999999}
			Position={new UDim2(0, 0, 1, -5)}
			Size={new UDim2(0, 60, 1, 0)}
			Visible={false}
		>
			<uilistlayout
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 1)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<textlabel
				Key="PageLabel"
				Active={true}
				AnchorPoint={new Vector2(0.5, 1)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.5, 0, 1, -5)}
				Size={new UDim2(1, 0, 0.4, 0)}
				Text="Main"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} Transparency={0.2} />
			</textlabel>
			<frame
				Key="Left"
				Active={true}
				BackgroundTransparency={1}
				LayoutOrder={-5}
				Selectable={true}
				Size={new UDim2(0.5, 0, 0.3, 0)}
			>
				<imagebutton
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image="rbxassetid://5279719038"
					ImageContent={Content}
					Position={new UDim2(0.5, 0, 0.5, 0)}
					Rotation={180}
					ScaleType={Enum.ScaleType.Fit}
					Selectable={false}
					Size={new UDim2(1, 0, 1, 0)}
				/>
			</frame>
			<frame
				Key="Right"
				Active={true}
				BackgroundTransparency={1}
				LayoutOrder={5}
				Selectable={true}
				Size={new UDim2(0.5, 0, 0.3, 0)}
			>
				<imagebutton
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Image="rbxassetid://5279719038"
					ImageContent={Content}
					Position={new UDim2(0.5, 0, 0.5, 0)}
					ScaleType={Enum.ScaleType.Fit}
					Selectable={false}
					Size={new UDim2(1, 0, 1, 0)}
				/>
			</frame>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(189, 189, 189)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
				Rotation={272}
			/>
			<uipadding
				PaddingBottom={new UDim(0, 5)}
				PaddingLeft={new UDim(0, 10)}
				PaddingRight={new UDim(0, 10)}
				PaddingTop={new UDim(0, 5)}
			/>
			<uistroke Color={Color3.fromRGB(255, 255, 255)}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.73, Color3.fromRGB(124, 124, 124)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
					Rotation={60}
				/>
			</uistroke>
		</frame>
		<uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 3)} />
	</scrollingframe>
	<uicorner CornerRadius={new UDim(0, 4)} />
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
		Rotation={270}
	/>
	<uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} SortOrder={Enum.SortOrder.LayoutOrder} />
</frame>