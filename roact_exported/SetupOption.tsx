import Roact from "@rbxts/roact";

<frame
	Key="SetupOption"
	BackgroundColor3={Color3.fromRGB(0, 0, 0)}
	BackgroundTransparency={0.8}
	BorderSizePixel={0}
	Size={new UDim2(1, 0, 0, 125)}
>
	<uilistlayout
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<frame Key="Heading" BackgroundTransparency={1} Size={new UDim2(1, -60, 0.33, 0)}>
		<imagebutton
			Key="EditButton"
			BackgroundTransparency={1}
			Image="rbxassetid://15911231575"
			ImageContent={Content}
			ImageTransparency={0.2}
			LayoutOrder={2}
			Size={new UDim2(0.6, 0, 0.6, 0)}
		>
			<uiaspectratioconstraint />
		</imagebutton>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalFlex={Enum.UIFlexAlignment.Fill}
			Padding={new UDim(0, 15)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<textbox
			Key="NameLabel"
			Active={false}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			ClearTextOnFocus={false}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={-5}
			Selectable={false}
			Size={new UDim2(0, 0, 0.8, 0)}
			Text="Setup 1"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextEditable={false}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
		>
			<uistroke Thickness={2} />
			<frame
				AnchorPoint={new Vector2(0, 1)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={0.8}
				BorderSizePixel={0}
				Position={new UDim2(0, 0, 1, 0)}
				Size={new UDim2(1, 6, 0, 2)}
			/>
			<uiflexitem />
		</textbox>
		<textlabel
			Key="CostLabel"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={5}
			Size={new UDim2(0, 0, 0.8, 0)}
			Text="Cost: $1Qd, 100 W, 140 Purifier Clicks"
			TextColor3={Color3.fromRGB(170, 255, 127)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Right}
		>
			<uistroke Thickness={2} />
			<uitextsizeconstraint MaxTextSize={22} />
		</textlabel>
	</frame>
	<frame Key="Body" BackgroundTransparency={1} Size={new UDim2(1, 0, 0.66, 0)}>
		<textbutton
			Key="SaveButton"
			BackgroundColor3={Color3.fromRGB(170, 255, 127)}
			BorderSizePixel={0}
			Font={Enum.Font.SourceSans}
			FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
			Size={new UDim2(0.2, 0, 0.8, 0)}
			Text={""}
			TextColor3={Color3.fromRGB(0, 0, 0)}
			TextSize={14}
		>
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
			<textlabel
				Key="Label"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Size={new UDim2(0.9, 0, 0.4, 0)}
				Text="Save"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={1.5} />
			</textlabel>
		</textbutton>
		<textbutton
			Key="LoadButton"
			BackgroundColor3={Color3.fromRGB(255, 170, 0)}
			BorderSizePixel={0}
			Font={Enum.Font.SourceSans}
			FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
			LayoutOrder={1}
			Size={new UDim2(0.2, 0, 0.8, 0)}
			Text={""}
			TextColor3={Color3.fromRGB(0, 0, 0)}
			TextSize={14}
		>
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
			<textlabel
				Key="Label"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Size={new UDim2(0.9, 0, 0.4, 0)}
				Text="Load"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={1.5} />
			</textlabel>
		</textbutton>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0.025, 0)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<frame
			Key="Autoload"
			BackgroundTransparency={1}
			LayoutOrder={-5}
			Size={new UDim2(0.4, 0, 1, 0)}
		>
			<textlabel
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
				Size={new UDim2(1, 0, 0.35000000000000003, 0)}
				Text="Alert when affordable"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uilistlayout
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<textbutton
				Key="ToggleButton"
				BackgroundColor3={Color3.fromRGB(50, 50, 50)}
				BorderSizePixel={0}
				Font={Enum.Font.SourceSans}
				FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
				LayoutOrder={5}
				Size={new UDim2(0.4, 0, 0.25, 0)}
				Text={""}
				TextColor3={Color3.fromRGB(0, 0, 0)}
				TextSize={14}
			>
				<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
				<frame
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={Color3.fromRGB(255, 79, 79)}
					BorderSizePixel={0}
					Position={new UDim2(0, 4, 0.5, 0)}
					Size={new UDim2(0.3, 0, 0.8, -2)}
				>
					<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
				</frame>
			</textbutton>
		</frame>
	</frame>
</frame>