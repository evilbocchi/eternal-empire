import Roact from "@rbxts/roact";

<frame
	Key="QuestOption"
	AutomaticSize={Enum.AutomaticSize.Y}
	BackgroundColor3={Color3.fromRGB(255, 255, 127)}
	BorderColor3={Color3.fromRGB(0, 0, 0)}
	BorderSizePixel={7}
	Size={new UDim2(1, 0, 0, 0)}
>
	<uilistlayout
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 10)}
		SortOrder={Enum.SortOrder.LayoutOrder}
	/>
	<frame
		Key="Content"
		AutomaticSize={Enum.AutomaticSize.Y}
		BackgroundColor3={Color3.fromRGB(0, 0, 0)}
		BackgroundTransparency={0.9500000000000001}
		BorderSizePixel={0}
		Size={new UDim2(1, 0, 0, 0)}
	>
		<textlabel
			Key="CurrentStepLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0.5)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(0.856, 0, 0, 0)}
			Text=" - Check out what's happening at Slamo Village."
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={20}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 7)}
			SortOrder={Enum.SortOrder.LayoutOrder}
		/>
		<textlabel
			Key="RewardLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0.5)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
			LayoutOrder={3}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(0.9, 0, 0, 0)}
			Text="Reward: 100 XP"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={20}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uistroke Thickness={2} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 255, 255))])}
				Rotation={90}
			/>
		</textlabel>
		<textlabel
			Key="LengthLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0.5)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
			LayoutOrder={2}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(0.9, 0, 0, 0)}
			Text="Length: Long"
			TextColor3={Color3.fromRGB(255, 123, 28)}
			TextSize={20}
			TextStrokeTransparency={0}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uistroke Thickness={2} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.547, Color3.fromRGB(243, 243, 243)), new ColorSequenceKeypoint(1, Color3.fromRGB(206, 206, 206))])}
				Rotation={90}
			/>
			<uipadding PaddingTop={new UDim(0, 10)} />
		</textlabel>
		<uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
		<textlabel
			Key="Label"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0.5)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(0.9, 0, 0, 0)}
			Text="Current stage:"
			TextColor3={Color3.fromRGB(197, 197, 197)}
			TextSize={20}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<textbutton
			Key="Track"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundColor3={Color3.fromRGB(85, 255, 127)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={4}
			LayoutOrder={15}
			Selectable={false}
			Size={new UDim2(0.4, 0, 0, 0)}
			Text={""}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(156, 156, 156))])}
				Rotation={90}
			/>
			<uistroke
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Color={Color3.fromRGB(85, 255, 127)}
				Thickness={2}
			/>
			<textlabel
				Key="Label"
				Active={true}
				AnchorPoint={new Vector2(0.5, 0.5)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				LayoutOrder={3}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Size={new UDim2(0.9, 0, 0, 0)}
				Text="Track"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={20}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uilistlayout
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 10)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<uipadding
				PaddingBottom={new UDim(0, 5)}
				PaddingLeft={new UDim(0, 5)}
				PaddingRight={new UDim(0, 5)}
				PaddingTop={new UDim(0, 5)}
			/>
		</textbutton>
	</frame>
	<textbutton
		Key="Dropdown"
		BackgroundTransparency={1}
		Font={Enum.Font.SourceSans}
		FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
		LayoutOrder={-1}
		Size={new UDim2(1, 0, 0, 30)}
		Text={""}
		TextColor3={Color3.fromRGB(0, 0, 0)}
		TextSize={14}
	>
		<imagelabel
			AnchorPoint={new Vector2(1, 0.5)}
			BackgroundTransparency={1}
			Image="rbxassetid://5279719038"
			ImageContent={Content}
			Position={new UDim2(0.9500000000000001, 0, 0.5, 0)}
			Rotation={180}
			ScaleType={Enum.ScaleType.Fit}
			Size={new UDim2(0.8, 0, 0.8, 0)}
			SizeConstraint={Enum.SizeConstraint.RelativeYY}
		/>
		<textlabel
			Key="LevelLabel"
			Active={true}
			AnchorPoint={new Vector2(0, 0.5)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0, 0, 0.5, 0)}
			Size={new UDim2(0.2, 0, 0.9, 0)}
			Text="Lv. 1"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<textlabel
			Key="NameLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(0.5, 0, 1, 0)}
			Text="Quest Name"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.6940000000000001, Color3.fromRGB(253, 253, 253)), new ColorSequenceKeypoint(1, Color3.fromRGB(176, 176, 176))])}
				Rotation={90}
			/>
		</textlabel>
	</textbutton>
	<uigradient
		Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)), new ColorSequenceKeypoint(1, Color3.fromRGB(85, 85, 85))])}
		Rotation={90}
	/>
	<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 127)} Thickness={4}>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.375, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)), new ColorSequenceKeypoint(0.583, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
			Rotation={85}
		/>
	</uistroke>
	<uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
</frame>