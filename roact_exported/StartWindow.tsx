
<scrollingframe
    Key="AboutWindow"
    AnchorPoint={new Vector2(0, 0.5)}
    AutomaticCanvasSize={Enum.AutomaticSize.Y}
    BackgroundColor3={Color3.fromRGB(0, 0, 0)}
    BackgroundTransparency={0.6}
    BorderSizePixel={0}
    CanvasSize={new UDim2(0, 0, 0, 0)}
    Position={new UDim2(0, 0, 0.5, 0)}
    Size={new UDim2(1, 0, 1, -10)}
    Visible={false}
    ZIndex={-5}
>
    <uilistlayout
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        ItemLineAlignment={Enum.ItemLineAlignment.Center}
        Padding={new UDim(0, 50)}
        SortOrder={Enum.SortOrder.LayoutOrder}
    />
    <imagelabel
        Key="Logo"
        AnchorPoint={new Vector2(0.5, 0)}
        BackgroundTransparency={1}
        Image="rbxassetid://16312320386"
        ImageContent={Content}
        LayoutOrder={-1}
        Position={new UDim2(0.15, 0, 0, 0)}
        ScaleType={Enum.ScaleType.Fit}
        Size={new UDim2(0.25, 0, 0.25, 0)}
        SizeConstraint={Enum.SizeConstraint.RelativeXX}
        TileSize={new UDim2(0, 200, 0, 200)}
    />
    <textlabel
        Key="DescriptionLabel"
        Active={true}
        AutomaticSize={Enum.AutomaticSize.Y}
        BackgroundTransparency={1}
        Font={Enum.Font.Unknown}
        FontFace={Font { Family = rbxassetid://12187368625, Weight = Medium, Style = Normal }}
        Position={new UDim2(0.05, 0, 0, 5)}
        Size={new UDim2(0.65, 0, 0, 0)}
        Text="JJT Money Empire is an incremental-style tycoon building game designed off the JToH Joke Towers Difficulty Chart. Containing various MMO, RPG and Clicker aspects, how will you rise to the top of this capitalistic world?"
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextSize={30}
        TextWrapped={true}
    >
        <uistroke Thickness={2.5} />
        <uipadding PaddingTop={new UDim(0, -50)} />
    </textlabel>
    <frame
        Key="Primary"
        Active={true}
        BackgroundTransparency={1}
        LayoutOrder={10}
        Size={new UDim2(0.7000000000000001, 0, 0, 75)}
    >
        <uilistlayout
            FillDirection={Enum.FillDirection.Horizontal}
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            ItemLineAlignment={Enum.ItemLineAlignment.Center}
            SortOrder={Enum.SortOrder.LayoutOrder}
        />
        <frame Key="Creator" BackgroundTransparency={1} Size={new UDim2(0.5, 0, 1, 0)}>
            <textlabel
                Key="TitleLabel"
                Active={true}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
                LayoutOrder={2}
                Size={new UDim2(1, 0, 0.35000000000000003, 0)}
                Text="Creator & Developer of JJT Money Empire"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={50}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
            </textlabel>
            <textlabel
                Key="RecipientLabel"
                Active={true}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
                Size={new UDim2(1, 0, 0.645, 0)}
                Text="migeru_tan"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={50}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
                <uigradient
                    Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(234, 199, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 170, 255))])}
                    Rotation={90}
                />
            </textlabel>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                ItemLineAlignment={Enum.ItemLineAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
        </frame>
    </frame>
    <frame
        Key="Separator"
        BackgroundColor3={Color3.fromRGB(0, 0, 0)}
        BackgroundTransparency={0.8}
        BorderSizePixel={0}
        LayoutOrder={3}
        Size={new UDim2(0.5, 0, 0, 2)}
    />
    <textlabel
        Key="CreditsLabel"
        Active={true}
        AutomaticSize={Enum.AutomaticSize.Y}
        BackgroundTransparency={1}
        Font={Enum.Font.Unknown}
        FontFace={Font { Family = rbxassetid://12187368625, Weight = ExtraBold, Style = Normal }}
        LayoutOrder={4}
        Position={new UDim2(0.3, 0, 0.051000000000000004, 5)}
        Size={new UDim2(0.65, 0, 0, 0)}
        Text="Credits"
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextSize={60}
        TextWrapped={true}
    >
        <uistroke Thickness={2.5} />
    </textlabel>
    <frame
        Key="Secondary"
        Active={true}
        BackgroundTransparency={1}
        LayoutOrder={11}
        Size={new UDim2(0.7000000000000001, 0, 0, 75)}
    >
        <uilistlayout
            FillDirection={Enum.FillDirection.Horizontal}
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            ItemLineAlignment={Enum.ItemLineAlignment.Center}
            SortOrder={Enum.SortOrder.LayoutOrder}
        />
        <frame Key="CoOwner" BackgroundTransparency={1} Size={new UDim2(0.5, 0, 1, 0)}>
            <textlabel
                Key="TitleLabel"
                Active={true}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
                LayoutOrder={2}
                Size={new UDim2(1, 0, 0.35000000000000003, 0)}
                Text="Co-Owner"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={50}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
            </textlabel>
            <textlabel
                Key="RecipientLabel"
                Active={true}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
                Size={new UDim2(1, 0, 0.645, 0)}
                Text="fxutin"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={50}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
                <uigradient
                    Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(75, 198, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(0, 170, 255))])}
                    Rotation={90}
                />
            </textlabel>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                ItemLineAlignment={Enum.ItemLineAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
        </frame>
        <frame
            Key="MusicComposer"
            BackgroundTransparency={1}
            Size={new UDim2(0.5, 0, 1, 0)}
        >
            <textlabel
                Key="TitleLabel"
                Active={true}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
                LayoutOrder={2}
                Size={new UDim2(1, 0, 0.35000000000000003, 0)}
                Text="Music Composer"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={50}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
            </textlabel>
            <textlabel
                Key="RecipientLabel"
                Active={true}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
                Size={new UDim2(1, 0, 0.645, 0)}
                Text="raika"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={50}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
                <uigradient
                    Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 170, 127)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 141, 42))])}
                    Rotation={90}
                />
            </textlabel>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                ItemLineAlignment={Enum.ItemLineAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
        </frame>
    </frame>
    <frame
        Key="Testers"
        Active={true}
        BackgroundTransparency={1}
        LayoutOrder={12}
        Size={new UDim2(0.7000000000000001, 0, 0, 55)}
    >
        <textlabel
            Key="RecipientLabel"
            Active={true}
            BackgroundTransparency={1}
            Font={Enum.Font.Unknown}
            FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
            Size={new UDim2(1, 0, 0.645, 0)}
            Text="CREATIVITEEE, KillerFish_SD, Bernario, simple13579"
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={50}
            TextWrapped={true}
        >
            <uistroke Thickness={2.5} />
            <uigradient
                Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 248, 147)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 0))])}
                Rotation={90}
            />
        </textlabel>
        <textlabel
            Key="TitleLabel"
            Active={true}
            BackgroundTransparency={1}
            Font={Enum.Font.Unknown}
            FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
            LayoutOrder={2}
            Size={new UDim2(1, 0, 0.35000000000000003, 0)}
            Text="Testers"
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={50}
            TextWrapped={true}
        >
            <uistroke Thickness={2.5} />
        </textlabel>
        <uilistlayout
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            ItemLineAlignment={Enum.ItemLineAlignment.Center}
            SortOrder={Enum.SortOrder.LayoutOrder}
        />
    </frame>
    <frame
        Key="Contributors"
        Active={true}
        BackgroundTransparency={1}
        LayoutOrder={14}
        Size={new UDim2(0.7000000000000001, 0, 0, 55)}
    >
        <textlabel
            Key="RecipientLabel"
            Active={true}
            BackgroundTransparency={1}
            Font={Enum.Font.Unknown}
            FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
            Size={new UDim2(1, 0, 0.645, 0)}
            Text="Contributors"
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={50}
            TextWrapped={true}
        >
            <uistroke Thickness={2.5} />
            <uigradient
                Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 116, 169)), new ColorSequenceKeypoint(1, Color3.fromRGB(255, 39, 136))])}
                Rotation={90}
            />
        </textlabel>
        <textlabel
            Key="TitleLabel"
            Active={true}
            BackgroundTransparency={1}
            Font={Enum.Font.Unknown}
            FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
            LayoutOrder={2}
            Size={new UDim2(1, 0, 0.35000000000000003, 0)}
            Text="Contributors"
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={50}
            TextWrapped={true}
        >
            <uistroke Thickness={2.5} />
        </textlabel>
        <uilistlayout
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            ItemLineAlignment={Enum.ItemLineAlignment.Center}
            SortOrder={Enum.SortOrder.LayoutOrder}
        />
    </frame>
    <uipadding PaddingBottom={new UDim(0, 50)} />
    <textlabel
        Key="Label"
        Active={true}
        AutomaticSize={Enum.AutomaticSize.Y}
        BackgroundTransparency={1}
        Font={Enum.Font.Unknown}
        FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
        LayoutOrder={20}
        Position={new UDim2(0.3, 0, 0.051000000000000004, 5)}
        Size={new UDim2(0.65, 0, 0, 0)}
        Text="To each and every supporter, my warmest thanks!"
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextSize={40}
        TextWrapped={true}
    >
        <uistroke Thickness={2.5} />
    </textlabel>
    <textlabel
        Key="Label"
        Active={true}
        AutomaticSize={Enum.AutomaticSize.Y}
        BackgroundTransparency={1}
        Font={Enum.Font.Unknown}
        FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
        LayoutOrder={21}
        Position={new UDim2(0.3, 0, 0.051000000000000004, 5)}
        Size={new UDim2(0.65, 0, 0, 0)}
        Text="That includes you. <3"
        TextColor3={Color3.fromRGB(162, 162, 162)}
        TextSize={30}
        TextWrapped={true}
    >
        <uistroke Thickness={2.5} />
    </textlabel>
    <uistroke Thickness={3} Transparency={0.4} />
    <imagebutton
        Key="CloseButton"
        BackgroundTransparency={1}
        Image="rbxassetid://14569017448"
        ImageContent={Content}
        LayoutOrder={-5}
        ScaleType={Enum.ScaleType.Fit}
        Size={new UDim2(1, 0, 0, 35)}
    />
