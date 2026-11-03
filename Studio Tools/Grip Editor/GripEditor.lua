--[[
      DESC: You can only use the plugin in play test mode
       VER: 26.1
--]]
local frame=script.Parent
local textBox=frame:WaitForChild("Text")
local btnMove=frame:WaitForChild("Move")
local btnRotate=frame:WaitForChild("Rotate")
local outputLabel=frame:WaitForChild("Output")
local btnSettings=frame:WaitForChild("Settings")
local snapMBox=btnSettings:WaitForChild("SnapM")
local snapRBox=btnSettings:WaitForChild("SnapR")
local labelM=btnSettings:FindFirstChild("TextLabelM")or btnSettings:FindFirstChild("TextLableM")or btnSettings:WaitForChild("TextLableM")
local labelR=btnSettings:FindFirstChild("TextLabelR")or btnSettings:FindFirstChild("TextLableR")or btnSettings:WaitForChild("TextLableR")
snapMBox.Visible=false
snapRBox.Visible=false
if labelM then labelM.Visible=false end
if labelR then labelR.Visible=false end
textBox.ClearTextOnFocus=false
textBox.TextEditable=false
 
local BTN_ON=Color3.fromRGB(180,255,180)
local BTN_OFF=Color3.fromRGB(255,255,255)

local isSelfOn=false
if frame:IsA("TextButton")then
    frame.Activated:Connect(function()
        isSelfOn=not isSelfOn
        frame.BackgroundColor3=isSelfOn and BTN_ON or BTN_OFF
    end)
end
 
local Players=game:GetService("Players")
local UserInputService=game:GetService("UserInputService")
local player=Players.LocalPlayer
 
local moveHandles=Instance.new("Handles")
moveHandles.Style=Enum.HandlesStyle.Movement
moveHandles.Parent=frame
moveHandles.Visible=false
 
local rotateHandles=Instance.new("ArcHandles")
rotateHandles.Parent=frame
rotateHandles.Visible=false
 
local currentTool=nil
local initialGrip=CFrame.new()
local isMoving=false
local isRotating=false
local toolConns={}
 
local function updateButtonColors()
    btnMove.BackgroundColor3=isMoving and BTN_ON or BTN_OFF
    btnRotate.BackgroundColor3=isRotating and BTN_ON or BTN_OFF
end
 
local camera=workspace.CurrentCamera
local function lockCamera(state)
    if state then
        camera.CameraType=Enum.CameraType.Scriptable
    else
        camera.CameraType=Enum.CameraType.Custom
    end
end
 
local function refreshTargetPart()
    if not currentTool then return end
    local targetPart=currentTool:FindFirstChild("Handle")or currentTool.PrimaryPart
    moveHandles.Adornee=(isMoving and targetPart)or nil
    rotateHandles.Adornee=(isRotating and targetPart)or nil
end
 
btnMove.Activated:Connect(function()
    isMoving=true
    isRotating=false
    moveHandles.Visible=true
    rotateHandles.Visible=false
    rotateHandles.Adornee=nil
    refreshTargetPart()
    updateButtonColors()
end)
 
btnRotate.Activated:Connect(function()
    isMoving=false
    isRotating=true
    moveHandles.Visible=false
    rotateHandles.Visible=true
    moveHandles.Adornee=nil
    refreshTargetPart()
    updateButtonColors()
end)
 
btnSettings.Activated:Connect(function()
    local newState=not snapMBox.Visible
    snapMBox.Visible=newState
    snapRBox.Visible=newState
    if labelM then labelM.Visible=newState end
    if labelR then labelR.Visible=newState end
    btnSettings.BackgroundColor3=newState and BTN_ON or BTN_OFF
end)
 
local function round(num)return math.floor(num*1000+0.5)/1000 end
local function formatCFrame(cf)
    local p=cf.Position
    local rx,ry,rz=cf:ToOrientation()
    local ox,oy,oz=math.deg(rx),math.deg(ry),math.deg(rz)
    return string.format("p(%s, %s, %s), o(%s, %s, %s)",round(p.X),round(p.Y),round(p.Z),round(ox),round(oy),round(oz))
