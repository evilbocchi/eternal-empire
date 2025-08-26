import Roact from "@rbxts/roact";

<frame
	Key="TrackedQuestWindow"
	AnchorPoint={new Vector2(0.5, 0)}
	AutomaticSize={Enum.AutomaticSize.Y}
	BackgroundTransparency={1}
	Position={new UDim2(0.5, 0, 0.045, 61)}
	Size={new UDim2(0.425, 200, 0, 0)}
>
	<textlabel
		Key="TitleLabel"
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		Size={new UDim2(1, 0, 0, 0)}
		Text="jioef hjiodf hioesf "
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextSize={30}
		TextWrapped={true}
		Visible={false}
	>
		<uistroke Thickness={2} />
	</textlabel>
	<textlabel
		Key="DescriptionLabel"
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
		LayoutOrder={1}
		Size={new UDim2(1, 0, 0, 0)}
		Text="Talk to someone"
		TextColor3={Color3.fromRGB(182, 182, 182)}
		TextSize={20}
		TextWrapped={true}
		TextYAlignment={Enum.TextYAlignment.Top}
		Visible={false}
	>
		<uistroke Thickness={1.5} />
	</textlabel>
	<uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
	<frame
		Key="Completion"
		BackgroundTransparency={1}
		LayoutOrder={-5}
		Size={new UDim2(0.5, 0, 0, 85)}
		Visible={false}
	>
		<textlabel
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
			Position={new UDim2(0.5, 0, 0, 0)}
			Rotation={-2}
			Size={new UDim2(2, 0, 0.7000000000000001, 0)}
			Text="Quest Complete!"
			TextColor3={Color3.fromRGB(175, 255, 194)}
			TextScaled={true}
			TextSize={30}
			TextWrapped={true}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(170, 255, 0))])}
				Rotation={90}
			/>
			<uistroke Thickness={2} />
		</textlabel>
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image="http://www.roblox.com/asset/?id=917186750"
			ImageColor3={Color3.fromRGB(170, 255, 127)}
			ImageContent={Content}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(1.5, 0, 3, 0)}
			ZIndex={0}
		/>
		<textlabel
			Key="RewardLabel"
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			Position={new UDim2(0.5, 0, 0.7000000000000001, 0)}
			Size={new UDim2(1, 0, 1, 0)}
			Text="You gained: nothing"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={20}
			TextWrapped={true}
			TextYAlignment={Enum.TextYAlignment.Top}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<uipadding PaddingBottom={new UDim(0, 15)} />
	</frame>
	<frame
		Key="Reset"
		BackgroundTransparency={1}
		LayoutOrder={-5}
		Size={new UDim2(0.5, 0, 0, 120)}
		Visible={false}
	>
		<uipadding PaddingBottom={new UDim(0, 15)} />
		<textlabel
			Key="AmountLabel"
			AnchorPoint={new Vector2(0, 1)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
			Position={new UDim2(0, 0, 1, 0)}
			Size={new UDim2(1, 0, 0, 0)}
			Text="10 SKILL"
			TextColor3={Color3.fromRGB(170, 255, 127)}
			TextSize={60}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.67, Color3.fromRGB(223, 223, 223)), new ColorSequenceKeypoint(1, Color3.fromRGB(157, 157, 157))])}
				Rotation={90}
			/>
		</textlabel>
		<textlabel
			Active={true}
			AnchorPoint={new Vector2(0, 1)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={-1}
			Position={new UDim2(0, 0, 1, -60)}
			Rotation={2}
			Size={new UDim2(1, 0, 0, 0)}
			Text="You got"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={40}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image="http://www.roblox.com/asset/?id=917186750"
			ImageColor3={Color3.fromRGB(170, 255, 127)}
			ImageContent={Content}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(1.5, 0, 3, 0)}
			ZIndex={0}
		/>
	</frame>
	<uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} SortOrder={Enum.SortOrder.LayoutOrder} />
	<canvasgroup
		Key="ProgressBar"
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundTransparency={1}
		LayoutOrder={6}
		Position={new UDim2(0.5, 0, 1, 15)}
		Size={new UDim2(0.5, 0, 0, 45)}
		Visible={false}
		ZIndex={5}
	>
		<frame
			Key="Bar"
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(39, 39, 39)}
			BorderSizePixel={0}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(0.9, 0, 1, -15)}
		>
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
				ZIndex={2}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<frame
				Key="Fill"
				BackgroundColor3={Color3.fromRGB(255, 170, 255)}
				BorderSizePixel={0}
				Size={new UDim2(0.5, 0, 1, 0)}
			>
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
				<uicorner CornerRadius={new UDim(0, 10)} />
			</frame>
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
			<uicorner CornerRadius={new UDim(0, 10)} />
		</frame>
	</canvasgroup>
	<frame
		Key="ChallengeCompletion"
		BackgroundTransparency={1}
		LayoutOrder={-5}
		Size={new UDim2(0.5, 0, 0, 85)}
		Visible={false}
	>
		<textlabel
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
			Position={new UDim2(0.5, 0, 0, 0)}
			Rotation={-2}
			Size={new UDim2(2, 0, 0.7000000000000001, 0)}
			Text="Challenge Complete!"
			TextColor3={Color3.fromRGB(255, 169, 169)}
			TextScaled={true}
			TextSize={30}
			TextWrapped={true}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 139, 139))])}
				Rotation={90}
			/>
			<uistroke Thickness={2} />
		</textlabel>
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image="http://www.roblox.com/asset/?id=917186750"
			ImageColor3={Color3.fromRGB(255, 80, 80)}
			ImageContent={Content}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(1.5, 0, 3, 0)}
			ZIndex={0}
		/>
		<textlabel
			Key="RewardLabel"
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			Position={new UDim2(0.5, 0, 0.7000000000000001, 0)}
			Size={new UDim2(1, 0, 1, 0)}
			Text="You gained: nothing"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={20}
			TextWrapped={true}
			TextYAlignment={Enum.TextYAlignment.Top}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<uipadding PaddingBottom={new UDim(0, 15)} />
	</frame>
	<frame
		Key="ChallengeTaskWindow"
		AnchorPoint={new Vector2(0.5, 0)}
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		Position={new UDim2(0.5, 0, 0.078, 35)}
		Size={new UDim2(1, -300, 0, 0)}
		Visible={false}
	>
		<textlabel
			Key="TitleLabel"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={2}
			Position={new UDim2(0.025, 0, 0.05, 0)}
			Size={new UDim2(1, 0, 0, 0)}
			Text="Melting Economy I"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={30}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 151)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 170, 255))])}
			/>
		</textlabel>
		<textlabel
			Key="RequirementLabel"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={3}
			Size={new UDim2(0.9, 0, 0, 0)}
			Text="Requirement: Sets"
			TextColor3={Color3.fromRGB(255, 103, 103)}
			TextSize={20}
			TextWrapped={true}
			TextYAlignment={Enum.TextYAlignment.Top}
		>
			<uistroke Thickness={2} />
			<uitextsizeconstraint MaxTextSize={24} />
		</textlabel>
		<textlabel
			Key="Label"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			Size={new UDim2(0.9, 0, 0, 0)}
			Text="You are currently in:"
			TextColor3={Color3.fromRGB(255, 103, 103)}
			TextSize={24}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} SortOrder={Enum.SortOrder.LayoutOrder} />
	</frame>
</frame>