</scrollingframe>
<frame
    Key="MainOptions"
    BackgroundTransparency={1}
    Position={new UDim2(0, 0, 0.4, 0)}
    Selectable={true}
    SelectionGroup={true}
    Size={new UDim2(1, 0, 0.55, 0)}
>
    <frame
        Key="Play"
        Active={true}
        BackgroundTransparency={1}
        LayoutOrder={-2}
        Position={new UDim2(0, 0, 0.4, 0)}
        Size={new UDim2(1, 0, 0, 70)}
    >
        <imagebutton
            Key="Button"
            AnchorPoint={new Vector2(0, 1)}
            AutoButtonColor={false}
            BackgroundTransparency={1}
            Image="rbxassetid://84050131584659"
            ImageContent={Content}
            LayoutOrder={1}
            Position={new UDim2(0, -106, 1, -10)}
            Size={new UDim2(0.1, 400, 0.6, -10)}
            ZIndex={0}
        >
            <uigradient
                Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(85, 255, 127)), new ColorSequenceKeypoint(1, Color3.fromRGB(5, 170, 60))])}
                Rotation={90}
            />
            <imagelabel
                Key="ImageButton"
                BackgroundTransparency={1}
                Image="rbxassetid://124172656237043"
                ImageColor3={Color3.fromRGB(85, 255, 127)}
                ImageContent={Content}
                ImageTransparency={0.9}
                Interactable={false}
                Selectable={true}
                Size={new UDim2(1, 0, 1, 0)}
                TileSize={new UDim2(0, 50, 0, 50)}
            />
        </imagebutton>
        <imagelabel
            Active={true}
            AnchorPoint={new Vector2(0, 1)}
            BackgroundTransparency={1}
            Image="rbxassetid://84050131584659"
            ImageColor3={Color3.fromRGB(0, 0, 0)}
            ImageContent={Content}
            ImageTransparency={0.4}
            Position={new UDim2(0, -100, 1, -7)}
            Size={new UDim2(0.1, 400, 0.6, -10)}
            ZIndex={-5}
        />
        <textlabel
            Key="Label"
            Active={true}
            AutomaticSize={Enum.AutomaticSize.X}
            BackgroundTransparency={1}
            Font={Enum.Font.Unknown}
            FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
            Position={new UDim2(0.05, 0, 0, 5)}
            Size={new UDim2(0, 0, 0.8, -10)}
            Text="Play"
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={60}
            TextWrapped={true}
            TextXAlignment={Enum.TextXAlignment.Left}
        >
            <uistroke Thickness={3} />
        </textlabel>
        <uiflexitem ItemLineAlignment={Enum.ItemLineAlignment.Start} />
    </frame>
    <frame
        Key="Settings"
        Active={true}
        BackgroundTransparency={1}
        Position={new UDim2(0, 0, 0.4, 90)}
        Size={new UDim2(1, 0, 0, 60)}
    >
        <imagebutton
            Key="Button"
            AnchorPoint={new Vector2(0, 1)}
            AutoButtonColor={false}
            BackgroundTransparency={1}
            Image="rbxassetid://84050131584659"
            ImageContent={Content}
            LayoutOrder={1}
            Position={new UDim2(0, -106, 1, -10)}
            Size={new UDim2(0.1, 350, 0.6, -10)}
            ZIndex={0}
        >
            <uigradient
                Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(172, 172, 172)), new ColorSequenceKeypoint(1, Color3.fromRGB(102, 102, 102))])}
                Rotation={90}
            />
            <imagelabel
                Key="ImageButton"
                BackgroundTransparency={1}
                Image="rbxassetid://124172656237043"
                ImageContent={Content}
                ImageTransparency={0.9}
                Interactable={false}
                Selectable={true}
                Size={new UDim2(1, 0, 1, 0)}
                TileSize={new UDim2(0, 50, 0, 50)}
            />
        </imagebutton>
        <textlabel
            Key="Label"
            Active={true}
            AutomaticSize={Enum.AutomaticSize.X}
            BackgroundTransparency={1}
            Font={Enum.Font.Unknown}
            FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
            Position={new UDim2(0.05, 0, 0, 5)}
            Size={new UDim2(0, 0, 0.8, -10)}
            Text="Settings"
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={60}
            TextWrapped={true}
            TextXAlignment={Enum.TextXAlignment.Left}
        >
            <uistroke Thickness={3} />
        </textlabel>
        <uiflexitem ItemLineAlignment={Enum.ItemLineAlignment.Start} />
        <imagelabel
            Active={true}
            AnchorPoint={new Vector2(0, 1)}
            BackgroundTransparency={1}
            Image="rbxassetid://84050131584659"
            ImageColor3={Color3.fromRGB(0, 0, 0)}
            ImageContent={Content}
            ImageTransparency={0.4}
            Position={new UDim2(0, -100, 1, -7)}
            Size={new UDim2(0.1, 350, 0.6, -10)}
            ZIndex={-5}
        />
    </frame>
    <uilistlayout
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        ItemLineAlignment={Enum.ItemLineAlignment.Start}
        SortOrder={Enum.SortOrder.LayoutOrder}
        VerticalAlignment={Enum.VerticalAlignment.Center}
        VerticalFlex={Enum.UIFlexAlignment.Fill}
    />
    <frame
        Key="About"
        Active={true}
        BackgroundTransparency={1}
        LayoutOrder={1}
        Position={new UDim2(0, 0, 0.4, 90)}
        Size={new UDim2(1, 0, 0, 60)}
    >
        <imagebutton
            Key="Button"
            AnchorPoint={new Vector2(0, 1)}
            AutoButtonColor={false}
            BackgroundTransparency={1}
            Image="rbxassetid://84050131584659"
            ImageContent={Content}
            LayoutOrder={1}
            Position={new UDim2(0, -106, 1, -10)}
            Size={new UDim2(0.1, 350, 0.6, -10)}
            ZIndex={0}
        >
            <uigradient
                Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(34, 189, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(8, 127, 255))])}
                Rotation={90}
            />
            <imagelabel
                Key="ImageButton"
                BackgroundTransparency={1}
                Image="rbxassetid://124172656237043"
                ImageContent={Content}
                ImageTransparency={0.9}
                Interactable={false}
                Selectable={true}
                Size={new UDim2(1, 0, 1, 0)}
                TileSize={new UDim2(0, 50, 0, 50)}
            />
        </imagebutton>
        <imagelabel
            Active={true}
            AnchorPoint={new Vector2(0, 1)}
            BackgroundTransparency={1}
            Image="rbxassetid://84050131584659"
            ImageColor3={Color3.fromRGB(0, 0, 0)}
            ImageContent={Content}
            ImageTransparency={0.4}
            Position={new UDim2(0, -100, 1, -7)}
            Size={new UDim2(0.1, 350, 0.6, -10)}
            ZIndex={-5}
        />
        <textlabel
            Key="Label"
            Active={true}
            AutomaticSize={Enum.AutomaticSize.X}
            BackgroundTransparency={1}
            Font={Enum.Font.Unknown}
            FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
            Position={new UDim2(0.05, 0, 0, 5)}
            Size={new UDim2(0, 0, 0.8, -10)}
            Text="About"
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={60}
            TextWrapped={true}
            TextXAlignment={Enum.TextXAlignment.Left}
        >
            <uistroke Thickness={3} />
        </textlabel>
        <uiflexitem ItemLineAlignment={Enum.ItemLineAlignment.Start} />
    </frame>
    <frame BackgroundTransparency={1} LayoutOrder={-1} Size={new UDim2(0, 0, 0, 35)}>
        <uiflexitem FlexMode={Enum.UIFlexMode.Shrink} ItemLineAlignment={Enum.ItemLineAlignment.Start} />
    </frame>
