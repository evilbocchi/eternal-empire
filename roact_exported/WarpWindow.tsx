import Roact from "@rbxts/roact";

<frame Key="Warp" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
	<uilistlayout
		FillDirection={Enum.FillDirection.Horizontal}
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0, 20)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<imagebutton
		Key="SlamoVillage"
		BackgroundColor3={Color3.fromRGB(170, 255, 127)}
		BorderSizePixel={0}
		Image="rbxassetid://17431929168"
		ImageContent={Content}
		ImageTransparency={0.5}
		LayoutOrder={2}
		ScaleType={Enum.ScaleType.Crop}
		Size={new UDim2(0.3, 0, 1, 0)}
	>
		<uicorner CornerRadius={new UDim(0.1, 0)} />
		<textlabel
			Key="Label"
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0.2, 0)}
			Rotation={-2}
			Size={new UDim2(1, 0, 0.2, 0)}
			Text="Slamo"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={35}
			TextWrapped={true}
			ZIndex={2}
		>
			<uistroke Thickness={2} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 127)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 255, 0))])}
				Rotation={90}
			/>
		</textlabel>
		<uipadding
			PaddingBottom={new UDim(0, 15)}
			PaddingLeft={new UDim(0, 15)}
			PaddingRight={new UDim(0, 15)}
			PaddingTop={new UDim(0, 15)}
		/>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(97, 97, 97))])}
			Rotation={92}
		/>
		<textlabel
			Key="Label"
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0.4, 0)}
			Rotation={3}
			Size={new UDim2(1, 0, 0.15, 0)}
			Text="Village"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={35}
			TextWrapped={true}
			ZIndex={2}
		>
			<uistroke Thickness={2} />
		</textlabel>
	</imagebutton>
	<imagebutton
		Key="BarrenIslands"
		BackgroundColor3={Color3.fromRGB(85, 170, 127)}
		BorderSizePixel={0}
		Image="rbxassetid://17431929378"
		ImageContent={Content}
		ImageTransparency={0.5}
		ScaleType={Enum.ScaleType.Crop}
		Size={new UDim2(0.3, 0, 1, 0)}
	>
		<uicorner CornerRadius={new UDim(0.1, 0)} />
		<textlabel
			Key="Label"
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0.2, 0)}
			Rotation={4}
			Size={new UDim2(1, 0, 0.2, 0)}
			Text="Barren"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={35}
			TextWrapped={true}
			ZIndex={2}
		>
			<uistroke Thickness={2} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 127)), new ColorSequenceKeypoint(1, Color3.fromRGB(101, 152, 0))])}
				Rotation={90}
			/>
		</textlabel>
		<uipadding
			PaddingBottom={new UDim(0, 15)}
			PaddingLeft={new UDim(0, 15)}
			PaddingRight={new UDim(0, 15)}
			PaddingTop={new UDim(0, 15)}
		/>
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(97, 97, 97))])}
			Rotation={92}
		/>
		<textlabel
			Key="Label"
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0.4, 0)}
			Rotation={-2}
			Size={new UDim2(1, 0, 0.15, 0)}
			Text="Islands"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={35}
			TextWrapped={true}
			ZIndex={2}
		>
			<uistroke Thickness={2} />
		</textlabel>
	</imagebutton>
</frame>