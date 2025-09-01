import Roact from "@rbxts/roact";

<frame Key="Logs" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
	<scrollingframe
		Key="LogList"
		AnchorPoint={new Vector2(0.5, 1)}
		AutomaticCanvasSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		CanvasSize={new UDim2(0, 0, 0, 0)}
		Position={new UDim2(0.5, 0, 1, -35)}
		ScrollBarThickness={6}
		Selectable={false}
		Size={new UDim2(1, 0, 1, -70)}
	>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 10)}
			SortOrder={Enum.SortOrder.LayoutOrder}
		/>
		<uipadding
			PaddingBottom={new UDim(0, 5)}
			PaddingLeft={new UDim(0, 10)}
			PaddingRight={new UDim(0, 10)}
			PaddingTop={new UDim(0, 5)}
		/>
	</scrollingframe>
	<textlabel
		Key="Label"
		Active={true}
		AnchorPoint={new Vector2(0.5, 0)}
		BackgroundTransparency={1}
		Font={Enum.Font.Unknown}
		FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
		LayoutOrder={1}
		Position={new UDim2(0.5, 0, 0, 0)}
		Size={new UDim2(0.5, 0, 0, 25)}
		Text="Logs clear after 7 days"
		TextColor3={Color3.fromRGB(129, 129, 129)}
		TextScaled={true}
		TextSize={25}
		TextWrapped={true}
	>
		<uistroke Thickness={2}>
			<uistroke Thickness={2} />
		</uistroke>
	</textlabel>
	<frame
		Key="NavigationOptions"
		AnchorPoint={new Vector2(0.5, 1)}
		AutomaticSize={Enum.AutomaticSize.X}
		BackgroundTransparency={1}
		Position={new UDim2(0.5, 0, 1, 0)}
		Size={new UDim2(0, 0, 0, 25)}
	>
		<textlabel
			Key="PageLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 1)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 1, 0)}
			Size={new UDim2(0, 0, 1, 0)}
			Text="Page 1"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={25}
			TextWrapped={true}
		>
			<uistroke Thickness={2}>
				<uistroke Thickness={2} />
			</uistroke>
		</textlabel>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 25)}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
		<frame
			Key="Left"
			Active={true}
			BackgroundTransparency={1}
			LayoutOrder={-5}
			Selectable={true}
			Size={new UDim2(1, 0, 1, 0)}
			SizeConstraint={Enum.SizeConstraint.RelativeYY}
		>
			<imagebutton
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://5279719038"
				ImageContent={Content}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Rotation={90}
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
			Size={new UDim2(1, 0, 1, 0)}
			SizeConstraint={Enum.SizeConstraint.RelativeYY}
		>
			<imagebutton
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://5279719038"
				ImageContent={Content}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Rotation={270}
				ScaleType={Enum.ScaleType.Fit}
				Selectable={false}
				Size={new UDim2(1, 0, 1, 0)}
			/>
		</frame>
	</frame>
</frame>