</frame>
<imagelabel
    Key="EmpiresWindow"
    Active={true}
    AnchorPoint={new Vector2(0.5, 0.5)}
    BackgroundColor3={Color3.fromRGB(102, 102, 102)}
    BorderColor3={Color3.fromRGB(27, 42, 53)}
    Image="rbxassetid://99396777318092"
    ImageContent={Content}
    ImageTransparency={0.9500000000000001}
    Position={new UDim2(0.5, 0, 0.65, 0)}
    Size={new UDim2(0.425, 200, 0.6, 0)}
    Visible={false}
    ZIndex={2}
>
    <uigradient
        Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)), new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89))])}
        Rotation={270}
    />
    <uicorner CornerRadius={new UDim(0, 4)} />
    <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(77, 77, 77)} />
    <textlabel
        Key="TitleLabel"
        Active={true}
        AnchorPoint={new Vector2(0, 0.5)}
        AutomaticSize={Enum.AutomaticSize.X}
        BackgroundTransparency={1}
        Font={Enum.Font.Unknown}
        FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
        Position={new UDim2(0, 30, 0, 0)}
        Rotation={2}
        Size={new UDim2(0, 0, 0.04, 30)}
        Text="Join an Empire"
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextScaled={true}
        TextSize={14}
        TextWrapped={true}
    >
        <uistroke Thickness={2} />
    </textlabel>
    <scrollingframe
        Key="EmpireOptions"
        AnchorPoint={new Vector2(0.5, 0)}
        AutomaticCanvasSize={Enum.AutomaticSize.Y}
        BackgroundTransparency={1}
        Position={new UDim2(0.5, 0, 0.1, 0)}
        ScrollBarThickness={6}
        Selectable={false}
        Size={new UDim2(1, -10, 0.6, 0)}
    >
        <uilistlayout Padding={new UDim(0, 10)} SortOrder={Enum.SortOrder.LayoutOrder} />
        <uipadding
            PaddingLeft={new UDim(0, 10)}
            PaddingRight={new UDim(0, 10)}
            PaddingTop={new UDim(0, 5)}
        />
    </scrollingframe>
    <frame
        Key="PublicEmpireWindow"
        Active={true}
        BackgroundTransparency={1}
        Position={new UDim2(0, 10, 0.8, 0)}
        Size={new UDim2(1, -20, 0.2, -10)}
    >
        <textbutton
            Key="JoinPublicEmpire"
            BackgroundColor3={Color3.fromRGB(0, 170, 0)}
            BackgroundTransparency={0.5}
            BorderSizePixel={0}
            LayoutOrder={1}
            Position={new UDim2(0.5, 0, 0.8, 0)}
            Selectable={false}
            Size={new UDim2(0.4, 0, 0.6, 0)}
            Text={""}
        >
            <uigradient
                Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(1, Color3.fromRGB(156, 156, 156))])}
                Rotation={90}
            />
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(0, 170, 0)} />
            <uicorner CornerRadius={new UDim(0, 4)} />
            <textlabel
                Key="Label"
                Active={true}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.8, 0, 0.8, 0)}
                Text="Join Public Empire"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke />
            </textlabel>
        </textbutton>
        <uilistlayout
            FillDirection={Enum.FillDirection.Horizontal}
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            Padding={new UDim(0, 10)}
            SortOrder={Enum.SortOrder.LayoutOrder}
            VerticalAlignment={Enum.VerticalAlignment.Center}
        />
        <frame Key="Label" BackgroundTransparency={1} Size={new UDim2(0.4, 0, 0.9, 0)}>
            <textlabel
                Key="Label"
                Active={true}
                AnchorPoint={new Vector2(0, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
                Position={new UDim2(0, 30, 0.875, 0)}
                Size={new UDim2(0, 0, 0.5, 0)}
                Text="Join this server's empire!"
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
            <textlabel
                Key="Label"
                Active={true}
                AnchorPoint={new Vector2(0, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={Font { Family = rbxassetid://12187368625, Weight = Bold, Style = Normal }}
                LayoutOrder={1}
                Position={new UDim2(0, 30, 0.875, 0)}
                Size={new UDim2(0, 0, 0.5, 0)}
                Text="(Your data does not save upon leaving with this option)"
                TextColor3={Color3.fromRGB(198, 198, 198)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>
        </frame>
    </frame>
    <imagelabel
        BackgroundTransparency={1}
        Image="rbxassetid://6372755229"
        ImageColor3={Color3.fromRGB(0, 0, 0)}
        ImageContent={Content}
        ImageTransparency={0.8}
        Rotation={180}
        ScaleType={Enum.ScaleType.Tile}
        Size={new UDim2(1, 2, 1, 2)}
        TileSize={new UDim2(0, 200, 0, 200)}
        ZIndex={-5}
    />
    <textbutton
        Key="CloseButton"
        AnchorPoint={new Vector2(0.5, 0.5)}
        BackgroundColor3={Color3.fromRGB(255, 76, 76)}
        BorderSizePixel={0}
        Font={Enum.Font.Unknown}
        FontFace={Font { Family = rbxasset://fonts/families/Inconsolata.json, Weight = Bold, Style = Normal }}
        Position={new UDim2(1, -5, 0, 5)}
        Rotation={45}
        Size={new UDim2(0, 30, 0.075, 25)}
        Text={""}
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextScaled={true}
        TextSize={14}
        TextStrokeTransparency={0}
        TextWrapped={true}
        ZIndex={104}
    >
        <textlabel
            Key="Label"
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Font={Enum.Font.Unknown}
            FontFace={Font { Family = rbxassetid://12187368625, Weight = Heavy, Style = Normal }}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Rotation={-45}
            Size={new UDim2(1, 0, 1, 0)}
            Text="×"
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={14}
            TextStrokeColor3={Color3.fromRGB(118, 118, 118)}
            TextStrokeTransparency={0}
            TextWrapped={true}
            ZIndex={70}
        >
            <uistroke Color={Color3.fromRGB(255, 76, 76)} Thickness={1.2}>
                <uigradient
                    Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(102, 102, 102)), new ColorSequenceKeypoint(1, Color3.fromRGB(102, 102, 102))])}
                />
            </uistroke>
        </textlabel>
        <uiaspectratioconstraint />
        <uistroke
            ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
            Color={Color3.fromRGB(255, 76, 76)}
            Thickness={2}
        >
            <uigradient
                Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 170, 170)), new ColorSequenceKeypoint(0.5, Color3.fromRGB(171, 171, 171)), new ColorSequenceKeypoint(1, Color3.fromRGB(68, 68, 68))])}
                Rotation={90}
            />
        </uistroke>
        <uigradient
            Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.669, Color3.fromRGB(206, 206, 206)), new ColorSequenceKeypoint(1, Color3.fromRGB(173, 0, 0))])}
            Rotation={45}
        />
        <uicorner CornerRadius={new UDim(0.3, 0)} />
    </textbutton>
