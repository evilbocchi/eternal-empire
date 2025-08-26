import Roact from "@rbxts/roact";

<frame
	Key="SidebarButtons"
	AnchorPoint={new Vector2(0, 0.5)}
	BackgroundTransparency={1}
	Position={new UDim2(0, 0, 0.5, 0)}
	Size={new UDim2(0.025, 40, 0.5, 0)}
>
	<uilistlayout
		HorizontalAlignment={Enum.HorizontalAlignment.Center}
		Padding={new UDim(0.012, 8)}
		SortOrder={Enum.SortOrder.LayoutOrder}
		VerticalAlignment={Enum.VerticalAlignment.Center}
	/>
	<frame
		Key="MiniButtons"
		BackgroundTransparency={1}
		LayoutOrder={99}
		Size={new UDim2(1, 4, 1, 0)}
		Visible={false}
	>
		<textbutton
			Key="Settings"
			BackgroundColor3={Color3.fromRGB(102, 102, 102)}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			LayoutOrder={8}
			Selectable={false}
			Size={new UDim2(0.4, 0, 0.4, 0)}
			Text={""}
		>
			<uiaspectratioconstraint />
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(77, 77, 77)} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
				Rotation={270}
			/>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://7059346373"
				ImageContent={Content}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.8, 0, 0.8, 0)}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(163, 173, 186))])}
					Rotation={90}
				/>
			</imagelabel>
		</textbutton>
		<textbutton
			Key="Stats"
			BackgroundColor3={Color3.fromRGB(102, 102, 102)}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			LayoutOrder={2}
			Selectable={false}
			Size={new UDim2(0.5, 0, 0.5, 0)}
			Text={""}
		>
			<uiaspectratioconstraint />
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(77, 77, 77)} />
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
				Rotation={270}
			/>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://8587689304"
				ImageColor3={Color3.fromRGB(170, 255, 255)}
				ImageContent={Content}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255))])}
					Rotation={90}
				/>
			</imagelabel>
		</textbutton>
		<uigridlayout
			CellPadding={new UDim2(0, 4, 0, 2)}
			CellSize={new UDim2(0.5, -2, 0.5, -2)}
			SortOrder={Enum.SortOrder.LayoutOrder}
		/>
		<uiaspectratioconstraint />
	</frame>
	<frame
		Key="Inventory"
		BackgroundTransparency={1}
		LayoutOrder={2}
		Size={new UDim2(1, 0, 1, -20)}
		SizeConstraint={Enum.SizeConstraint.RelativeXX}
	>
		<imagebutton
			Key="Button"
			AnchorPoint={new Vector2(1, 0.5)}
			AutoButtonColor={false}
			BackgroundTransparency={1}
			Image="rbxassetid://73182292780205"
			ImageContent={Content}
			LayoutOrder={1}
			Position={new UDim2(1, 0, 0.5, 0)}
			Selectable={false}
			Size={new UDim2(0, 0, 1, 0)}
		>
			<uiaspectratioconstraint AspectType={Enum.AspectType.ScaleWithParentSize} DominantAxis={Enum.DominantAxis.Height} />
		</imagebutton>
		<frame
			Key="Glow"
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 186, 125)}
			BorderSizePixel={0}
			Position={new UDim2(0, 0, 0.5, 0)}
			Size={new UDim2(0.25, 0, 0.25, 0)}
			SizeConstraint={Enum.SizeConstraint.RelativeYY}
			ZIndex={0}
		>
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
			<uicorner CornerRadius={new UDim(0.5, 0)} />
		</frame>
	</frame>
	<textbutton
		Key="Share"
		BackgroundColor3={Color3.fromRGB(102, 102, 102)}
		BorderColor3={Color3.fromRGB(27, 42, 53)}
		LayoutOrder={2}
		Selectable={false}
		Size={new UDim2(1, 0, 1, 0)}
		Text={""}
		Visible={false}
	>
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image="rbxassetid://17189032893"
			ImageColor3={Color3.fromRGB(170, 255, 255)}
			ImageContent={Content}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			ScaleType={Enum.ScaleType.Fit}
			Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255))])}
				Rotation={90}
			/>
		</imagelabel>
	</textbutton>
	<textbutton
		Key="Purchase"
		BackgroundColor3={Color3.fromRGB(102, 102, 102)}
		BorderColor3={Color3.fromRGB(27, 42, 53)}
		LayoutOrder={4}
		Selectable={false}
		Size={new UDim2(1, 0, 1, 0)}
		Text={""}
		Visible={false}
	>
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image="rbxassetid://17189032893"
			ImageColor3={Color3.fromRGB(255, 255, 0)}
			ImageContent={Content}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			ScaleType={Enum.ScaleType.Fit}
			Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 146, 146))])}
				Rotation={90}
			/>
		</imagelabel>
	</textbutton>
	<textbutton
		Key="Levels"
		BackgroundColor3={Color3.fromRGB(102, 102, 102)}
		BorderColor3={Color3.fromRGB(27, 42, 53)}
		LayoutOrder={3}
		Selectable={false}
		Size={new UDim2(1, 0, 1, 0)}
		Text={""}
		Visible={false}
	>
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image="rbxassetid://17189032893"
			ImageColor3={Color3.fromRGB(255, 97, 97)}
			ImageContent={Content}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			ScaleType={Enum.ScaleType.Fit}
			Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255))])}
				Rotation={90}
			/>
		</imagelabel>
	</textbutton>
	<textbutton
		Key="Commands"
		BackgroundColor3={Color3.fromRGB(102, 102, 102)}
		BorderColor3={Color3.fromRGB(27, 42, 53)}
		LayoutOrder={4}
		Selectable={false}
		Size={new UDim2(1, 0, 1, 0)}
		Text={""}
		Visible={false}
	>
		<imagelabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Image="rbxassetid://17189032893"
			ImageColor3={Color3.fromRGB(255, 255, 0)}
			ImageContent={Content}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			ScaleType={Enum.ScaleType.Fit}
			Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 146, 146))])}
				Rotation={90}
			/>
		</imagelabel>
	</textbutton>
	<frame
		Key="Quests"
		BackgroundTransparency={1}
		LayoutOrder={1}
		Size={new UDim2(1, 0, 1, -20)}
		SizeConstraint={Enum.SizeConstraint.RelativeXX}
	>
		<imagebutton
			Key="Button"
			AnchorPoint={new Vector2(1, 0.5)}
			AutoButtonColor={false}
			BackgroundTransparency={1}
			Image="rbxassetid://108122189782670"
			ImageContent={Content}
			LayoutOrder={1}
			Position={new UDim2(1, 0, 0.5, 0)}
			Selectable={false}
			Size={new UDim2(0, 0, 1, 0)}
		>
			<uiaspectratioconstraint AspectType={Enum.AspectType.ScaleWithParentSize} DominantAxis={Enum.DominantAxis.Height} />
		</imagebutton>
		<frame
			Key="NotificationWindow"
			AnchorPoint={new Vector2(1, 0.5)}
			AutomaticSize={Enum.AutomaticSize.XY}
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			BorderColor3={Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={2}
			LayoutOrder={2}
			Position={new UDim2(1, -3, 0, 3)}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 52, 52)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 11, 105))])}
				Rotation={90}
			/>
			<textlabel
				Key="AmountLabel"
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				Font={Enum.Font.Unknown}
				FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
				Size={new UDim2(0, 0, 0, 16)}
				Text="2"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={16}
				TextWrapped={true}
			/>
			<uipadding PaddingLeft={new UDim(0, 6)} PaddingRight={new UDim(0, 6)} />
			<uistroke Thickness={2} />
			<uicorner CornerRadius={new UDim(0.5, 0)} />
		</frame>
		<frame
			Key="Glow"
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundColor3={Color3.fromRGB(255, 94, 94)}
			BorderSizePixel={0}
			Position={new UDim2(0, 0, 0.5, 0)}
			Size={new UDim2(0.25, 0, 0.25, 0)}
			SizeConstraint={Enum.SizeConstraint.RelativeYY}
			ZIndex={0}
		>
			<uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
			<uicorner CornerRadius={new UDim(0.5, 0)} />
		</frame>
	</frame>
	<frame
		Key="Warp"
		BackgroundTransparency={1}
		LayoutOrder={2}
		Size={new UDim2(1, 0, 1, 0)}
		Visible={false}
	>
		<uiaspectratioconstraint />
		<textlabel
			Key="Label"
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Font={Enum.Font.Unknown}
			FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
			Position={new UDim2(0.5, 0, 1, 0)}
			Size={new UDim2(2, 0, 0.4, 0)}
			Text="Warp"
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextScaled={true}
			TextSize={14}
			TextWrapped={true}
			ZIndex={2}
		>
			<uistroke Thickness={2} />
		</textlabel>
		<imagebutton
			Key="Button"
			AnchorPoint={new Vector2(0.5, 0.5)}
			AutoButtonColor={false}
			BackgroundColor3={Color3.fromRGB(255, 170, 255)}
			BorderColor3={Color3.fromRGB(27, 42, 53)}
			BorderSizePixel={3}
			ClipsDescendants={true}
			Image="rbxassetid://116744052956443"
			ImageContent={Content}
			LayoutOrder={4}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			Selectable={false}
			Size={new UDim2(1, 0, 1, 0)}
		>
			<uigradient
				Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255))])}
				Rotation={90}
			/>
			<imagelabel
				Key="Shadow"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://8674050345"
				ImageColor3={Color3.fromRGB(0, 0, 0)}
				ImageContent={Content}
				Position={new UDim2(0.5, 2, 0.5, -2)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
			/>
			<imagelabel
				Key="Shadow"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://8674050345"
				ImageColor3={Color3.fromRGB(0, 0, 0)}
				ImageContent={Content}
				Position={new UDim2(0.5, -2, 0.5, -2)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
			/>
			<imagelabel
				Key="Shadow"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://8674050345"
				ImageColor3={Color3.fromRGB(0, 0, 0)}
				ImageContent={Content}
				Position={new UDim2(0.5, 2, 0.5, 2)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
			/>
			<imagelabel
				Key="Shadow"
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://8674050345"
				ImageColor3={Color3.fromRGB(0, 0, 0)}
				ImageContent={Content}
				Position={new UDim2(0.5, -2, 0.5, 2)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
			/>
			<imagelabel
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
				Image="rbxassetid://8674050345"
				ImageColor3={Color3.fromRGB(255, 170, 255)}
				ImageContent={Content}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				ScaleType={Enum.ScaleType.Fit}
				Size={new UDim2(0.7000000000000001, 0, 0.7000000000000001, 0)}
				ZIndex={2}
			>
				<uigradient
					Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255))])}
					Rotation={90}
				/>
			</imagelabel>
		</imagebutton>
	</frame>
	<imagebutton
		Key="Purchase"
		AnchorPoint={new Vector2(1, 0.5)}
		AutoButtonColor={false}
		BackgroundTransparency={1}
		Image="rbxassetid://109297297778058"
		ImageContent={Content}
		LayoutOrder={1}
		Position={new UDim2(1, 0, 0.5, 0)}
		Selectable={false}
		Size={new UDim2(0, 55, 0, 55)}
		Visible={false}
	/>
	<imagebutton
		Key="Settings"
		AnchorPoint={new Vector2(1, 0.5)}
		AutoButtonColor={false}
		BackgroundTransparency={1}
		Image="rbxassetid://18801194936"
		ImageContent={Content}
		LayoutOrder={1}
		Position={new UDim2(1, 0, 0.5, 0)}
		Selectable={false}
		Size={new UDim2(0, 55, 0, 55)}
		Visible={false}
	/>
</frame>