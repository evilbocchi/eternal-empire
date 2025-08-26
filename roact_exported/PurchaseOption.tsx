import Roact from "@rbxts/roact";

<frame Key="PurchaseOption" Active={true} BackgroundTransparency={1} Size={new UDim2(1, 0, 0.3, 0)}>
	<textbutton
		Key="Button"
		BackgroundColor3={Color3.fromRGB(255, 255, 255)}
		BorderSizePixel={0}
		Font={Enum.Font.SourceSans}
		FontFace={Font { Family = rbxasset://fonts/families/SourceSansPro.json, Weight = Regular, Style = Normal }}
		Rotation={2}
		Size={new UDim2(0.25, 0, 1, 0)}
		Text={""}
		TextColor3={Color3.fromRGB(0, 0, 0)}
		TextSize={14}
	>
		<textlabel
			Key="AmountLabel"
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Size={new UDim2(0.8, 0, 0.75, 0)}
			Text="Buy x1"
			TextColor3={Color3.fromRGB(0, 0, 0)}
			TextScaled={true}
			TextWrapped={true}
		/>
	</textbutton>
	<frame
		Key="Shadow"
		Active={true}
		BackgroundColor3={Color3.fromRGB(115, 115, 115)}
		BorderSizePixel={0}
		Position={new UDim2(0, -4, 0, -4)}
		Rotation={2}
		Selectable={true}
		Size={new UDim2(0.25, 0, 1, 0)}
		ZIndex={0}
	/>
	<textlabel
		Key="CostLabel"
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		Position={new UDim2(0.25, 0, 0, 0)}
		Size={new UDim2(0.75, 0, 1, 0)}
		Text="Cost: $1TVt, 111.25 W"
		TextColor3={Color3.fromRGB(255, 255, 255)}
		TextScaled={true}
		TextSize={14}
		TextWrapped={true}
	>
		<uistroke />
		<uipadding
			PaddingBottom={new UDim(0, 5)}
			PaddingLeft={new UDim(0, 25)}
			PaddingTop={new UDim(0, 5)}
		/>
	</textlabel>
</frame>