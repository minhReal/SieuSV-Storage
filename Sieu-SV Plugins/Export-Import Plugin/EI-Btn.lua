local btn = script.Parent
local frame = btn:FindFirstAncestorOfClass("Folder"):WaitForChild("EI Plugins")

local function update()
	btn.BackgroundColor3 = frame.Visible and Color3.fromRGB(180, 255, 180) or Color3.new(1, 1, 1)
end

update()
frame:GetPropertyChangedSignal("Visible"):Connect(update)
btn.MouseButton1Click:Connect(function()
	frame.Visible = not frame.Visible
end)
