--[[ 
     DESC: Enable to select Parts. Selected Parts are highlighted and numbered. Disable to create local welds while preserving their positions.
     VER: 26.1
     
     How to use this:
       1. You need to click on the parts you want to weld
       2. Disable plugins then done!

      Because there are many bugs that need to be fixed, such as "non-working" instances
--]]
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
 
local BTN_ON = Color3.fromRGB(180, 255, 180)
local BTN_OFF = Color3.fromRGB(255, 255, 255)
local SELECT_COLOR = Color3.fromRGB(0, 170, 255)
 
local MODE_BUTTON_NAMES = {
["Weld Btn"] = "Weld",
["WeldConstraint Btn"] = "WeldConstraint",
["Snap Btn"] = "Snap",
["Attachment Btn"] = "Attachment",
["SpringConstraint Btn"] = "SpringConstraint",
["HingeConstraint Btn"] = "HingeConstraint",
}
 
local function isBasePart(inst)
    return inst and inst:IsA("BasePart")
end
 
local function findAncestorNamed(inst, wantedName)
    local current = inst
    while current do
        if current.Name == wantedName then
            return current
        end
        current = current.Parent
    end
    return nil
end
 
local function findPluginsFolder()
    return findAncestorNamed(script, "Plugins")
end
 
local function findToggleButton()
    if script.Parent and script.Parent:IsA("GuiButton") then
        return script.Parent
    end
    
    local parent = script.Parent
    if parent then
        local named = parent:FindFirstChild("Weld") or parent:FindFirstChild("Welds Btn") or parent:FindFirstChild("Toggle") or parent:FindFirstChild("WeldToggle")
        if named and named:IsA("GuiButton") then
            return named
        end
    end
    
    local screenGui = script:FindFirstAncestorWhichIsA("ScreenGui")
    if screenGui then
        local btn = screenGui:FindFirstChild("Weld", true)
        or screenGui:FindFirstChild("Welds Btn", true)
        or screenGui:FindFirstChild("Toggle", true)
        or screenGui:FindFirstChild("WeldToggle", true)
        if btn and btn:IsA("GuiButton") then
            return btn
        end
    end
    
    error("Toggle button not found (Weld / Welds Btn / Toggle / WeldToggle).")
end
 
local function findWeldsFrame()
    local pluginsRoot = findPluginsFolder()
    if not pluginsRoot then
        return nil
    end
    
    local welds = pluginsRoot:FindFirstChild("Welds")
    if welds and welds:IsA("Frame") then
        return welds
    end
    
    return nil
end
 
local toggleButton = findToggleButton()
local weldsFrame = findWeldsFrame()
 
if not weldsFrame then
    error("Welds frame not found in Plugins folder.")
end
 
local function findModeContainer()
    local scrollingFrame = weldsFrame:FindFirstChildWhichIsA("ScrollingFrame", true)
    return scrollingFrame or weldsFrame
end
 
local modeContainer = findModeContainer()
 
local function findModeButtons()
    local buttons = {}
    
    if not modeContainer then
        return buttons
    end
    
    for buttonName, modeName in pairs(MODE_BUTTON_NAMES) do
        local obj = modeContainer:FindFirstChild(buttonName, true)
        if obj and obj:IsA("GuiButton") then
            buttons[modeName] = obj
        end
    end
    
    return buttons
end

local function findDoneButton()
    local doneBtn = weldsFrame:FindFirstChild("Done", true) 
    or weldsFrame:FindFirstChild("Done Btn", true) 
    or weldsFrame:FindFirstChild("DoneButton", true)
    
    if doneBtn and doneBtn:IsA("GuiButton") then
        return doneBtn
    end
    return nil
end
 
local modeButtons = findModeButtons()
local doneButton = findDoneButton()

if not doneButton then
    warn("Done button not found inside Welds frame. Please ensure a GuiButton named 'Done' exists.")
end

local currentMode = "Weld"
local selectedParts = {}
local selectedSet = {}
 
local function setButtonVisual(button, isOn)
    if not button or not button:IsA("GuiButton") then
        return
    end
    
    if button:IsA("TextButton") then
        button.BackgroundColor3 = isOn and BTN_ON or BTN_OFF
        button.TextColor3 = Color3.fromRGB(25, 25, 25)
    elseif button:IsA("ImageButton") then
        button.ImageColor3 = isOn and BTN_ON or BTN_OFF
    end
end
 
local function updateAllButtonVisuals()
    setButtonVisual(toggleButton, weldsFrame.Visible)
    
    for modeName, button in pairs(modeButtons) do
        setButtonVisual(button, currentMode == modeName)
    end
end
 