</imagelabel>
<imagelabel
    Key="LeftBackground"
    AnchorPoint={new Vector2(0.5, 0.5)}
    BackgroundColor3={Color3.fromRGB(255, 255, 255)}
    BorderSizePixel={0}
    Image="rbxassetid://99396777318092"
    ImageContent={Content}
    ImageTransparency={0.7000000000000001}
    Interactable={false}
    Position={new UDim2(0, 0, 0.5, 0)}
    Rotation={5}
    ScaleType={Enum.ScaleType.Tile}
    Size={new UDim2(0.3, 0, 2, 0)}
    TileSize={new UDim2(0, 800, 0, 800)}
    ZIndex={0}
>
    <uigradient
        Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(248, 54, 0)), new ColorSequenceKeypoint(1, Color3.fromRGB(254, 140, 0))])}
        Rotation={-97}
    />
    <imagelabel
        BackgroundTransparency={1}
        Image="rbxassetid://6372755229"
        ImageColor3={Color3.fromRGB(0, 0, 0)}
        ImageContent={Content}
        ImageTransparency={0.8}
        Interactable={false}
        Rotation={180}
        ScaleType={Enum.ScaleType.Tile}
        Size={new UDim2(1, 2, 1, 2)}
        TileSize={new UDim2(0, 200, 0, 200)}
    />
</imagelabel>
<imagelabel
    Key="Logo"
    AnchorPoint={new Vector2(0.5, 0)}
    BackgroundTransparency={1}
    Image="rbxassetid://16312320386"
    ImageContent={Content}
    Interactable={false}
    Position={new UDim2(0.15, 0, 0, 0)}
    ScaleType={Enum.ScaleType.Fit}
    Size={new UDim2(0.3, 0, 0.4, 0)}
    TileSize={new UDim2(0, 200, 0, 200)}
/>