import Roact from "@rbxts/roact";

<frame Key="Commands" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
	<scrollingframe
		Key="CommandsList"
		AnchorPoint={new Vector2(0.5, 0)}
		AutomaticCanvasSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		CanvasSize={new UDim2(0, 0, 0, 0)}
		Position={new UDim2(0.5, 0, 0, 0)}
		ScrollBarThickness={6}
		Selectable={false}
		Size={new UDim2(1, 0, 1, 0)}
	>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 10)}
			SortOrder={Enum.SortOrder.LayoutOrder}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 10)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
		</uilistlayout>
		<uipadding
			PaddingBottom={new UDim(0, 5)}
			PaddingLeft={new UDim(0, 10)}
			PaddingRight={new UDim(0, 10)}
			PaddingTop={new UDim(0, 5)}
		/>
	</scrollingframe>
</frame>