local function removeMarkers(part)
    if not part then
        return
    end
    
    local h = part:FindFirstChild("__LocalWeldHighlight")
    if h then
        h:Destroy()
    end
    
    local b = part:FindFirstChild("__LocalWeldNumber")
    if b then
        b:Destroy()
    end
end
 
local function clearSelection()
    for _, part in ipairs(selectedParts) do
        if part and part.Parent then
            removeMarkers(part)
        end
    end
    
    table.clear(selectedParts)
    table.clear(selectedSet)
end
 
local function refreshMarkers()
    for i, part in ipairs(selectedParts) do
        if part and part.Parent and isBasePart(part) then
            removeMarkers(part)
            
            local h = Instance.new("Highlight")
            h.Name = "__LocalWeldHighlight"
            h.Adornee = part
            h.FillColor = SELECT_COLOR
            h.OutlineColor = Color3.fromRGB(255, 255, 255)
            h.FillTransparency = 0.5
            h.OutlineTransparency = 0
            h.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
            h.Parent = part
            
            local bb = Instance.new("BillboardGui")
            bb.Name = "__LocalWeldNumber"
            bb.Adornee = part
            bb.AlwaysOnTop = true
            bb.Size = UDim2.fromOffset(40, 40)
            bb.StudsOffset = Vector3.new(0, part.Size.Y * 0.5 + 0.6, 0)
            bb.Parent = part
            
            local circle = Instance.new("Frame")
            circle.Size = UDim2.fromScale(1, 1)
            circle.BackgroundColor3 = SELECT_COLOR
            circle.BackgroundTransparency = 0.1
            circle.BorderSizePixel = 0
            circle.Parent = bb
            
            local corner = Instance.new("UICorner")
            corner.CornerRadius = UDim.new(1, 0)
            corner.Parent = circle
            
            local txt = Instance.new("TextLabel")
            txt.Size = UDim2.fromScale(1, 1)
            txt.BackgroundTransparency = 1
            txt.Text = tostring(i)
            txt.TextColor3 = Color3.fromRGB(255, 255, 255)
            txt.TextScaled = true
            txt.Font = Enum.Font.SourceSansBold
            txt.Parent = circle
        end
    end
end
 
local function addPart(part)
    if not isBasePart(part) then
        return
    end
    
    if selectedSet[part] then
        return
    end
    
    selectedSet[part] = true
    table.insert(selectedParts, part)
    refreshMarkers()
end
 
local function removePart(part)
    if not selectedSet[part] then
        return
    end
    
    selectedSet[part] = nil
    
    for i = #selectedParts, 1, -1 do
        if selectedParts[i] == part then
            table.remove(selectedParts, i)
            break
        end
    end
    
    removeMarkers(part)
    refreshMarkers()
end
 
local function togglePart(part)
    if selectedSet[part] then
        removePart(part)
    else
        addPart(part)
    end
end
 
local function pickPartAtScreenPos(screenPos)
    local camera = workspace.CurrentCamera
    if not camera then
        return nil
    end
    
    local ray = camera:ScreenPointToRay(screenPos.X, screenPos.Y)
    local guiAncestor = toggleButton:FindFirstAncestorWhichIsA("ScreenGui")
    
    local params = RaycastParams.new()
    params.FilterType = Enum.RaycastFilterType.Exclude
    
    local filterList = { guiAncestor, playerGui }
    if player.Character then
        table.insert(filterList, player.Character)
    end
    
    params.FilterDescendantsInstances = filterList
    params.IgnoreWater = true
    params.RespectCanCollide = false
    
    local result = workspace:Raycast(ray.Origin, ray.Direction * 5000, params)
    if result and result.Instance and result.Instance:IsA("BasePart") then
        return result.Instance
    end
    
    return nil
end
 
local function clearExistingBuilderObjects(rootPart, otherPart)
    for _, child in ipairs(rootPart:GetChildren()) do
        if child.Name:sub(1, 13) == "__LocalBuild_" then
            if child:IsA("Weld") or child:IsA("WeldConstraint") or child:IsA("Snap")
                or child:IsA("SpringConstraint") or child:IsA("HingeConstraint")
                or child:IsA("Attachment") then
                child:Destroy()
            end
        end
    end
    
    for _, child in ipairs(otherPart:GetChildren()) do
        if child.Name:sub(1, 13) == "__LocalBuild_" and child:IsA("Attachment") then
            child:Destroy()
        end
    end
end
 
local function createAttachment(parentPart, worldPos, name)
    local att = Instance.new("Attachment")
    att.Name = name
    att.WorldPosition = worldPos
    att.Parent = parentPart
    return att
end
 
