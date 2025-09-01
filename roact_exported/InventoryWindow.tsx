import Roact from "@rbxts/roact";

<frame Key="Inventory" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
	<frame Key="Empty" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={false}>
		<textlabel
			Key="TitleLabel"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0.5)}
			AutomaticSize={Enum.AutomaticSize.XY}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
			Position={new UDim2(0.5, 0, 0.3, 0)}
			Text="You don't have any items!"
			TextColor3={Color3.fromRGB(206, 206, 206)}
			TextSize={30}
			TextWrapped={true}
		>
			<uistroke Thickness={2}>
				<uistroke Thickness={2} />
			</uistroke>
		</textlabel>
		<textlabel
			Key="Label"
			Active={true}
			AnchorPoint={new Vector2(0.5, 0.5)}
			AutomaticSize={Enum.AutomaticSize.XY}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0.34, 20)}
			Text="Buy some stuff in the shop to get started."
			TextColor3={Color3.fromRGB(129, 129, 129)}
			TextSize={25}
			TextWrapped={true}
		>
			<uistroke Thickness={2}>
				<uistroke Thickness={2} />
			</uistroke>
		</textlabel>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			SortOrder={Enum.SortOrder.LayoutOrder}
			VerticalAlignment={Enum.VerticalAlignment.Center}
		/>
	</frame>
	<frame Key="Page" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
		<scrollingframe
			Key="ItemList"
			AnchorPoint={new Vector2(0.5, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			LayoutOrder={1}
			Position={new UDim2(0.5, 0, 0, 0)}
			ScrollBarThickness={6}
			Selectable={false}
			Size={new UDim2(1, 0, 0.975, -20)}
		>
			<uipadding
				PaddingBottom={new UDim(0, 5)}
				PaddingLeft={new UDim(0, 10)}
				PaddingRight={new UDim(0, 10)}
				PaddingTop={new UDim(0, 5)}
			/>
			<uigridlayout
				CellPadding={new UDim2(0, 12, 0, 12)}
				CellSize={new UDim2(0, 65, 0, 65)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			>
				<uiaspectratioconstraint />
			</uigridlayout>
		</scrollingframe>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			Padding={new UDim(0, 8)}
			SortOrder={Enum.SortOrder.LayoutOrder}
		/>
		<frame
			Key="FilterOptions"
			BackgroundTransparency={1}
			LayoutOrder={-1}
			Size={new UDim2(1, 0, 0.025, 20)}
		>
			<textbox
				Key="Search"
				AnchorPoint={new Vector2(1, 0.5)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				BorderSizePixel={0}
				ClearTextOnFocus={false}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxasset://fonts/families/RobotoMono.json, Weight = Medium, Style = Normal }}
				LayoutOrder={2}
				PlaceholderText="Search..."
				Position={new UDim2(0, 0, 0, 5)}
				Size={new UDim2(0.4, 0, 1, 0)}
				Text={""}
				TextColor3={Color3.fromRGB(0, 0, 0)}
				TextScaled={true}
				TextSize={25}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
				ZIndex={100}
			>
				<uipadding
					PaddingBottom={new UDim(0, 5)}
					PaddingLeft={new UDim(0, 10)}
					PaddingRight={new UDim(0, 5)}
					PaddingTop={new UDim(0, 5)}
				/>
				<uiflexitem FlexMode={Enum.UIFlexMode.Shrink} ItemLineAlignment={Enum.ItemLineAlignment.End} />
				<imagebutton
					Key="Action"
					AnchorPoint={new Vector2(1, 0.5)}
					BackgroundTransparency={1}
					Image="rbxassetid://5492253050"
					ImageColor3={Color3.fromRGB(143, 143, 143)}
					ImageContent={Content}
					ImageTransparency={0.5}
					Position={new UDim2(1, 0, 0.5, 0)}
					ScaleType={Enum.ScaleType.Fit}
					Selectable={false}
					Size={new UDim2(1, 0, 0.7000000000000001, 0)}
					SizeConstraint={Enum.SizeConstraint.RelativeYY}
				/>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(255, 186, 125)}
					Thickness={2}
				/>
			</textbox>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 15)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<frame
				Key="TraitOptions"
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				LayoutOrder={2}
				Size={new UDim2(0, 0, 1, 0)}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, 6)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<imagebutton
					Key="Dropper"
					BackgroundTransparency={1}
					Image="rbxassetid://83949759663146"
					ImageColor3={Color3.fromRGB(255, 92, 92)}
					ImageContent={Content}
					ImageTransparency={0.6}
					LayoutOrder={1}
					ScaleType={Enum.ScaleType.Fit}
					Size={new UDim2(1, 0, 1, 0)}
				>
					<uipadding
						PaddingBottom={new UDim(0, 5)}
						PaddingLeft={new UDim(0, 5)}
						PaddingRight={new UDim(0, 5)}
						PaddingTop={new UDim(0, 5)}
					/>
					<uiaspectratioconstraint />
				</imagebutton>
				<imagebutton
					Key="Furnace"
					BackgroundTransparency={1}
					Image="rbxassetid://71820860315442"
					ImageColor3={Color3.fromRGB(255, 155, 74)}
					ImageContent={Content}
					ImageTransparency={0.6}
					LayoutOrder={2}
					ScaleType={Enum.ScaleType.Fit}
					Size={new UDim2(1, 0, 1, 0)}
				>
					<uipadding
						PaddingBottom={new UDim(0, 5)}
						PaddingLeft={new UDim(0, 5)}
						PaddingRight={new UDim(0, 5)}
						PaddingTop={new UDim(0, 5)}
					/>
					<uiaspectratioconstraint />
				</imagebutton>
				<imagebutton
					Key="Upgrader"
					BackgroundTransparency={1}
					Image="rbxassetid://139557708725255"
					ImageColor3={Color3.fromRGB(245, 255, 58)}
					ImageContent={Content}
					ImageTransparency={0.6}
					LayoutOrder={3}
					ScaleType={Enum.ScaleType.Fit}
					Size={new UDim2(1, 0, 1, 0)}
				>
					<uipadding
						PaddingBottom={new UDim(0, 5)}
						PaddingLeft={new UDim(0, 5)}
						PaddingRight={new UDim(0, 5)}
						PaddingTop={new UDim(0, 5)}
					/>
					<uiaspectratioconstraint />
				</imagebutton>
				<imagebutton
					Key="Conveyor"
					BackgroundTransparency={1}
					Image="rbxassetid://125924824081942"
					ImageColor3={Color3.fromRGB(131, 255, 78)}
					ImageContent={Content}
					ImageTransparency={0.6}
					LayoutOrder={4}
					ScaleType={Enum.ScaleType.Fit}
					Size={new UDim2(1, 0, 1, 0)}
				>
					<uipadding
						PaddingBottom={new UDim(0, 5)}
						PaddingLeft={new UDim(0, 5)}
						PaddingRight={new UDim(0, 5)}
						PaddingTop={new UDim(0, 5)}
					/>
					<uiaspectratioconstraint />
				</imagebutton>
				<imagebutton
					Key="Generator"
					BackgroundTransparency={1}
					Image="rbxassetid://120594818359262"
					ImageColor3={Color3.fromRGB(60, 171, 255)}
					ImageContent={Content}
					ImageTransparency={0.6}
					LayoutOrder={5}
					ScaleType={Enum.ScaleType.Fit}
					Size={new UDim2(1, 0, 1, 0)}
				>
					<uipadding
						PaddingBottom={new UDim(0, 5)}
						PaddingLeft={new UDim(0, 5)}
						PaddingRight={new UDim(0, 5)}
						PaddingTop={new UDim(0, 5)}
					/>
					<uiaspectratioconstraint />
				</imagebutton>
				<imagebutton
					Key="Charger"
					BackgroundTransparency={1}
					Image="rbxassetid://78469928600985"
					ImageColor3={Color3.fromRGB(255, 170, 255)}
					ImageContent={Content}
					ImageTransparency={0.6}
					LayoutOrder={6}
					ScaleType={Enum.ScaleType.Fit}
					Size={new UDim2(1, 0, 1, 0)}
				>
					<uipadding
						PaddingBottom={new UDim(0, 5)}
						PaddingLeft={new UDim(0, 5)}
						PaddingRight={new UDim(0, 5)}
						PaddingTop={new UDim(0, 5)}
					/>
					<uiaspectratioconstraint />
				</imagebutton>
				<imagebutton
					Key="Miscellaneous"
					BackgroundTransparency={1}
					Image="rbxassetid://83704048628923"
					ImageColor3={Color3.fromRGB(170, 85, 255)}
					ImageContent={Content}
					ImageTransparency={0.6}
					LayoutOrder={6}
					ScaleType={Enum.ScaleType.Fit}
					Size={new UDim2(1, 0, 1, 0)}
				>
					<uipadding
						PaddingBottom={new UDim(0, 5)}
						PaddingLeft={new UDim(0, 5)}
						PaddingRight={new UDim(0, 5)}
						PaddingTop={new UDim(0, 5)}
					/>
					<uiaspectratioconstraint />
				</imagebutton>
				<textbutton
					Key="Clear"
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					Font={Enum.Font.Unknown}
					FontFace={Font { Family = rbxassetid://12187368625, Weight = Regular, Style = Normal }}
					LayoutOrder={99}
					Size={new UDim2(0, 0, 0.5, 0)}
					Text="Clear"
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextTransparency={0.5}
					TextWrapped={true}
				/>
			</frame>
		</frame>
	</frame>
</frame>