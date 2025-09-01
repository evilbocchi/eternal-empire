import Roact from "@rbxts/roact";

<frame Key="Stats" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
	<scrollingframe
		Key="StatList"
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
		<textlabel
			Key="ServerLabel"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			Size={new UDim2(1, 0, 0, 35)}
			Text="Empire Statistics"
			TextColor3={Color3.fromRGB(182, 182, 182)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<frame
			Key="Playtime"
			BackgroundColor3={Color3.fromRGB(89, 89, 89)}
			BackgroundTransparency={0.8}
			BorderSizePixel={0}
			LayoutOrder={1}
			Size={new UDim2(1, 0, 0, 40)}
		>
			<uicorner />
			<uistroke Color={Color3.fromRGB(24, 24, 24)} />
			<textlabel
				Key="StatLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Size={new UDim2(0.6, 0, 0.7000000000000001, 0)}
				Text="Server Playtime"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0.05, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<textlabel
				Key="AmountLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Size={new UDim2(0.2, 0, 0.7000000000000001, 0)}
				Text="00:00:00"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
		</frame>
		<textlabel
			Key="PlayerLabel"
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			LayoutOrder={100000}
			Size={new UDim2(1, 0, 0, 35)}
			Text="Player Statistics"
			TextColor3={Color3.fromRGB(182, 182, 182)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<frame
			Key="SessionTime"
			BackgroundColor3={Color3.fromRGB(89, 89, 89)}
			BackgroundTransparency={0.8}
			BorderSizePixel={0}
			LayoutOrder={2}
			Size={new UDim2(1, 0, 0, 40)}
		>
			<uicorner />
			<uistroke Color={Color3.fromRGB(24, 24, 24)} />
			<textlabel
				Key="StatLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Size={new UDim2(0.6, 0, 0.7000000000000001, 0)}
				Text="Session Time"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0.05, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<textlabel
				Key="AmountLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Size={new UDim2(0.2, 0, 0.7000000000000001, 0)}
				Text="00:00:00"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
		</frame>
		<frame
			Key="LongestSessionTime"
			BackgroundColor3={Color3.fromRGB(89, 89, 89)}
			BackgroundTransparency={0.8}
			BorderSizePixel={0}
			LayoutOrder={3}
			Size={new UDim2(1, 0, 0, 40)}
		>
			<uicorner />
			<uistroke Color={Color3.fromRGB(24, 24, 24)} />
			<textlabel
				Key="StatLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Size={new UDim2(0.6, 0, 0.7000000000000001, 0)}
				Text="Longest Session Time"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0.05, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<textlabel
				Key="AmountLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Size={new UDim2(0.2, 0, 0.7000000000000001, 0)}
				Text="00:00:00"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
		</frame>
		<frame
			Key="RawPurifierClicks"
			BackgroundColor3={Color3.fromRGB(89, 89, 89)}
			BackgroundTransparency={0.8}
			BorderSizePixel={0}
			LayoutOrder={100003}
			Size={new UDim2(1, 0, 0, 40)}
		>
			<uicorner />
			<uistroke Color={Color3.fromRGB(24, 24, 24)} />
			<textlabel
				Key="StatLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Size={new UDim2(0.6, 0, 0.7000000000000001, 0)}
				Text="Raw Purifier Clicks"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0.05, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<textlabel
				Key="AmountLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Size={new UDim2(0.2, 0, 0.7000000000000001, 0)}
				Text="1"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
		</frame>
		<frame
			Key="CurrentPing"
			BackgroundColor3={Color3.fromRGB(89, 89, 89)}
			BackgroundTransparency={0.8}
			BorderSizePixel={0}
			LayoutOrder={100002}
			Size={new UDim2(1, 0, 0, 40)}
		>
			<uicorner />
			<uistroke Color={Color3.fromRGB(24, 24, 24)} />
			<textlabel
				Key="StatLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Size={new UDim2(0.6, 0, 0.7000000000000001, 0)}
				Text="Droplet Ping"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uistroke Thickness={2} />
			</textlabel>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0.05, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<textlabel
				Key="AmountLabel"
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
				Size={new UDim2(0.2, 0, 0.7000000000000001, 0)}
				Text="1"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled={true}
				TextSize={14}
				TextWrapped={true}
			>
				<uistroke Thickness={2} />
			</textlabel>
		</frame>
	</scrollingframe>
</frame>