local function createWeld(rootPart, otherPart)
    otherPart.Anchored = false
    local weld = Instance.new("Weld")
    weld.Name = "__LocalBuild_Weld"
    weld.Part0 = rootPart
    weld.Part1 = otherPart
    weld.C0 = rootPart.CFrame:Inverse() * otherPart.CFrame
    weld.C1 = CFrame.new()
    weld.Parent = rootPart
    return weld
end
 
local function createWeldConstraint(rootPart, otherPart)
    otherPart.Anchored = false
    local wc = Instance.new("WeldConstraint")
    wc.Name = "__LocalBuild_WeldConstraint"
    wc.Part0 = rootPart
    wc.Part1 = otherPart
    wc.Parent = rootPart
    return wc
end
 
local function createSnap(rootPart, otherPart)
    otherPart.Anchored = false
    local snap = Instance.new("Snap")
    snap.Name = "__LocalBuild_Snap"
    snap.Part0 = rootPart
    snap.Part1 = otherPart
    snap.C0 = rootPart.CFrame:Inverse() * otherPart.CFrame
    snap.C1 = CFrame.new()
    snap.Parent = rootPart
    return snap
end
 
local function createAttachmentPairAndConstraint(rootPart, otherPart, kind)
    otherPart.Anchored = false
    
    local midPoint = (rootPart.Position + otherPart.Position) / 2
    local a0 = createAttachment(rootPart, midPoint, "__LocalBuild_Attachment0")
    local a1 = createAttachment(otherPart, midPoint, "__LocalBuild_Attachment1")
    
    if kind == "Attachment" then
        return a0, a1
    end
    
    if kind == "SpringConstraint" then
        local spring = Instance.new("SpringConstraint")
        spring.Name = "__LocalBuild_SpringConstraint"
        spring.Attachment0 = a0
        spring.Attachment1 = a1
        spring.FreeLength = (rootPart.Position - otherPart.Position).Magnitude
        spring.Stiffness = 500
        spring.Damping = 20
        spring.Parent = rootPart
        return spring
    end
    
    if kind == "HingeConstraint" then
        local hinge = Instance.new("HingeConstraint")
        hinge.Name = "__LocalBuild_HingeConstraint"
        hinge.Attachment0 = a0
        hinge.Attachment1 = a1
        hinge.Parent = rootPart
        return hinge
    end
    
    return nil
end
 
local function applySelection()
    if #selectedParts < 2 then
        warn("At least 2 parts must be selected to perform this action.")
        clearSelection()
        return
    end
    
    local rootPart = selectedParts[1]
    if not rootPart or not rootPart.Parent or not isBasePart(rootPart) then
        warn("Root part is invalid or missing.")
        clearSelection()
        return
    end
    
    for i = 2, #selectedParts do
        local part = selectedParts[i]
        if part and part.Parent and isBasePart(part) then
            clearExistingBuilderObjects(rootPart, part)
            
            if currentMode == "Weld" then
                createWeld(rootPart, part)
            elseif currentMode == "WeldConstraint" then
                createWeldConstraint(rootPart, part)
            elseif currentMode == "Snap" then
                createSnap(rootPart, part)
            elseif currentMode == "Attachment" then
                createAttachmentPairAndConstraint(rootPart, part, "Attachment")
            elseif currentMode == "SpringConstraint" then
                createAttachmentPairAndConstraint(rootPart, part, "SpringConstraint")
            elseif currentMode == "HingeConstraint" then
                createAttachmentPairAndConstraint(rootPart, part, "HingeConstraint")
            end
        end
    end
    
    print("Successfully applied mode: " .. currentMode .. " to selected parts.")
    clearSelection()
end
 
local function setWeldsVisible(state)
    weldsFrame.Visible = state and true or false
    if not weldsFrame.Visible then
        clearSelection()
    end
    updateAllButtonVisuals()
end
 
local function setMode(modeName)
    currentMode = modeName
    updateAllButtonVisuals()
end
 
setWeldsVisible(false)
updateAllButtonVisuals()
 
toggleButton.MouseButton1Click:Connect(function()
    setWeldsVisible(not weldsFrame.Visible)
end)

if doneButton then
    doneButton.MouseButton1Click:Connect(function()
        applySelection()
    end)
end
 
for modeName, button in pairs(modeButtons) do
    button.MouseButton1Click:Connect(function()
        setMode(modeName)
    end)
end
 
UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then
        return
    end
    
    if not weldsFrame.Visible then
        return
    end
    
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        local pos = UserInputService:GetMouseLocation()
        local part = pickPartAtScreenPos(pos)
        if part then
            togglePart(part)
        end
    elseif input.UserInputType == Enum.UserInputType.Touch then
        local part = pickPartAtScreenPos(input.Position)
        if part then
            togglePart(part)
        end
    end
end)
 
