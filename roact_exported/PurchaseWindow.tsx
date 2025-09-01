import Roact from "@rbxts/roact";

<frame Key="Purchase" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false} ZIndex={0}>
	<scrollingframe
		Key="DescriptionFrame"
		Active={true}
		AnchorPoint={new Vector2(0.5, 0)}
		AutomaticCanvasSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		CanvasSize={new UDim2(1, 0, 0, 0)}
		ElasticBehavior={Enum.ElasticBehavior.Never}
		LayoutOrder={1}
		Position={new UDim2(0.5, 0, 0, 100)}
		ScrollBarThickness={6}
		ScrollingDirection={Enum.ScrollingDirection.Y}
		Size={new UDim2(1, 0, 0.9, -70)}
	>
		<textlabel
			Key="DescriptionLabel"
			AutomaticSize={Enum.AutomaticSize.XY}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			RichText={true}
			Size={new UDim2(1, 0, 0, 0)}
			Text="Utilises the power of True Ease to somehow collect more Power from droplets. Funds boost is 400x that of Power, maxing out at 15M W. <0.5 * log20(power + 1) + 1>"
			TextColor3={Color3.fromRGB(195, 195, 195)}
			TextSize={22}
			TextStrokeTransparency={0}
			TextWrapped={true}
			TextYAlignment={Enum.TextYAlignment.Top}
		/>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 5)}
			SortOrder={Enum.SortOrder.LayoutOrder}
		/>
		<textlabel
			Key="CreatorLabel"
			AutomaticSize={Enum.AutomaticSize.XY}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			RichText={true}
			Size={new UDim2(1, 0, 0, 20)}
			Text="Creator: <name>"
			TextColor3={Color3.fromRGB(118, 118, 118)}
			TextSize={20}
			TextStrokeTransparency={0.8}
			TextTransparency={0.8}
			TextWrapped={true}
			TextYAlignment={Enum.TextYAlignment.Top}
		/>
		<uipadding PaddingLeft={new UDim(0, 5)} PaddingRight={new UDim(0, 15)} />
		<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
		<frame Key="Padding" BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
		</frame>
		<frame
			Key="PurchaseContainer"
			AnchorPoint={new Vector2(0.5, 1)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			LayoutOrder={2}
			Size={new UDim2(0.5, 50, 0, 0)}
		>
			<textbutton
				Key="Purchase"
				AnchorPoint={new Vector2(0.5, 1)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundColor3={Color3.fromRGB(85, 255, 127)}
				BorderColor3={Color3.fromRGB(27, 42, 53)}
				LayoutOrder={2}
				Selectable={false}
				Size={new UDim2(1, 0, 1, 0)}
				Text={""}
			>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(85, 255, 127)}
					Thickness={2}
				/>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(153, 153, 153)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
					Rotation={270}
				/>
				<textlabel
					Key="HeadingLabel"
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Font={Enum.Font.Unknown}
					FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
					LayoutOrder={-5}
					Position={new UDim2(0.5, 0, 0.5, 0)}
					Size={new UDim2(1, -20, 1, 0)}
					Text="PURCHASE"
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={30}
					TextTransparency={0.75}
					TextWrapped={true}
					TextXAlignment={Enum.TextXAlignment.Left}
					ZIndex={0}
				/>
				<uipadding
					PaddingBottom={new UDim(0, 5)}
					PaddingLeft={new UDim(0, 5)}
					PaddingRight={new UDim(0, 5)}
					PaddingTop={new UDim(0, 5)}
				/>
				<frame
					Key="Price"
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundTransparency={1}
					SelectionGroup={true}
					Size={new UDim2(1, 0, 0, 0)}
				>
					<uilistlayout
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						Padding={new UDim(0, 5)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>
				</frame>
			</textbutton>
			<uilistlayout
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 5)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<uipadding PaddingBottom={new UDim(0, 5)} />
		</frame>
	</scrollingframe>
	<imagelabel
		Key="ItemSlot"
		BackgroundColor3={Color3.fromRGB(81, 81, 81)}
		BorderColor3={Color3.fromRGB(0, 0, 0)}
		BorderSizePixel={6}
		Image="rbxassetid://4576475446"
		ImageContent={Content}
		Size={new UDim2(1, 0, 0.1, 50)}
	>
		<imagelabel
			Key="Reflection"
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image="rbxassetid://9734894135"
			ImageColor3={Color3.fromRGB(126, 126, 126)}
			ImageContent={Content}
			ImageTransparency={0.85}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			ScaleType={Enum.ScaleType.Tile}
			Size={new UDim2(1, 0, 1, 0)}
			TileSize={new UDim2(0, 100, 0, 100)}
			ZIndex={-5}
		>
			<uicorner CornerRadius={new UDim(0, 4)} />
		</imagelabel>
		<uistroke
			ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
			Color={Color3.fromRGB(255, 255, 255)}
			Thickness={3}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)), new ColorSequenceKeypoint(0.8220000000000001, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
				Rotation={35}
			/>
		</uistroke>
		<textlabel
			Key="AmountLabel"
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
			Position={new UDim2(0.5, 0, 1, 0)}
			Size={new UDim2(1, -10, 0.3, 0)}
			Text="Owned 59"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextStrokeTransparency={0}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Right}
		/>
		<frame Key="Contents" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
			<viewportframe
				BackgroundTransparency={1}
				LayoutOrder={-6}
				Size={new UDim2(0, 100, 1, -10)}
				ZIndex={0}
			/>
			<frame
				Key="Identification"
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				Size={new UDim2(0, 0, 1, 0)}
			>
				<textlabel
					Key="TitleLabel"
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					Font={Enum.Font.Unknown}
					FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
					Position={new UDim2(0, 110, 0, 15)}
					Size={new UDim2(0, 0, 0.4, 0)}
					Text="The First Dropper"
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<uistroke Thickness={2} />
				</textlabel>
				<frame
					Key="Difficulty"
					AnchorPoint={new Vector2(0, 1)}
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					LayoutOrder={1}
					Position={new UDim2(0, 110, 1, -15)}
					Size={new UDim2(0, 0, 0.3, 0)}
				>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0, 10)}
						SortOrder={Enum.SortOrder.LayoutOrder}
						VerticalAlignment={Enum.VerticalAlignment.Center}
					/>
					<imagelabel
						AnchorPoint={new Vector2(1, 0.5)}
						BackgroundTransparency={1}
						Image="rbxassetid://14197014108"
						ImageContent={Content}
						LayoutOrder={-1}
						Position={new UDim2(1, -4, 0.5, 0)}
						Size={new UDim2(0, 0, 1, 0)}
					>
						<uiaspectratioconstraint
							AspectType={Enum.AspectType.ScaleWithParentSize}
							DominantAxis={Enum.DominantAxis.Height}
						/>
						<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
					</imagelabel>
					<textlabel
						AutomaticSize={Enum.AutomaticSize.X}
						BackgroundTransparency={1}
						Font={Enum.Font.Unknown}
						FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
						Position={new UDim2(0, 110, 0, 40)}
						Size={new UDim2(0, 0, 1, 0)}
						Text="The First Difficulty"
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextSize={14}
						TextWrapped={true}
					>
						<uistroke Thickness={2} />
						<uigradient
							Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.47800000000000004, Color3.fromRGB(225, 225, 225)), new ColorSequenceKeypoint(1, Color3.fromRGB(148, 148, 148))])}
							Rotation={90}
						/>
					</textlabel>
				</frame>
				<uilistlayout
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
			</frame>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 25)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
		</frame>
		<uiflexitem />
		<uigradient
			Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(72, 72, 72)), new ColorSequenceKeypoint(1, Color3.fromRGB(76, 76, 76))])}
			Rotation={90}
		/>
	</imagelabel>
</frame>