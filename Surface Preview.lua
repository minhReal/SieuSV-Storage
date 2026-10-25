--[[
      DESC: Try it if you want to see the surface(XYZ) of the object you want
       VER: 26.1
--]]
local button = script.Parent
 
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
 
local player = Players.LocalPlayer
local camera = workspace.CurrentCamera
 
local BTN_ON = Color3.fromRGB(180, 255, 180)
local BTN_OFF = Color3.fromRGB(255, 255, 255)
 
local AXIS_LENGTH = 4
local COLOR_X = Color3.fromRGB(255, 80, 80)
local COLOR_Y = Color3.fromRGB(80, 255, 80)
local COLOR_Z = Color3.fromRGB(80, 140, 255)
 
local CLICK_MOVE_THRESHOLD = 6
local CLICK_TIME_THRESHOLD = 0.3
 
local enabled = false
local highlight = nil
local axisLines = {}
local axisAnchors = {}
local billboards = {}
local labels = {}
local currentTarget = nil
 
local inputDownPos = nil
local inputDownTime = nil
local inputIsMouse = false
 
local function clearVisuals()
    if highlight then
        highlight:Destroy()
        highlight = nil
    end
    for _, part in ipairs(axisLines) do
        part:Destroy()
    end
    axisLines = {}
    for _, part in ipairs(axisAnchors) do
        part:Destroy()
    end
    axisAnchors = {}
    billboards = {}
    labels = {}
    currentTarget = nil
end
 
local function createAxisLine(color)
    local part = Instance.new("Part")
    part.Name = "AxisLine"
    part.Anchored = true
    part.CanCollide = false
    part.CanQuery = false
    part.CanTouch = false
    part.CastShadow = false
    part.Material = Enum.Material.Neon
    part.Color = color
    part.Size = Vector3.new(0.1, 0.1, AXIS_LENGTH)
    part.Parent = workspace
    return part
end
 
local axisNames = { "X", "Y", "Z" }
local axisColors = { COLOR_X, COLOR_Y, COLOR_Z }
 
local function createAxisLabel(color)
    local attachPart = Instance.new("Part")
    attachPart.Name = "AxisAnchor"
    attachPart.Anchored = true
    attachPart.CanCollide = false
    attachPart.CanQuery = false
    attachPart.CanTouch = false
    attachPart.Transparency = 1
    attachPart.Size = Vector3.new(0.1, 0.1, 0.1)
    attachPart.Parent = workspace
    table.insert(axisAnchors, attachPart)
    
    local gui = Instance.new("BillboardGui")
    gui.Name = "AxisBillboard"
    gui.Size = UDim2.fromOffset(60, 30)
    gui.AlwaysOnTop = true
    gui.Adornee = attachPart
    gui.Parent = attachPart
    
    local lbl = Instance.new("TextLabel")
    lbl.Size = UDim2.fromScale(1, 1)
    lbl.BackgroundTransparency = 1
    lbl.TextColor3 = color
    lbl.TextStrokeTransparency = 0
    lbl.Font = Enum.Font.GothamBold
    lbl.TextSize = 18
    lbl.Parent = gui
    
    table.insert(billboards, gui)
    table.insert(labels, lbl)
end
 
local function createVisuals(target)
    local hl = Instance.new("Highlight")
    hl.Name = "InspectHighlight"
    hl.FillTransparency = 1
    hl.OutlineColor = Color3.fromRGB(0, 170, 255)
    hl.OutlineTransparency = 0
    hl.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
    hl.Adornee = target
    hl.Parent = target
    highlight = hl
    
    axisLines = {
    createAxisLine(COLOR_X),
    createAxisLine(COLOR_Y),
    createAxisLine(COLOR_Z),
    }
    
    for i = 1, 3 do
        createAxisLabel(axisColors[i])
    end
end
 
local directions = {
Vector3.new(1, 0, 0),
Vector3.new(0, 1, 0),
Vector3.new(0, 0, 1),
}
 
local function getHalfExtentLocal(target, axisIndex)
    local size = target.Size
    if axisIndex == 1 then
        return size.X / 2
    elseif axisIndex == 2 then
        return size.Y / 2
    else
        return size.Z / 2
    end
end
 
local function updateVisuals(target)
    local cframe = target.CFrame
    local origin = cframe.Position
    local localDirections = {
    cframe.RightVector,
    cframe.UpVector,
    -cframe.LookVector,
    }
    
    for i, part in ipairs(axisLines) do
        local direction = localDirections[i]
        local halfExtent = getHalfExtentLocal(target, i)
        local start = origin + direction * halfExtent
        local tip = start + direction * AXIS_LENGTH
        part.CFrame = CFrame.new(start, tip) * CFrame.new(0, 0, -AXIS_LENGTH / 2)
        
        local anchor = axisAnchors[i]
        if anchor then
            anchor.CFrame = CFrame.new(tip)
        end
        
        local lbl = labels[i]
        if lbl then
            lbl.Text = axisNames[i]
        end
    end
end
 
local function selectTarget(target)
    clearVisuals()
    currentTarget = target
    createVisuals(target)
    updateVisuals(target)
end
 
local function getClickedPart()
    local mousePos = UserInputService:GetMouseLocation()
    local ray = camera:ViewportPointToRay(mousePos.X, mousePos.Y)
    
    local params = RaycastParams.new()
    params.FilterType = Enum.RaycastFilterType.Exclude
    params.FilterDescendantsInstances = { player.Character }
    
    local result = workspace:Raycast(ray.Origin, ray.Direction * 1000, params)
    if result and result.Instance then
        return result.Instance
    end
    return nil
end
 
local function handleClick()
    local part = getClickedPart()
    if not part then
        return
    end
    
    if currentTarget == part then
        clearVisuals()
    else
        selectTarget(part)
    end
end
 
local function onInputBegan(input, processed)
    if not enabled or processed then
        return
    end
    
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        inputIsMouse = true
        inputDownPos = Vector2.new(input.Position.X, input.Position.Y)
        inputDownTime = os.clock()
    elseif input.UserInputType == Enum.UserInputType.Touch then
        inputIsMouse = false
        inputDownPos = Vector2.new(input.Position.X, input.Position.Y)
        inputDownTime = os.clock()
    end
end
 
local function onInputEnded(input, processed)
    if not enabled or not inputDownPos then
        return
    end
    
    if input.UserInputType ~= Enum.UserInputType.MouseButton1
        and input.UserInputType ~= Enum.UserInputType.Touch then
        return
    end
    
    local upPos = Vector2.new(input.Position.X, input.Position.Y)
    local moved = (upPos - inputDownPos).Magnitude
    local elapsed = os.clock() - inputDownTime
    
    inputDownPos = nil
    inputDownTime = nil
    
    if processed then
        return
    end
    
    if moved <= CLICK_MOVE_THRESHOLD and elapsed <= CLICK_TIME_THRESHOLD then
        handleClick()
    end
end
 
local function setEnabled(state)
    enabled = state
    button.BackgroundColor3 = enabled and BTN_ON or BTN_OFF
    if not enabled then
        clearVisuals()
    end
end
 
button.MouseButton1Click:Connect(function()
    setEnabled(not enabled)
end)
 
UserInputService.InputBegan:Connect(onInputBegan)
UserInputService.InputEnded:Connect(onInputEnded)
 
RunService.RenderStepped:Connect(function()
    if currentTarget then
        if currentTarget.Parent then
            updateVisuals(currentTarget)
        else
            clearVisuals()
        end
    end
end)
 
setEnabled(false)
