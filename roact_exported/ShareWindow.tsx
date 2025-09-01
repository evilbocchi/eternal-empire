import Roact from "@rbxts/roact";

<frame Key="Share" BackgroundTransparency={1} Selectable={true} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
	<frame
		Key="Code"
		AutomaticSize={Enum.AutomaticSize.XY}
		BackgroundTransparency={1}
		LayoutOrder={3}
		Position={new UDim2(0.8, 0, 0.15, 0)}
		Size={new UDim2(0, 0, 0.16, 0)}
	>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 40)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<textbox
			Key="Input"
			AnchorPoint={new Vector2(0, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BackgroundTransparency={0.7000000000000001}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			ClearTextOnFocus={false}
			Font={Enum.Font.Roboto}
			FontFace={Font { Family = rbxasset://fonts/families/Roboto.json, Weight = Regular, Style = Normal }}
			Position={new UDim2(0.4, 0, 0.5, 0)}
			Size={new UDim2(0, 200, 0, 35)}
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
		<textlabel
			Key="Label"
			AnchorPoint={new Vector2(0, 0.5)}
			AutomaticSize={Enum.AutomaticSize.XY}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
			LayoutOrder={-1}
			Position={new UDim2(0.025, 0, 0.5, 0)}
			Text="Code"
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
		</textlabel>
	</frame>
	<uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} SortOrder={Enum.SortOrder.LayoutOrder} />
</frame>