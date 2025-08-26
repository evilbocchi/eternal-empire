<frame
	Key="Settings"
	BackgroundColor3={Color3.fromRGB(13, 13, 13)}
	BorderColor3={Color3.fromRGB(0, 0, 0)}
	BorderSizePixel={4}
	Selectable={true}
	Size={new UDim2(1, 0, 1, 0)}
	Visible={false}
>
	<scrollingframe
		Key="InteractionOptions"
		AnchorPoint={new Vector2(0.5, 0.5)}
		AutomaticCanvasSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		CanvasSize={new UDim2(0, 0, 0, 0)}
		Position={new UDim2(0.5, 0, 0.5, 0)}
		ScrollBarThickness={6}
		Selectable={false}
		Size={new UDim2(0.8, 0, 0.9, 0)}
	>
		<uilistlayout Padding={new UDim(0, 9)} SortOrder={Enum.SortOrder.LayoutOrder} />
		<frame
			Key="ScientificNotation"
			BackgroundTransparency={1}
			LayoutOrder={-3}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				Text="Scientific Notation"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={30}
				TextStrokeTransparency={0}
				ZIndex={25}
			/>
		</frame>
		<frame
			Key="GeneralTerm"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			LayoutOrder={-50}
			Position={new UDim2(0, 0, 1, 0)}
			Size={new UDim2(1, 0, 0, 0)}
		>
			<textlabel
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Size={new UDim2(0, 200, 0, 35)}
				Text="General"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
						Rotation={90}
					/>
				</uistroke>
			</textlabel>
			<frame
				Key="Line"
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={0}
				LayoutOrder={99}
				Position={new UDim2(0, 0, 1, 0)}
				Size={new UDim2(1, 0, 0, 3)}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(208, 208, 208)), new ColorSequenceKeypoint(1, Color3.fromRGB(208, 208, 208))])}
					Transparency={new NumberSequence([new NumberSequenceKeypoint(0, 0, 0), new NumberSequenceKeypoint(0.5, 0, 0), new NumberSequenceKeypoint(1, 1, 0)])}
				/>
			</frame>
			<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding PaddingBottom={new UDim(0, 10)} />
		</frame>
		<uipadding PaddingRight={new UDim(0, 5)} />
		<frame
			Key="ControlsTerm"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			LayoutOrder={100}
			Position={new UDim2(0, 0, 1, 0)}
			Size={new UDim2(1, 0, 0, 0)}
		>
			<textlabel
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Size={new UDim2(0, 200, 0, 35)}
				Text="Controls"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
						Rotation={90}
					/>
				</uistroke>
			</textlabel>
			<frame
				Key="Line"
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={0}
				LayoutOrder={99}
				Position={new UDim2(0, 0, 1, 0)}
				Size={new UDim2(1, 0, 0, 3)}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(208, 208, 208)), new ColorSequenceKeypoint(1, Color3.fromRGB(208, 208, 208))])}
					Transparency={new NumberSequence([new NumberSequenceKeypoint(0, 0, 0), new NumberSequenceKeypoint(0.5, 0, 0), new NumberSequenceKeypoint(1, 1, 0)])}
				/>
			</frame>
			<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
		</frame>
		<frame
			Key="ResetAnimation"
			BackgroundTransparency={1}
			LayoutOrder={1}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				Text="Reset Layer Animations"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={30}
				TextStrokeTransparency={0}
				ZIndex={25}
			/>
		</frame>
		<frame
			Key="FormatCurrencies"
			BackgroundTransparency={1}
			LayoutOrder={-1}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				RichText={true}
				Text={`Format Currencies
<font color="#bebebe" size="14">This is forcefully disabled on smaller screens.</font>`}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={25}
				TextStrokeTransparency={0}
				TextXAlignment={Enum.TextXAlignment.Left}
				ZIndex={25}
			/>
		</frame>
		<frame
			Key="Music"
			BackgroundTransparency={1}
			LayoutOrder={-5}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				Text="Music"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={30}
				TextStrokeTransparency={0}
				ZIndex={25}
			/>
		</frame>
		<frame
			Key="SoundEffects"
			BackgroundTransparency={1}
			LayoutOrder={-5}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				Text="Sound Effects"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={30}
				TextStrokeTransparency={0}
				ZIndex={25}
			/>
		</frame>
		<frame
			Key="CurrentlyPlaying"
			BackgroundTransparency={1}
			LayoutOrder={-6}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
			Visible={false}
		>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0, 0, 0.5, 0)}
				Text="Now playing: Hamster"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={25}
				TextStrokeTransparency={0}
				ZIndex={-50}
			/>
			<imagelabel
				BackgroundTransparency={1}
				Image="rbxassetid://253828517"
				ImageContent={Content}
				LayoutOrder={-5}
				Size={new UDim2(1, 0, 1, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
			/>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 15)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
		</frame>
		<frame
			Key="BuildAnimation"
			BackgroundTransparency={1}
			LayoutOrder={2}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				Text="Build Animations"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={30}
				TextStrokeTransparency={0}
				ZIndex={25}
			/>
		</frame>
		<frame
			Key="CoalesceItemCategories"
			BackgroundTransparency={1}
			LayoutOrder={21}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				Text="Coalesce Item Categories"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={30}
				TextStrokeTransparency={0}
				ZIndex={25}
			/>
		</frame>
		<frame
			Key="HideMaxedItems"
			BackgroundTransparency={1}
			LayoutOrder={22}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				Text="Hide Maxed Items"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={30}
				TextStrokeTransparency={0}
				ZIndex={25}
			/>
		</frame>
		<frame
			Key="LayoutTerm"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			LayoutOrder={20}
			Position={new UDim2(0, 0, 1, 0)}
			Size={new UDim2(1, 0, 0, 0)}
		>
			<textlabel
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Size={new UDim2(0, 200, 0, 35)}
				Text="Layout"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
						Rotation={90}
					/>
				</uistroke>
			</textlabel>
			<frame
				Key="Line"
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={0}
				LayoutOrder={99}
				Position={new UDim2(0, 0, 1, 0)}
				Size={new UDim2(1, 0, 0, 3)}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(208, 208, 208)), new ColorSequenceKeypoint(1, Color3.fromRGB(208, 208, 208))])}
					Transparency={new NumberSequence([new NumberSequenceKeypoint(0, 0, 0), new NumberSequenceKeypoint(0.5, 0, 0), new NumberSequenceKeypoint(1, 1, 0)])}
				/>
			</frame>
			<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding PaddingBottom={new UDim(0, 10)} />
		</frame>
		<frame
			Key="CurrencyGainAnimation"
			BackgroundTransparency={1}
			LayoutOrder={2}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				Text="Currency Gain Animations"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={30}
				TextStrokeTransparency={0}
				ZIndex={25}
			/>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
			</textbutton>
		</frame>
		<frame
			Key="PerformanceTerm"
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Position={new UDim2(0, 0, 1, 0)}
			Size={new UDim2(1, 0, 0, 0)}
		>
			<textlabel
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Size={new UDim2(0, 200, 0, 35)}
				Text="Performance"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)), new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30))])}
						Rotation={90}
					/>
				</uistroke>
			</textlabel>
			<frame
				Key="Line"
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={0}
				LayoutOrder={99}
				Position={new UDim2(0, 0, 1, 0)}
				Size={new UDim2(1, 0, 0, 3)}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(208, 208, 208)), new ColorSequenceKeypoint(1, Color3.fromRGB(208, 208, 208))])}
					Transparency={new NumberSequence([new NumberSequenceKeypoint(0, 0, 0), new NumberSequenceKeypoint(0.5, 0, 0), new NumberSequenceKeypoint(1, 1, 0)])}
				/>
			</frame>
			<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding PaddingBottom={new UDim(0, 10)} />
		</frame>
		<frame
			Key="ItemShadows"
			BackgroundTransparency={1}
			LayoutOrder={2}
			Position={new UDim2(0.8, 0, 0.15, 0)}
			Size={new UDim2(1, 0, 0.16, 0)}
		>
			<textbutton
				Key="Toggle"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(170, 255, 127)}
				BorderColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={3}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.975, 0, 0.5, 0)}
				Size={new UDim2(0.75, 0, 0.75, 0)}
				SizeConstraint={Enum.SizeConstraint.RelativeYY}
				Text={""}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
				TextStrokeTransparency={0}
				TextWrapped={true}
				ZIndex={25}
			>
				<uistroke Color={Color3.fromRGB(170, 255, 127)}>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(170, 255, 127)}
					Thickness={2}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)), new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))])}
					/>
				</uistroke>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))])}
					Rotation={90}
				/>
			</textbutton>
			<textlabel
				Key="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Bold, Style = Normal }}
				LayoutOrder={-1}
				Position={new UDim2(0.025, 0, 0.5, 0)}
				RichText={true}
				Text={`Item Shadows
<font color="#bebebe" size="14">Items may need to be placed again to apply changes.</font>`}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={25}
				TextStrokeTransparency={0}
				TextXAlignment={Enum.TextXAlignment.Left}
				ZIndex={25}
			/>
		</frame>
	</scrollingframe>
	<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} />
</frame>