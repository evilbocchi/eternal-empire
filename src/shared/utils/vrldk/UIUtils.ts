export function setColor(object: Instance, color: Color3, deepColor?: boolean) {
	if (object.FindFirstChild("ColorIndependent")) {
		return;
	}
	if (object.IsA("UIStroke")) {
		object.Color = color;
	}
	else if (object.IsA("GuiObject")) {
		object.BackgroundColor3 = color;
	}
	if (deepColor) {
		if (object.IsA("TextLabel")) {
			object.TextColor3 = color;
		}
	}
}

export function paintObjects(objectsDirectory: Instance, color: Color3, deepPaint?: boolean) {
	setColor(objectsDirectory, color, deepPaint);
	for (const v of objectsDirectory.GetDescendants()) {
		setColor(v, color, deepPaint);
	}
}
