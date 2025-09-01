import Roact from "@rbxts/roact";

<frame Key="Rename" BackgroundTransparency={1} Selectable={true} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
	<uilistlayout
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 15)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
		VerticalFlex={Enum.UIFlexAlignment.Fill}
	/>
	<textlabel
		Key="Label"
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		LayoutOrder={-1}
		Position={new UDim2(0.025, 0, 0.5, 0)}
		RichText={true}
		Size={new UDim2(0.8, 0, 0, 30)}
		Text="Rename your empire! <font size="20">(5-16 characters)</font>"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextSize={30}
		TextStrokeTransparency={0}
		ZIndex={25}
	>
		<uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={1.3}>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
				Rotation={90}
			/>
		</uistroke>
		<uiflexitem />
	</textlabel>
	<frame
		Key="PurchaseOptions"
		BackgroundTransparency={1}
		LayoutOrder={5}
		Size={new UDim2(0.7000000000000001, 0, 0, 35)}
	>
		<textbutton
			Key="Robux"
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderSizePixel={0}
			Font={Enum.Font.SourceSans}
			FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
			LayoutOrder={1}
			Size={new UDim2(0.4, 0, 1, 0)}
			Text={""}
			TextColor3={Color3.fromRGB(0, 0, 0)}
			TextSize={14}
		>
			<uicorner CornerRadius={new UDim(0, 10)} />
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
			<textlabel
				Key="LevelLabel"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Size={new UDim2(0.8, 0, 0.8, 0)}
				Text="25 Robux"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 127)), new ColorSequenceKeypoint(1, Color3.fromRGB(85, 170, 0))])}
				Rotation={90}
			/>
		</textbutton>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 15)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<textbutton
			Key="Funds"
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderSizePixel={0}
			Font={Enum.Font.SourceSans}
			FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
			LayoutOrder={3}
			Size={new UDim2(0.4, 0, 1, 0)}
			Text={""}
			TextColor3={Color3.fromRGB(0, 0, 0)}
			TextSize={14}
		>
			<uicorner CornerRadius={new UDim(0, 10)} />
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
			<textlabel
				Key="AmountLabel"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Size={new UDim2(0.8, 0, 0.8, 0)}
				Text="$1De"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(221, 221, 221)), new ColorSequenceKeypoint(1, Color3.fromRGB(153, 153, 153))])}
				Rotation={90}
			/>
		</textbutton>
		<uiflexitem />
		<textlabel
			Key="Label"
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={2}
			Position={new UDim2(0.025, 0, 0.5, 0)}
			RichText={true}
			Size={new UDim2(0, 0, 0, 30)}
			Text="or"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={30}
			TextStrokeTransparency={0}
			TextWrapped={true}
			TextYAlignment={Enum.TextYAlignment.Bottom}
			ZIndex={25}
		>
			<uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={1.3}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
					Rotation={90}
				/>
			</uistroke>
		</textlabel>
	</frame>
	<textlabel
		Key="Label"
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		LayoutOrder={3}
		Position={new UDim2(0.025, 0, 0.5, 0)}
		RichText={true}
		Size={new UDim2(0.8, 0, 0, 20)}
		Text="Buy for"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextSize={30}
		TextStrokeTransparency={0}
		TextWrapped={true}
		TextYAlignment={Enum.TextYAlignment.Bottom}
		ZIndex={25}
	>
		<uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={1.3}>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
				Rotation={90}
			/>
		</uistroke>
	</textlabel>
	<textlabel
		Key="FundsLabel"
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		LayoutOrder={6}
		Position={new UDim2(0.025, 0, 0.5, 0)}
		RichText={true}
		Size={new UDim2(0.8, 0, 0, 20)}
		Text={`Purchasing with Funds will increase the next Funds price by 1000x.
If you are on the leaderboards, you may need to rejoin to view the rename.`}
		TextColor3={Color3.fromRGB(195, 195, 195)}
		TextSize={20}
		TextStrokeTransparency={0}
		TextWrapped={true}
		ZIndex={25}
	>
		<uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={1.3}>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
				Rotation={90}
			/>
		</uistroke>
		<uiflexitem />
	</textlabel>
	<frame Key="Input" BackgroundTransparency={1} Size={new UDim2(0.7000000000000001, 0, 0, 35)}>
		<textbox
			Key="InputBox"
			AnchorPoint={new Vector2(0, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={0.7000000000000001}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			ClearTextOnFocus={false}
			Font={Enum.Font.Roboto}
			FontFace={Font { Family = rbxasset://fonts/families/Roboto.json, Weight = Regular, Style = Normal }}
			Position={new UDim2(0.4, 0, 0.5, 0)}
			Size={new UDim2(0.5, 0, 1, 0)}
			Text={""}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={25}
			TextWrapped={true}
			ZIndex={100}
		>
			<uicorner CornerRadius={new UDim(0.2, 0)} />
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(135, 135, 135)} />
			<uistroke Color={Color3.fromRGB(44, 44, 44)} Thickness={2} />
		</textbox>
		<uiflexitem />
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 15)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<textlabel
			Key="PrefixLabel"
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
			LayoutOrder={-1}
			Position={new UDim2(0.025, 0, 0.5, 0)}
			RichText={true}
			Size={new UDim2(0, 0, 0.9, 0)}
			Text="you's "
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={20}
			TextStrokeTransparency={0}
			TextWrapped={true}
			ZIndex={25}
		>
			<uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={1.3}>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
					Rotation={90}
				/>
			</uistroke>
			<uiflexitem />
		</textlabel>
	</frame>
</frame>