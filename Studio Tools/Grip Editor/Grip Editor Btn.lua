-- u can use this script template
local button = script.Parent
 
local plugins = button:FindFirstAncestorOfClass("Folder")
local targetGui = plugins:WaitForChild("Grip Editor") -- GUI name in the Plugins folder
 
button.MouseButton1Click:Connect(function()
    targetGui.Visible = not targetGui.Visible
end)

