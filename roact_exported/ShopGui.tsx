import Roact from "@rbxts/roact";

<surfacegui
	Key="ShopGui"
	AlwaysOnTop={true}
	ClipsDescendants={true}
	MaxDistance={1000}
	SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
	ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
>
	<scrollingframe
		Key="ItemList"
		Active={true}
		AnchorPoint={new Vector2(0.5, 1)}
		AutomaticCanvasSize={Enum.AutomaticSize.Y}
		BackgroundTransparency={1}
		CanvasSize={new UDim2(0, 0, 0, 0)}
		Position={new UDim2(0.5, 0, 1, 0)}
		ScrollBarThickness={6}
		Selectable={false}
		Size={new UDim2(1, -5, 0.9, 0)}
	>
		<uigridlayout
			CellPadding={new UDim2(0, 12, 0, 12)}
			CellSize={new UDim2(0.167, -12, 0, 0)}
			SortOrder={Enum.SortOrder.LayoutOrder}
		>
			<uiaspectratioconstraint AspectRatio={1.5} AspectType={Enum.AspectType.ScaleWithParentSize} />
		</uigridlayout>
		<uipadding
			PaddingBottom={new UDim(0, 10)}
			PaddingLeft={new UDim(0, 10)}
			PaddingRight={new UDim(0, 10)}
			PaddingTop={new UDim(0, 10)}
		/>
		<uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={3} />
		<frame
			Key="BuyAll"
			BackgroundTransparency={1}
			LayoutOrder={99999}
			Size={new UDim2(0, 100, 0, 100)}
		>
			<textbutton
				Key="Button"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(85, 85, 255)}
				BorderColor3={Color3.fromRGB(27, 42, 53)}
				LayoutOrder={9999}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Selectable={false}
				Size={new UDim2(0.7000000000000001, 0, 0.6, 0)}
				Text={""}
			>
				<uistroke
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Color={Color3.fromRGB(54, 44, 194)}
					Thickness={3}
				>
					<uigradient
						Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.597, Color3.fromRGB(156, 156, 156)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
						Rotation={60}
					/>
				</uistroke>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 170, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))])}
					Rotation={270}
				/>
				<uipadding
					PaddingBottom={new UDim(0, 5)}
					PaddingLeft={new UDim(0, 5)}
					PaddingRight={new UDim(0, 5)}
					PaddingTop={new UDim(0, 5)}
				/>
				<uilistlayout
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0, 5)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<textlabel
					Key="HeadingLabel"
					BackgroundTransparency={1}
					Font={Enum.Font.Unknown}
					FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
					LayoutOrder={-5}
					Size={new UDim2(1, 0, 1, 0)}
					Text="Buy All Items"
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextSize={30}
					TextWrapped={true}
				>
					<uistroke Color={Color3.fromRGB(5, 16, 0)} Thickness={2} />
				</textlabel>
			</textbutton>
		</frame>
	</scrollingframe>
	<uipadding
		PaddingBottom={new UDim(0, 5)}
		PaddingLeft={new UDim(0, 5)}
		PaddingRight={new UDim(0, 5)}
		PaddingTop={new UDim(0, 5)}
	/>
	<frame
		Key="FilterOptions"
		BackgroundTransparency={1}
		LayoutOrder={-1}
		Size={new UDim2(1, 0, 0.1, -8)}
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
		</textbox>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			Padding={new UDim(0, 15)}
			SortOrder={Enum.SortOrder.LayoutOrder}
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
</surfacegui>