end
local function getSnappedValue(value,step)
    if step<=0 then return value end
    return math.floor(value/step+0.5)*step
end
 
local isDraggingMove=false
local isDraggingRotate=false
 
moveHandles.MouseButton1Down:Connect(function()
    if currentTool then initialGrip=currentTool.Grip end
    isDraggingMove=true
    lockCamera(true)
end)
moveHandles.MouseButton1Up:Connect(function()
    isDraggingMove=false
    lockCamera(false)
end)
moveHandles.MouseDrag:Connect(function(face,distance)
    if not currentTool then return end
    local snapStep=tonumber(snapMBox.Text)or 1
    local delta=Vector3.FromNormalId(face)*getSnappedValue(distance,snapStep)
    currentTool.Grip=CFrame.new(-delta)*initialGrip
    textBox.Text=formatCFrame(currentTool.Grip)
end)
 
rotateHandles.MouseButton1Down:Connect(function()
    if currentTool then initialGrip=currentTool.Grip end
    isDraggingRotate=true
    lockCamera(true)
end)
rotateHandles.MouseButton1Up:Connect(function()
    isDraggingRotate=false
    lockCamera(false)
end)
rotateHandles.MouseDrag:Connect(function(axis,relativeAngle)
    if not currentTool then return end
    local snapDeg=tonumber(snapRBox.Text)or 5
    local snappedRadians=math.rad(getSnappedValue(math.deg(relativeAngle),snapDeg))
    local deltaX=(axis==Enum.Axis.X)and snappedRadians or 0
    local deltaY=(axis==Enum.Axis.Y)and snappedRadians or 0
    local deltaZ=(axis==Enum.Axis.Z)and snappedRadians or 0
    currentTool.Grip=CFrame.Angles(deltaX,deltaY,deltaZ):Inverse()*initialGrip
    textBox.Text=formatCFrame(currentTool.Grip)
end)
 
UserInputService.InputEnded:Connect(function(input)
    if input.UserInputType==Enum.UserInputType.MouseButton1 or input.UserInputType==Enum.UserInputType.Touch then
        isDraggingMove=false
        isDraggingRotate=false
        lockCamera(false)
    end
end)
 
local function clearToolConns()
    for _,c in ipairs(toolConns)do c:Disconnect()end
    toolConns={}
end
 
local function clearHandles()
    currentTool=nil
    moveHandles.Adornee=nil
    rotateHandles.Adornee=nil
    textBox.Text=""
    outputLabel.Text="Waiting for Tool..."
end
 
local function onToolEquipped(tool)
    currentTool=tool
    refreshTargetPart()
    local targetPart=tool:FindFirstChild("Handle")or tool.PrimaryPart
    outputLabel.Text="Found: "..tool.Name.."."..(targetPart and targetPart.Name or "?")
    
    clearToolConns()
    table.insert(toolConns,tool.Unequipped:Connect(function()
        clearHandles()
        clearToolConns()
    end))
    table.insert(toolConns,tool.AncestryChanged:Connect(function(_,parent)
        if not parent then
            clearHandles()
            clearToolConns()
        end
    end))
end
 
local function hookCharacter(character)
    clearHandles()
    clearToolConns()
    character.ChildAdded:Connect(function(child)
        if child:IsA("Tool")then
            onToolEquipped(child)
        end
    end)
    local existing=character:FindFirstChildOfClass("Tool")
    if existing then onToolEquipped(existing)end
end
 
if player.Character then hookCharacter(player.Character)end
player.CharacterAdded:Connect(hookCharacter)
 
game:GetService("RunService").Heartbeat:Connect(function()
    if currentTool and not isDraggingMove and not isDraggingRotate then
        textBox.Text=formatCFrame(currentTool.Grip)
    end
end)
