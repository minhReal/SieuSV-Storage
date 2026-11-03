local UserInputService = game:GetService("UserInputService")

local folder = script.Parent

-- List of target frame names that should be draggable like " ["MyPlugin"] = true, "
local TARGET_FRAME_NAMES = {
["Welds"] = true,
["Grip Editor"] = true,
["E/I Plugins"] = true,
}
 
 
 
local function makeDraggable(frame)
    if not (frame and frame:IsA("GuiObject")) then
        return
    end
    
    frame.Active = true
    
    local dragging = false
    local dragStart = Vector2.zero
    local startPos = frame.Position
    local dragInput = nil
    
    local function update(input)
        local delta = input.Position - dragStart
        frame.Position = UDim2.new(
        startPos.X.Scale, startPos.X.Offset + delta.X,
        startPos.Y.Scale, startPos.Y.Offset + delta.Y
        )
    end
    
    frame.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1
            or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = frame.Position
            dragInput = input
            
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    dragging = false
                end
            end)
        end
    end)
    
    frame.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement
            or input.UserInputType == Enum.UserInputType.Touch then
            dragInput = input
        end
    end)
    
    UserInputService.InputChanged:Connect(function(input)
        if dragging and input == dragInput then
            update(input)
        end
    end)
end
 
local function init()
    if not folder then return end
    
    for _, child in ipairs(folder:GetChildren()) do
        if TARGET_FRAME_NAMES[child.Name] and child:IsA("GuiObject") then
            makeDraggable(child)
        end
    end
    
    folder.ChildAdded:Connect(function(child)
        if TARGET_FRAME_NAMES[child.Name] and child:IsA("GuiObject") then
            makeDraggable(child)
        end
    end)
end

init()
 
