import Roact from "@rbxts/roact";

<frame Key="ChallengeOption" BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 150)}>
	<textlabel
		Key="TitleLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Position={new UDim2(0.025, 0, 0.05, 0)}
		Size={new UDim2(0.5, 0, 0.25, 0)}
		Text="Melting Economy I"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextWrapped={true}
		TextXAlignment={Enum.TextXAlignment.Left}
	>
		<uistroke Thickness={2} />
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 151)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 170, 255))])}
		/>
	</textlabel>
	<imagelabel
		Key="Button"
		AnchorPoint={new Vector2(0, 1)}
		BackgroundTransparency={1}
		Image="rbxassetid://84050131584659"
		ImageColor3={Color3.fromRGB(0, 0, 0)}
		ImageContent={Content}
		ImageTransparency={0.6}
		Position={new UDim2(0, 2, 1, 0)}
		Size={new UDim2(0.96, 0, 0.8250000000000001, 0)}
		ZIndex={-2}
	>
		<imagelabel
			Key="Button"
			BackgroundTransparency={1}
			Image="rbxassetid://124172656237043"
			ImageContent={Content}
			ImageTransparency={0.9500000000000001}
			Size={new UDim2(1, 0, 1, 0)}
			ZIndex={-2}
		/>
	</imagelabel>
	<textbutton
		Key="StartButton"
		BackgroundColor3={Color3.fromRGB(255, 255, 255)}
		BorderSizePixel={0}
		Font={Enum.Font.SourceSans}
		FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
		Position={new UDim2(0.55, 0, 0.5, 0)}
		Size={new UDim2(0.35000000000000003, 0, 0.35000000000000003, 0)}
		Text={""}
		TextColor3={Color3.fromRGB(0, 0, 0)}
		TextSize={14}
	>
		<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
		<uicorner CornerRadius={new UDim(0.2, 0)} />
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 127)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 157, 0))])}
			Rotation={90}
		/>
		<textlabel
			Key="Label"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
			Size={new UDim2(1, 0, 1, 0)}
			Text="Start"
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
	<frame
		Key="Description"
		BackgroundTransparency={1}
		Position={new UDim2(0.025, 0, 0.325, 0)}
		Size={new UDim2(0.5, 0, 0.6, 0)}
	>
		<textlabel
			Key="DescriptionLabel"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			Size={new UDim2(1, 0, 0, 0)}
			Text="Funds gain is heavily nerfed by ^0.95."
			TextColor3={Color3.fromRGB(209, 209, 209)}
			TextScaled={true}
			TextSize={22}
			TextStrokeTransparency={0}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Top}
		>
			<uitextsizeconstraint MaxTextSize={22} />
			<uiflexitem />
		</textlabel>
		<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} VerticalFlex={Enum.UIFlexAlignment.SpaceBetween} />
		<textlabel
			Key="NoticeLabel"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			LayoutOrder={1}
			Size={new UDim2(1, 0, 0, 0)}
			Text="A Skillifcation will be simulated. Your progress is not lost."
			TextColor3={Color3.fromRGB(172, 172, 172)}
			TextScaled={true}
			TextSize={22}
			TextStrokeTransparency={0}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Top}
		>
			<uitextsizeconstraint MaxTextSize={16} />
			<uiflexitem />
		</textlabel>
		<textlabel
			Key="RequirementLabel"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			LayoutOrder={99}
			Size={new UDim2(1, 0, 0, 0)}
			Text="Requirement: Purchase Admiration or Codependence"
			TextColor3={Color3.fromRGB(255, 0, 0)}
			TextScaled={true}
			TextSize={22}
			TextStrokeTransparency={0}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Top}
		>
			<uitextsizeconstraint MaxTextSize={18} />
			<uiflexitem />
		</textlabel>
		<frame BackgroundTransparency={1} LayoutOrder={88}>
			<uiflexitem FlexMode={Enum.UIFlexMode.Grow} />
		</frame>
	</frame>
	<textlabel
		Key="RewardLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Position={new UDim2(0.55, 0, 0.25, 0)}
		Size={new UDim2(0.35000000000000003, 0, 0.17500000000000002, 0)}
		Text="Boost: x$1 > x$2"
		TextColor3={Color3.fromRGB(126, 255, 145)}
		TextScaled={true}
		TextWrapped={true}
	>
		<uistroke Thickness={2} />
	</textlabel>
</frame>