--[[
      DESC: You can use Explorer and Properties while playing test
       VER: 26.1
--]]
local Players = game:GetService("Players")
local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
 
local toggleButton = script.Parent
 
local THEME = {
Background = Color3.fromRGB(46, 46, 46),
PanelBackground = Color3.fromRGB(56, 56, 56),
HeaderBackground = Color3.fromRGB(38, 38, 38),
RowHover = Color3.fromRGB(66, 66, 66),
RowSelected = Color3.fromRGB(0, 84, 153),
Border = Color3.fromRGB(25, 25, 25),
Text = Color3.fromRGB(225, 225, 225),
SubText = Color3.fromRGB(160, 160, 160),
InputBackground = Color3.fromRGB(35, 35, 35),
InputBorder = Color3.fromRGB(70, 70, 70),
}
 
local ROW_HEIGHT = 20
local INDENT = 16
local ARROW_SIZE = 8
local SCROLLBAR_WIDTH = 12
 
local ROOT_SERVICES = {
"Workspace",
"Players",
"Lighting",
"MaterialService",
"ReplicatedFirst",
"ReplicatedStorage",
"ServerScriptService",
"ServerStorage",
"StarterGui",
"StarterPack",
"StarterPlayer",
"Teams",
"SoundService",
"Chat",
"TextChatService",
"LocalizationService",
"TestService",
"CoreGui",
}
 
local ALWAYS_SHOW_ROOT = {
Workspace = true,
Players = true,
Lighting = true,
MaterialService = true,
ReplicatedFirst = true,
ReplicatedStorage = true,
ServerScriptService = true,
ServerStorage = true,
StarterGui = true,
StarterPack = true,
StarterPlayer = true,
Teams = true,
SoundService = true,
Chat = true,
TextChatService = true,
LocalizationService = true,
TestService = true,
CoreGui = true,
}
 
local ICON_CONFIG = {
expandArrowRight = 14391381475,
expandArrowDown = 6712149203,
default = 104761980605521,
classIcons = {
Workspace = 130445908860175,
Model = 130688559873148,
Part = 16176355119,
MeshPart = 16176355119,
UnionOperation = 16176355119,
WedgePart = 16176355119,
CornerWedgePart = 16176355119,
TrussPart = 16176355119,
Seat = 16176355119,
VehicleSeat = 16176355119,
Folder = 9380139516,
Script = 4998267442,
LocalScript = 74168042554478,
ModuleScript = 5273570797,
Camera = 116049632783000,
Humanoid = 8143941026,
SpawnLocation = 17551837095,
Sound = 86860408136798,
SoundGroup = 86860408136798,
Lighting = 113400401815016,
Players = 102652986965218,
Player = 79752442151330,
ReplicatedStorage = 83472796630868,
ReplicatedFirst = 83472796630868,
ServerStorage = 88915692436359,
ServerScriptService = 6005479118,
StarterGui = 134275029951595,
StarterPack = 115501190833397,
StarterPlayer = 88906243814653,
Team = 104761980605521,
Teams = 80693611807948,
ScreenGui = 83384695564199,
SurfaceGui = 104761980605521,
BillboardGui = 114758679029679,
Frame = 102724683868925,
ScrollingFrame = 102724683868925,
CanvasGroup = 102724683868925,
TextLabel = 122808672542101,
TextButton = 121419971235751,
TextBox = 121419971235751,
ImageLabel = 12618019266,
ImageButton = 12618019266,
UIListLayout = 8876745428,
UIPadding = 8876745428,
UIGridLayout = 8876745428,
UIStroke = 113400401815016,
UICorner = 113400401815016,
UISizeConstraint = 113400401815016,
UIAspectRatioConstraint = 113400401815016,
UITextSizeConstraint = 113400401815016,
UIGradient = 113400401815016,
Attachment = 72070650623950,
Motor6D = 72070650623950,
Weld = 148570182,
WeldConstraint = 148570182,
HingeConstraint = 15974336341,
SpringConstraint = 15974336341,
RopeConstraint = 15974336341,
RodConstraint = 15974336341,
BallSocketConstraint = 15974336341,
PrismaticConstraint = 15974336341,
CylindricalConstraint = 15974336341,
NoCollisionConstraint = 15974336341,
AlignPosition = 15974336341,
AlignOrientation = 15974336341,
BodyVelocity = 129901688299112,
BodyPosition = 129901688299112,
BodyGyro = 129901688299112,
BodyAngularVelocity = 129901688299112,
PointLight = 113400401815016,
SpotLight = 129901688299112,
SurfaceLight = 129901688299112,
Tool = 11462895347,
Accessory = 13285395424,
BillboardGui = 114758679029679,
SoundService = 86860408136798,
BindableFunction = 120780684482635,
BindableEvent = 120780684482635,
CoreGui = 133124017657520,
RemoteEvent = 101631584021014,
RemoteFunction = 101631584021014,
ProximityPrompt = 114758679029679,
ParticleEmitter = 129901688299112,
Beam = 129901688299112,
Trail = 129901688299112,
Decal = 12618019266,
Texture = 12618019266,
Animation = 5273570797,
AnimationController = 5273570797,
Animator = 5273570797,
Highlight = 113400401815016,
ProximityPromptService = 114758679029679,
ParticleEmitter = 129901688299112,
Constraint = 15974336341,
NumberValue = 104761980605521,
IntValue = 104761980605521,
StringValue = 104761980605521,
BoolValue = 104761980605521,
Vector3Value = 104761980605521,
CFrameValue = 104761980605521,
Color3Value = 104761980605521,
BrickColorValue = 104761980605521,
ObjectValue = 104761980605521,
NumberSequence = 104761980605521,
ColorSequence = 104761980605521,
UICorner = 113400401815016,
UIStroke = 113400401815016,
UIGradient = 113400401815016,
ProximityPrompt = 114758679029679,
Decal = 12618019266,
ParticleEmitter = 129901688299112,
Camera = 116049632783000,
},
}
 
local PROPERTY_GROUP_LIBRARY = {
Data = {"Name", "ClassName", "Parent", "Archivable", "UniqueId"},
 
Workspace = {
"Gravity",
"FallenPartsDestroyHeight",
"DistributedGameTime",
"StreamingEnabled",
"SignalBehavior",
"CurrentCamera",
},
 
Lighting = {
"Brightness",
"ClockTime",
"ExposureCompensation",
"EnvironmentDiffuseScale",
"EnvironmentSpecularScale",
"GeographicLatitude",
"GlobalShadows",
"Ambient",
"OutdoorAmbient",
"ColorShift_Bottom",
"ColorShift_Top",
"FogColor",
"FogEnd",
"FogStart",
"Technology",
},
 
MaterialService = {
"Use2022Materials",
},
 
SoundService = {
"RespectFilteringEnabled",
"DistanceFactor",
"DopplerScale",
"RolloffScale",
"Volume",
},
 
Chat = {
"BubbleChatEnabled",
"ChatAnimationEnabled",
"ChatBarEnabled",
"ChannelsBarEnabled",
"ClassicChatEnabled",
"GamePadChatEnabled",
"LoadDefaultChat",
},
 
TextChatService = {
"ChatVersion",
"CreateDefaultTextChannels",
"CreateDefaultCommands",
"BubbleChatConfiguration",
"ChatInputBarConfiguration",
"ShowBubbleChatEnabled",
},
 
TestService = {
"Enabled",
},
 
CoreGui = {
"Enabled",
},
 
Model = {
"PrimaryPart",
"WorldPivot",
"ModelStreamingMode",
"LevelOfDetail",
"PivotOffset",
},
 
BasePart = {
"Anchored",
"CanCollide",
"CanTouch",
"CanQuery",
"CollisionGroup",
"CustomPhysicalProperties",
"Massless",
"Locked",
"Material",
"MaterialVariant",
"Color",
"Reflectance",
"Transparency",
"CastShadow",
"Shape",
"Size",
"Position",
"Orientation",
"Rotation",
"CFrame",
"AssemblyLinearVelocity",
"AssemblyAngularVelocity",
"RootPriority",
},
 
Camera = {
"FieldOfView",
"CameraType",
"CameraSubject",
"CFrame",
"Focus",
"DiagonalFieldOfView",
"MaxAxisFieldOfView",
"NearPlaneZ",
},
 
Decal = {
"Texture",
"Color3",
"Transparency",
"Face",
},
 
ParticleEmitter = {
"Enabled",
"Rate",
"Lifetime",
"Speed",
"SpreadAngle",
"Rotation",
"RotSpeed",
"LightEmission",
"LightInfluence",
"Drag",
"Acceleration",
"Size",
"Transparency",
"Color",
"Texture",
"ZOffset",
"EmissionDirection",
"Shape",
"ShapeStyle",
"ShapeInOut",
"ShapePartial",
},
 
Animation = {
"AnimationId",
"Priority",
"Looping",
},
 
Constraint = {
"Active",
"Enabled",
"Visible",
"Color",
"Thickness",
"Attachment0",
"Attachment1",
"LimitsEnabled",
"UpperAngle",
"LowerAngle",
"TwistLimitsEnabled",
"TwistLowerAngle",
"TwistUpperAngle",
"MaxForce",
"MaxTorque",
"MaxVelocity",
"Responsiveness",
"RigidityEnabled",
"TargetAngle",
},
 
ProximityPrompt = {
"ActionText",
"ObjectText",
"KeyboardKeyCode",
"GamepadKeyCode",
"HoldDuration",
"RequiresLineOfSight",
"MaxActivationDistance",
"Style",
"ClickablePrompt",
"UIOffset",
},
 
UIStroke = {
"Color",
"Thickness",
"Transparency",
"ApplyStrokeMode",
"LineJoinMode",
},
 
UICorner = {
"CornerRadius",
},
 
GuiObject = {
"Size",
"Position",
"AnchorPoint",
"Rotation",
"Active",
"Selectable",
"Visible",
"ZIndex",
"LayoutOrder",
"AutomaticSize",
"ClipsDescendants",
"BorderMode",
"BackgroundColor3",
"BackgroundTransparency",
"BorderColor3",
"BorderSizePixel",
},
 
ScreenGui = {
"DisplayOrder",
"IgnoreGuiInset",
"ResetOnSpawn",
"Enabled",
"ZIndexBehavior",
"ScreenInsets",
"ClipToDeviceSafeArea",
},
 
SurfaceGui = {
"Adornee",
"Active",
"AlwaysOnTop",
"Enabled",
"LightInfluence",
"PixelsPerStud",
"CanvasSize",
"Face",
"SizingMode",
"ToolPunchThroughDistance",
"ZOffset",
"ClipsDescendants",
"ResetOnSpawn",
},
 
BillboardGui = {
"Adornee",
"Active",
"AlwaysOnTop",
"Enabled",
"LightInfluence",
"MaxDistance",
"Size",
"StudsOffset",
"StudsOffsetWorldSpace",
"ExtentsOffset",
"ExtentsOffsetWorldSpace",
"ZIndexBehavior",
"ResetOnSpawn",
},
 
TextLabel = {
"Text",
"Font",
"TextSize",
"TextColor3",
"TextTransparency",
"TextScaled",
"TextWrapped",
"RichText",
"TextXAlignment",
"TextYAlignment",
"LineHeight",
"TextTruncate",
"TextStrokeColor3",
"TextStrokeTransparency",
},
 
TextButton = {
"Text",
"Font",
"TextSize",
"TextColor3",
"TextTransparency",
"TextScaled",
"TextWrapped",
"RichText",
"TextXAlignment",
"TextYAlignment",
"LineHeight",
"TextTruncate",
"TextStrokeColor3",
"TextStrokeTransparency",
"AutoButtonColor",
"Modal",
},
 
TextBox = {
"Text",
"Font",
"TextSize",
"TextColor3",
"TextTransparency",
"TextScaled",
"TextWrapped",
"RichText",
"TextXAlignment",
"TextYAlignment",
"LineHeight",
"TextTruncate",
"TextStrokeColor3",
"TextStrokeTransparency",
"ClearTextOnFocus",
"PlaceholderText",
"PlaceholderColor3",
"TextEditable",
"MultiLine",
"MaxVisibleGraphemes",
},
 
ImageLabel = {
"Image",
"ImageColor3",
"ImageTransparency",
"ImageRectOffset",
"ImageRectSize",
"ScaleType",
"SliceCenter",
"SliceScale",
"TileSize",
"ResampleMode",
},
 
ImageButton = {
"Image",
"ImageColor3",
"ImageTransparency",
"ImageRectOffset",
"ImageRectSize",
"ScaleType",
"SliceCenter",
"SliceScale",
"TileSize",
"ResampleMode",
"AutoButtonColor",
},
 
Tool = {
"CanBeDropped",
"Enabled",
"RequiresHandle",
"Grip",
"GripForward",
"GripPos",
"GripRight",
"GripUp",
"ToolTip",
"TextureId",
},
 
Sound = {
"SoundId",
"Volume",
"Looped",
"PlaybackSpeed",
"TimePosition",
"Playing",
"RollOffMode",
"RollOffMaxDistance",
"RollOffMinDistance",
"EmitterSize",
"SoundGroup",
},
 
Humanoid = {
"Health",
"MaxHealth",
"WalkSpeed",
"JumpPower",
"JumpHeight",
"AutoRotate",
"Sit",
"PlatformStand",
"UseJumpPower",
"RequiresNeck",
"RigType",
"DisplayDistanceType",
"HealthDisplayType",
"NameDisplayDistance",
"BreakJointsOnDeath",
},
 
RemoteEvent = {},
RemoteFunction = {},
BindableEvent = {},
BindableFunction = {},
 
ValueBase = {
"Value",
},
 
Color3Value = {"Value"},
BrickColorValue = {"Value"},
BoolValue = {"Value"},
IntValue = {"Value"},
NumberValue = {"Value"},
StringValue = {"Value"},
ObjectValue = {"Value"},
CFrameValue = {"Value"},
Vector3Value = {"Value"},
 
Folder = {},
Script = {},
LocalScript = {},
ModuleScript = {},
}
 
local CLASS_GROUP_MAP = {
Workspace = {"Data", "Workspace"},
Lighting = {"Data", "Lighting"},
MaterialService = {"Data", "MaterialService"},
SoundService = {"Data", "SoundService"},
Chat = {"Data", "Chat"},
TextChatService = {"Data", "TextChatService"},
TestService = {"Data", "TestService"},
CoreGui = {"Data", "CoreGui"},
 
Model = {"Data", "Model"},
Part = {"Data", "BasePart"},
MeshPart = {"Data", "BasePart"},
UnionOperation = {"Data", "BasePart"},
WedgePart = {"Data", "BasePart"},
CornerWedgePart = {"Data", "BasePart"},
TrussPart = {"Data", "BasePart"},
SpawnLocation = {"Data", "BasePart"},
Seat = {"Data", "BasePart"},
VehicleSeat = {"Data", "BasePart"},
 
Camera = {"Data", "Camera"},
Decal = {"Data", "Decal"},
ParticleEmitter = {"Data", "ParticleEmitter"},
Animation = {"Data", "Animation"},
Constraint = {"Data", "Constraint"},
ProximityPrompt = {"Data", "ProximityPrompt"},
UIStroke = {"Data", "UIStroke"},
UICorner = {"Data", "UICorner"},
 
Tool = {"Data", "Tool"},
Sound = {"Data", "Sound"},
Humanoid = {"Data", "Humanoid"},
 
Frame = {"Data", "GuiObject"},
ScrollingFrame = {"Data", "GuiObject"},
ViewportFrame = {"Data", "GuiObject"},
CanvasGroup = {"Data", "GuiObject"},
TextLabel = {"Data", "GuiObject", "TextLabel"},
TextButton = {"Data", "GuiObject", "TextButton"},
TextBox = {"Data", "GuiObject", "TextBox"},
ImageLabel = {"Data", "GuiObject", "ImageLabel"},
ImageButton = {"Data", "GuiObject", "ImageButton"},
ScreenGui = {"Data", "ScreenGui"},
SurfaceGui = {"Data", "GuiObject", "SurfaceGui"},
BillboardGui = {"Data", "GuiObject", "BillboardGui"},
 
RemoteEvent = {"Data", "RemoteEvent"},
RemoteFunction = {"Data", "RemoteFunction"},
BindableEvent = {"Data", "BindableEvent"},
BindableFunction = {"Data", "BindableFunction"},
 
Folder = {"Data", "Folder"},
BoolValue = {"Data", "BoolValue"},
IntValue = {"Data", "IntValue"},
NumberValue = {"Data", "NumberValue"},
StringValue = {"Data", "StringValue"},
ObjectValue = {"Data", "ObjectValue"},
CFrameValue = {"Data", "CFrameValue"},
Vector3Value = {"Data", "Vector3Value"},
Color3Value = {"Data", "Color3Value"},
BrickColorValue = {"Data", "BrickColorValue"},
 
Script = {"Data"},
LocalScript = {"Data"},
ModuleScript = {"Data"},
}
 
local function toIconUri(id)
    if typeof(id) == "string" then
        if string.match(id, "^rbxassetid://") or string.match(id, "^rbxthumb://") or string.match(id, "^rbxasset://") then
            return id
        end
        return "rbxthumb://type=Asset&id=" .. id .. "&w=150&h=150"
    end
    return "rbxthumb://type=Asset&id=" .. tostring(id) .. "&w=150&h=150"
end
 
local function getClassIcon(className)
    local id = ICON_CONFIG.classIcons[className] or ICON_CONFIG.default
    return toIconUri(id)
end
 
local EXPAND_ARROW_RIGHT_URI = toIconUri(ICON_CONFIG.expandArrowRight)
local EXPAND_ARROW_DOWN_URI = toIconUri(ICON_CONFIG.expandArrowDown)
 
local function safeGetChildren(inst)
    local ok, children = pcall(function()
        return inst:GetChildren()
    end)
    if ok and children then
        return children
    end
    return {}
end
 
local function hasChildren(inst)
    local ok, children = pcall(function()
        return inst:GetChildren()
    end)
    return ok and children and #children > 0
end
 
local function clearFrameChildren(frame)
    for _, child in ipairs(frame:GetChildren()) do
        if child:IsA("Frame") then
            child:Destroy()
        end
    end
end
 
local function detachFrameChildren(frame)
    for _, child in ipairs(frame:GetChildren()) do
        if child:IsA("Frame") then
            child.Parent = nil
        end
    end
end
 
local function createCustomScrollFrame(parentGui, sizeUDim, positionUDim)
    local viewport = Instance.new("Frame")
    viewport.Name = "ScrollViewport"
    viewport.Size = sizeUDim
    viewport.Position = positionUDim
    viewport.BackgroundTransparency = 1
    viewport.BorderSizePixel = 0
    viewport.ClipsDescendants = true
    viewport.Parent = parentGui
    
    local content = Instance.new("Frame")
    content.Name = "ScrollContent"
    content.Size = UDim2.new(1, -(SCROLLBAR_WIDTH + 2), 0, 0)
    content.Position = UDim2.new(0, 0, 0, 0)
    content.BackgroundTransparency = 1
    content.BorderSizePixel = 0
    content.AutomaticSize = Enum.AutomaticSize.Y
    content.Parent = viewport
    
    local layout = Instance.new("UIListLayout")
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Parent = content
    
    local scrollbarTrack = Instance.new("Frame")
    scrollbarTrack.Name = "ScrollbarTrack"
    scrollbarTrack.Size = UDim2.new(0, SCROLLBAR_WIDTH, 1, 0)
    scrollbarTrack.Position = UDim2.new(1, -SCROLLBAR_WIDTH, 0, 0)
    scrollbarTrack.BackgroundTransparency = 1
    scrollbarTrack.BorderSizePixel = 0
    scrollbarTrack.Parent = viewport
    
    local scrollbarThumb = Instance.new("Frame")
    scrollbarThumb.Name = "ScrollbarThumb"
    scrollbarThumb.Size = UDim2.new(1, 0, 0.3, 0)
    scrollbarThumb.Position = UDim2.new(0, 0, 0, 0)
    scrollbarThumb.BackgroundColor3 = THEME.SubText
    scrollbarThumb.BackgroundTransparency = 0.3
    scrollbarThumb.BorderSizePixel = 0
    scrollbarThumb.Parent = scrollbarTrack
    
    local thumbCorner = Instance.new("UICorner")
    thumbCorner.CornerRadius = UDim.new(0, 4)
    thumbCorner.Parent = scrollbarThumb
    
    local scrollY = 0
    
    local function updateScrollbar()
        local viewH = viewport.AbsoluteSize.Y
        local contentH = content.AbsoluteSize.Y
        
        if contentH <= viewH or contentH <= 0 then
            scrollbarThumb.Visible = false
            return
        end
        
        scrollbarThumb.Visible = true
        local ratio = viewH / contentH
        local thumbH = math.clamp(ratio, 0.05, 1)
        local maxScroll = contentH - viewH
        local scrollRatio = maxScroll > 0 and (scrollY / maxScroll) or 0
        
        scrollbarThumb.Size = UDim2.new(1, 0, thumbH, 0)
        scrollbarThumb.Position = UDim2.new(0, 0, scrollRatio * (1 - thumbH), 0)
    end
    
    local function setScrollY(y)
        local viewH = viewport.AbsoluteSize.Y
        local contentH = content.AbsoluteSize.Y
        local maxScroll = math.max(0, contentH - viewH)
        scrollY = math.clamp(y, 0, maxScroll)
        content.Position = UDim2.new(0, 0, 0, -scrollY)
        updateScrollbar()
    end
    
    local function getScrollY()
        return scrollY
    end
    
    viewport.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseWheel then
            setScrollY(scrollY - input.Position.Z * 30)
        end
    end)
    
    content:GetPropertyChangedSignal("AbsoluteSize"):Connect(function()
        setScrollY(scrollY)
    end)
    
    viewport:GetPropertyChangedSignal("AbsoluteSize"):Connect(function()
        setScrollY(scrollY)
    end)
    
    local thumbDragging = false
    local thumbDragStartY = 0
    local thumbDragStartScroll = 0
    
    scrollbarThumb.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            thumbDragging = true
            thumbDragStartY = input.Position.Y
            thumbDragStartScroll = scrollY
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    thumbDragging = false
                end
            end)
        end
    end)
    
    scrollbarThumb.InputChanged:Connect(function(input)
        if thumbDragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            local viewH = viewport.AbsoluteSize.Y
            local contentH = content.AbsoluteSize.Y
            local maxScroll = math.max(0, contentH - viewH)
            local thumbTrackH = viewH * (1 - math.clamp(viewH / math.max(contentH, 1), 0.05, 1))
            local deltaY = input.Position.Y - thumbDragStartY
            local deltaScroll = thumbTrackH > 0 and (deltaY / thumbTrackH) * maxScroll or 0
            setScrollY(thumbDragStartScroll + deltaScroll)
        end
    end)
    
    return {
    viewport = viewport,
    content = content,
    layout = layout,
    getScrollY = getScrollY,
    setScrollY = setScrollY,
    updateScrollbar = updateScrollbar,
    }
end
 
local function findStudioGuiContainer()
    local ok, found = pcall(function()
        return playerGui:FindFirstChild("StudioGui", true)
    end)
    if ok then
        return found
    end
    return nil
end
 
local studioContainer = findStudioGuiContainer()
local guiParent = studioContainer or playerGui
 
local existingGui = guiParent:FindFirstChild("StudioExplorerGui")
if existingGui then
    existingGui:Destroy()
end
 
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "StudioExplorerGui"
screenGui.ResetOnSpawn = false
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.DisplayOrder = 100
screenGui.Parent = guiParent
 
local function ensureWindow(name, size, pos)
    local frame = Instance.new("Frame")
    frame.Name = name
    frame.Size = size
    frame.Position = pos
    frame.BackgroundColor3 = THEME.PanelBackground
    frame.BorderSizePixel = 0
    frame.Active = true
    frame.Visible = false
    frame.Parent = screenGui
    
    local stroke = Instance.new("UIStroke")
    stroke.Color = THEME.Border
    stroke.Thickness = 1
    stroke.Parent = frame
    
    return frame
end
 
local explorerWindow = ensureWindow("ExplorerWindow", UDim2.new(0, 280, 0, 320), UDim2.new(1, -290, 0, 10))
local propertiesWindow = ensureWindow("PropertiesWindow", UDim2.new(0, 280, 0, 320), UDim2.new(1, -290, 0, 340))
 
local explorerTitleBar = Instance.new("Frame")
explorerTitleBar.Name = "TitleBar"
explorerTitleBar.Size = UDim2.new(1, 0, 0, 24)
explorerTitleBar.BackgroundColor3 = THEME.HeaderBackground
explorerTitleBar.BorderSizePixel = 0
explorerTitleBar.Parent = explorerWindow
 
local explorerTitle = Instance.new("TextLabel")
explorerTitle.Size = UDim2.new(1, -50, 1, 0)
explorerTitle.Position = UDim2.new(0, 6, 0, 0)
explorerTitle.BackgroundTransparency = 1
explorerTitle.Text = "Explorer"
explorerTitle.Font = Enum.Font.SourceSansSemibold
explorerTitle.TextSize = 14
explorerTitle.TextColor3 = THEME.Text
explorerTitle.TextXAlignment = Enum.TextXAlignment.Left
explorerTitle.Parent = explorerTitleBar
 
local explorerRefreshBtn = Instance.new("TextButton")
explorerRefreshBtn.Size = UDim2.new(0, 20, 0, 20)
explorerRefreshBtn.Position = UDim2.new(1, -44, 0, 2)
explorerRefreshBtn.BackgroundTransparency = 1
explorerRefreshBtn.Text = "⟳"
explorerRefreshBtn.Font = Enum.Font.SourceSansBold
explorerRefreshBtn.TextSize = 15
explorerRefreshBtn.TextColor3 = THEME.SubText
explorerRefreshBtn.Parent = explorerTitleBar
 
local explorerCloseBtn = Instance.new("TextButton")
explorerCloseBtn.Size = UDim2.new(0, 20, 0, 20)
explorerCloseBtn.Position = UDim2.new(1, -22, 0, 2)
explorerCloseBtn.BackgroundTransparency = 1
explorerCloseBtn.Text = "x"
explorerCloseBtn.Font = Enum.Font.SourceSansBold
explorerCloseBtn.TextSize = 16
explorerCloseBtn.TextColor3 = THEME.SubText
explorerCloseBtn.Parent = explorerTitleBar
 
local actionBar = Instance.new("Frame")
actionBar.Name = "ActionBar"
actionBar.Size = UDim2.new(1, 0, 0, 26)
actionBar.Position = UDim2.new(0, 0, 0, 24)
actionBar.BackgroundColor3 = THEME.HeaderBackground
actionBar.BorderSizePixel = 0
actionBar.Parent = explorerWindow
 
local actionBarLayout = Instance.new("UIListLayout")
actionBarLayout.FillDirection = Enum.FillDirection.Horizontal
actionBarLayout.SortOrder = Enum.SortOrder.LayoutOrder
actionBarLayout.Parent = actionBar
 
local function createActionButton(text, layoutOrder)
    local btn = Instance.new("TextButton")
    btn.Name = "Action_" .. text
    btn.Size = UDim2.new(0, 44, 1, 0)
    btn.BackgroundTransparency = 1
    btn.Text = text
    btn.Font = Enum.Font.SourceSans
    btn.TextSize = 10
    btn.TextWrapped = true
    btn.TextColor3 = THEME.Text
    btn.LayoutOrder = layoutOrder
    btn.Parent = actionBar
    return btn
end
 
local dupeBtn = createActionButton("Duplicate", 1)
local copyBtn = createActionButton("Copy", 2)
local cutBtn = createActionButton("Cut", 3)
local deleteBtn = createActionButton("Delete", 4)
local pasteBtn = createActionButton("Paste Into", 5)
local selectChildrenBtn = createActionButton("Select Children", 6)
 
local searchBox = Instance.new("TextBox")
searchBox.Name = "SearchBox"
searchBox.Size = UDim2.new(1, -8, 0, 22)
searchBox.Position = UDim2.new(0, 4, 0, 54)
searchBox.BackgroundColor3 = THEME.InputBackground
searchBox.BorderSizePixel = 0
searchBox.PlaceholderText = "Filter Workspace"
searchBox.PlaceholderColor3 = THEME.SubText
searchBox.Text = ""
searchBox.Font = Enum.Font.SourceSans
searchBox.TextSize = 14
searchBox.TextColor3 = THEME.Text
searchBox.ClearTextOnFocus = false
searchBox.Parent = explorerWindow
 
local searchCorner = Instance.new("UICorner")
searchCorner.CornerRadius = UDim.new(0, 3)
searchCorner.Parent = searchBox
 
local searchStroke = Instance.new("UIStroke")
searchStroke.Color = THEME.InputBorder
searchStroke.Thickness = 1
searchStroke.Parent = searchBox
 
local treeScrollWidget = createCustomScrollFrame(explorerWindow, UDim2.new(1, 0, 1, -80), UDim2.new(0, 0, 0, 80))
local treeScroll = treeScrollWidget.content
 
local explorerResizeHandle = Instance.new("Frame")
explorerResizeHandle.Size = UDim2.new(0, 14, 0, 14)
explorerResizeHandle.Position = UDim2.new(1, -14, 1, -14)
explorerResizeHandle.BackgroundTransparency = 1
explorerResizeHandle.Parent = explorerWindow
 
local resizeIcon = Instance.new("TextLabel")
resizeIcon.Size = UDim2.new(1, 0, 1, 0)
resizeIcon.BackgroundTransparency = 1
resizeIcon.Text = "◢"
resizeIcon.TextColor3 = THEME.SubText
resizeIcon.TextSize = 12
resizeIcon.Font = Enum.Font.SourceSans
resizeIcon.Parent = explorerResizeHandle
 
local propTitleBar = Instance.new("Frame")
propTitleBar.Name = "TitleBar"
propTitleBar.Size = UDim2.new(1, 0, 0, 24)
propTitleBar.BackgroundColor3 = THEME.HeaderBackground
propTitleBar.BorderSizePixel = 0
propTitleBar.Parent = propertiesWindow
 
local propTitle = Instance.new("TextLabel")
propTitle.Size = UDim2.new(1, -28, 1, 0)
propTitle.Position = UDim2.new(0, 6, 0, 0)
propTitle.BackgroundTransparency = 1
propTitle.Text = "Properties"
propTitle.Font = Enum.Font.SourceSansSemibold
propTitle.TextSize = 14
propTitle.TextColor3 = THEME.Text
propTitle.TextXAlignment = Enum.TextXAlignment.Left
propTitle.Parent = propTitleBar
 
local propCloseBtn = Instance.new("TextButton")
propCloseBtn.Size = UDim2.new(0, 20, 0, 20)
propCloseBtn.Position = UDim2.new(1, -22, 0, 2)
propCloseBtn.BackgroundTransparency = 1
propCloseBtn.Text = "x"
propCloseBtn.Font = Enum.Font.SourceSansBold
propCloseBtn.TextSize = 16
propCloseBtn.TextColor3 = THEME.SubText
propCloseBtn.Parent = propTitleBar
 
local propSelectedLabel = Instance.new("TextLabel")
propSelectedLabel.Size = UDim2.new(1, -8, 0, 22)
propSelectedLabel.Position = UDim2.new(0, 4, 0, 28)
propSelectedLabel.BackgroundTransparency = 1
propSelectedLabel.Text = "(no selection)"
propSelectedLabel.Font = Enum.Font.SourceSansSemibold
propSelectedLabel.TextSize = 14
propSelectedLabel.TextColor3 = THEME.Text
propSelectedLabel.TextXAlignment = Enum.TextXAlignment.Left
propSelectedLabel.Parent = propertiesWindow
 
local propScrollWidget = createCustomScrollFrame(propertiesWindow, UDim2.new(1, 0, 1, -54), UDim2.new(0, 0, 0, 54))
local propScroll = propScrollWidget.content
 
local propResizeHandle = Instance.new("Frame")
propResizeHandle.Size = UDim2.new(0, 14, 0, 14)
propResizeHandle.Position = UDim2.new(1, -14, 1, -14)
propResizeHandle.BackgroundTransparency = 1
propResizeHandle.Parent = propertiesWindow
 
local propResizeIcon = Instance.new("TextLabel")
propResizeIcon.Size = UDim2.new(1, 0, 1, 0)
propResizeIcon.BackgroundTransparency = 1
propResizeIcon.Text = "◢"
propResizeIcon.TextColor3 = THEME.SubText
propResizeIcon.TextSize = 12
propResizeIcon.Font = Enum.Font.SourceSans
propResizeIcon.Parent = propResizeHandle
 
local function makeDraggable(window, dragHandle)
    local dragging = false
    local dragStart, startPos
    
    dragHandle.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = window.Position
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    dragging = false
                end
            end)
        end
    end)
    
    dragHandle.InputChanged:Connect(function(input)
        if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            local delta = input.Position - dragStart
            window.Position = UDim2.new(
            startPos.X.Scale, startPos.X.Offset + delta.X,
            startPos.Y.Scale, startPos.Y.Offset + delta.Y
            )
        end
    end)
end
 
local function makeResizable(window, resizeHandle, minSize)
    local resizing = false
    local dragStart, startSize
    
    resizeHandle.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            resizing = true
            dragStart = input.Position
            startSize = window.Size
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    resizing = false
                end
            end)
        end
    end)
    
    resizeHandle.InputChanged:Connect(function(input)
        if resizing and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            local delta = input.Position - dragStart
            local newX = math.max(minSize.X, startSize.X.Offset + delta.X)
            local newY = math.max(minSize.Y, startSize.Y.Offset + delta.Y)
            window.Size = UDim2.new(0, newX, 0, newY)
        end
    end)
end
 
makeDraggable(explorerWindow, explorerTitleBar)
makeDraggable(propertiesWindow, propTitleBar)
makeResizable(explorerWindow, explorerResizeHandle, Vector2.new(180, 200))
makeResizable(propertiesWindow, propResizeHandle, Vector2.new(220, 200))
 
local function parseInput(text, original)
    local t = typeof(original)
    
    if t == "number" then
        return tonumber(text)
    elseif t == "string" then
        return text
    elseif t == "boolean" then
        local lowered = string.lower(text)
        if lowered == "true" then
            return true
        elseif lowered == "false" then
            return false
        end
        return nil
    elseif t == "Vector3" then
        local x, y, z = string.match(text, "([%-%d%.]+)%s*,%s*([%-%d%.]+)%s*,%s*([%-%d%.]+)")
        if x and y and z then
            return Vector3.new(tonumber(x), tonumber(y), tonumber(z))
        end
        return nil
    elseif t == "Vector2" then
        local x, y = string.match(text, "([%-%d%.]+)%s*,%s*([%-%d%.]+)")
        if x and y then
            return Vector2.new(tonumber(x), tonumber(y))
        end
        return nil
    elseif t == "Color3" then
        local r, g, b = string.match(text, "([%d%.]+)%s*,%s*([%d%.]+)%s*,%s*([%d%.]+)")
        if r and g and b then
            return Color3.fromRGB(tonumber(r), tonumber(g), tonumber(b))
        end
        return nil
    elseif t == "CFrame" then
        local x, y, z = string.match(text, "([%-%d%.]+)%s*,%s*([%-%d%.]+)%s*,%s*([%-%d%.]+)")
        if x and y and z then
            return CFrame.new(tonumber(x), tonumber(y), tonumber(z))
        end
        return nil
    elseif t == "EnumItem" then
        local enumType = original.EnumType
        local ok, result = pcall(function()
            return enumType[text]
        end)
        if ok and result then
            return result
        end
        return nil
    elseif t == "UDim2" then
        local xs, xo, ys, yo = string.match(text, "([%-%d%.]+)%s*,%s*([%-%d%.]+)%s*,%s*([%-%d%.]+)%s*,%s*([%-%d%.]+)")
        if xs and xo and ys and yo then
            return UDim2.new(tonumber(xs), tonumber(xo), tonumber(ys), tonumber(yo))
        end
        return nil
    elseif t == "UDim" then
        local s, o = string.match(text, "([%-%d%.]+)%s*,%s*([%-%d%.]+)")
        if s and o then
            return UDim.new(tonumber(s), tonumber(o))
        end
        return nil
    end
    
    return nil
end
 
local function formatPropertyValue(value)
    local t = typeof(value)
    if t == "Vector3" then
        return string.format("%.3f, %.3f, %.3f", value.X, value.Y, value.Z)
    elseif t == "Vector2" then
        return string.format("%.3f, %.3f", value.X, value.Y)
    elseif t == "Color3" then
        return string.format("%d, %d, %d", math.floor(value.R * 255), math.floor(value.G * 255), math.floor(value.B * 255))
    elseif t == "CFrame" then
        local pos = value.Position
        return string.format("%.3f, %.3f, %.3f", pos.X, pos.Y, pos.Z)
    elseif t == "EnumItem" then
        return tostring(value.Name)
    elseif t == "boolean" then
        return tostring(value)
    elseif t == "Instance" then
        return value and value:GetFullName() or "nil"
    elseif t == "nil" then
        return "nil"
    elseif t == "UDim2" then
        return string.format("%.3f, %.3f, %.3f, %.3f", value.X.Scale, value.X.Offset, value.Y.Scale, value.Y.Offset)
    elseif t == "UDim" then
        return string.format("%.3f, %.3f", value.Scale, value.Offset)
    else
        return tostring(value)
    end
end
 
local nodesByInstance = {}
local hooked = {}
local selectedInstance = nil
local clipboardInstance = nil
local clipboardIsCut = false
local currentSearch = ""
local renderBusy = false
 
local renderRoots
local renderChildren
local renderNode
local buildPropertiesList
local selectInstance
local updateSelectionHighlights
local hookNodeSignals
local revealAncestors
local setExplorerVisible
 
local function safeSetVisible(obj, state)
    if obj and obj:IsA("GuiObject") then
        obj.Visible = state
        return true
    end
    return false
end
 
local function clearTreeArea()
    detachFrameChildren(treeScroll)
end
 
local function clearPropertyArea()
    clearFrameChildren(propScroll)
end
 
local function matchesFilter(inst, filterText)
    if filterText == "" then
        return true
    end
    if string.find(string.lower(inst.Name), filterText, 1, true) then
        return true
    end
    for _, child in ipairs(safeGetChildren(inst)) do
        if matchesFilter(child, filterText) then
            return true
        end
    end
    return false
end
 
local function createPropertyRow(inst, propName, value, layoutOrder, setterFn, readOnly)
    local row = Instance.new("Frame")
    row.Name = "Prop_" .. propName
    row.Size = UDim2.new(1, 0, 0, 22)
    row.BackgroundTransparency = 1
    row.LayoutOrder = layoutOrder
    row.Parent = propScroll
    
    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(0.45, 0, 1, 0)
    label.Position = UDim2.new(0, 6, 0, 0)
    label.BackgroundTransparency = 1
    label.Text = propName
    label.Font = Enum.Font.SourceSans
    label.TextSize = 13
    label.TextColor3 = THEME.SubText
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.Parent = row
    
    if typeof(value) == "boolean" and not readOnly then
        local checkbox = Instance.new("TextButton")
        checkbox.Size = UDim2.new(0.5, -8, 0, 18)
        checkbox.Position = UDim2.new(0.48, 0, 0, 2)
        checkbox.BackgroundColor3 = THEME.InputBackground
        checkbox.BorderSizePixel = 0
        checkbox.Text = tostring(value)
        checkbox.Font = Enum.Font.SourceSans
        checkbox.TextSize = 13
        checkbox.TextColor3 = THEME.Text
        checkbox.Parent = row
        
        local cbCorner = Instance.new("UICorner")
        cbCorner.CornerRadius = UDim.new(0, 3)
        cbCorner.Parent = checkbox
        
        checkbox.MouseButton1Click:Connect(function()
            local ok = setterFn(not value)
            if ok then
                checkbox.Text = tostring(not value)
            end
        end)
    else
        local input = Instance.new("TextBox")
        input.Size = UDim2.new(0.5, -8, 0, 18)
        input.Position = UDim2.new(0.48, 0, 0, 2)
        input.BackgroundColor3 = THEME.InputBackground
        input.BorderSizePixel = 0
        input.Text = formatPropertyValue(value)
        input.Font = Enum.Font.SourceSans
        input.TextSize = 13
        input.TextColor3 = THEME.Text
        input.ClearTextOnFocus = false
        input.Parent = row
        
        local inputCorner = Instance.new("UICorner")
        inputCorner.CornerRadius = UDim.new(0, 3)
        inputCorner.Parent = input
        
        local inputStroke = Instance.new("UIStroke")
        inputStroke.Color = THEME.InputBorder
        inputStroke.Thickness = 1
        inputStroke.Parent = input
        
        if readOnly then
            input.TextEditable = false
            input.TextColor3 = THEME.SubText
        else
            input.FocusLost:Connect(function(enterPressed)
                if enterPressed then
                    local ok = setterFn(input.Text)
                    if ok then
                        inputStroke.Color = THEME.InputBorder
                    else
                        inputStroke.Color = Color3.fromRGB(200, 60, 60)
                        input.Text = formatPropertyValue(value)
                        task.wait(0.15)
                        inputStroke.Color = THEME.InputBorder
                    end
                else
                    input.Text = formatPropertyValue(value)
                end
            end)
        end
    end
    
    return row
end
 
local function addGroup(groups, groupName, seen)
    if seen[groupName] then
        return
    end
    seen[groupName] = true
    
    local props = PROPERTY_GROUP_LIBRARY[groupName]
    if props then
        table.insert(groups, {
        name = groupName,
        props = props,
        })
    end
end
 
local function getPropertyGroupsForInstance(inst)
    local groups = {}
    local seen = {}
    addGroup(groups, "Data", seen)
    
    local map = CLASS_GROUP_MAP[inst.ClassName]
    if map then
        for _, groupName in ipairs(map) do
            addGroup(groups, groupName, seen)
        end
    else
        addGroup(groups, "Data", seen)
    end
    
    return groups
end
 
buildPropertiesList = function(inst)
    clearPropertyArea()
    
    if not inst then
        return
    end
    
    local groups = getPropertyGroupsForInstance(inst)
    local order = 1
    
    for _, group in ipairs(groups) do
        local matched = {}
        
        for _, propName in ipairs(group.props) do
            local ok, value = pcall(function()
                return inst[propName]
            end)
            if ok and value ~= nil then
                table.insert(matched, {name = propName, value = value})
            end
        end
        
        if #matched > 0 then
            local header = Instance.new("Frame")
            header.Name = "Category_" .. group.name
            header.Size = UDim2.new(1, 0, 0, 20)
            header.BackgroundColor3 = THEME.HeaderBackground
            header.BorderSizePixel = 0
            header.LayoutOrder = order
            header.Parent = propScroll
            
            local label = Instance.new("TextLabel")
            label.Size = UDim2.new(1, -6, 1, 0)
            label.Position = UDim2.new(0, 6, 0, 0)
            label.BackgroundTransparency = 1
            label.Text = group.name
            label.Font = Enum.Font.SourceSansSemibold
            label.TextSize = 13
            label.TextColor3 = THEME.SubText
            label.TextXAlignment = Enum.TextXAlignment.Left
            label.Parent = header
            
            order += 1
            
            for _, prop in ipairs(matched) do
                local propName = prop.name
                local value = prop.value
                local readOnly = (propName == "ClassName" or propName == "UniqueId" or propName == "Parent")
                local setterFn
                
                if readOnly then
                    setterFn = function()
                        return false
                    end
                else
                    setterFn = function(newText)
                        local parsed = parseInput(newText, value)
                        if parsed == nil then
                            return false
                        end
                        return pcall(function()
                            inst[propName] = parsed
                        end)
                    end
                end
                
                createPropertyRow(inst, propName, value, order, setterFn, readOnly)
                order += 1
            end
        end
    end
    
    local okAttrs, attrs = pcall(function()
        return inst:GetAttributes()
    end)
    
    if okAttrs and attrs and next(attrs) ~= nil then
        local header = Instance.new("Frame")
        header.Name = "Category_Attributes"
        header.Size = UDim2.new(1, 0, 0, 20)
        header.BackgroundColor3 = THEME.HeaderBackground
        header.BorderSizePixel = 0
        header.LayoutOrder = order
        header.Parent = propScroll
        
        local label = Instance.new("TextLabel")
        label.Size = UDim2.new(1, -6, 1, 0)
        label.Position = UDim2.new(0, 6, 0, 0)
        label.BackgroundTransparency = 1
        label.Text = "Attributes"
        label.Font = Enum.Font.SourceSansSemibold
        label.TextSize = 13
        label.TextColor3 = THEME.SubText
        label.TextXAlignment = Enum.TextXAlignment.Left
        label.Parent = header
        
        order += 1
        
        for attrName, attrValue in pairs(attrs) do
            local nameCopy = attrName
            local valueCopy = attrValue
            
            local setterFn = function(newText)
                local parsed = parseInput(newText, valueCopy)
                if parsed == nil then
                    return false
                end
                return pcall(function()
                    inst:SetAttribute(nameCopy, parsed)
                end)
            end
            
            createPropertyRow(inst, nameCopy, valueCopy, order, setterFn, false)
            order += 1
        end
    end
end
 
local function pruneDeadNode(inst)
    local node = nodesByInstance[inst]
    if node then
        if node.frame then
            node.frame:Destroy()
        end
        nodesByInstance[inst] = nil
    end
    hooked[inst] = nil
end
 
hookNodeSignals = function(inst)
    if hooked[inst] then
        return
    end
    hooked[inst] = true
    
    inst:GetPropertyChangedSignal("Name"):Connect(function()
        local node = nodesByInstance[inst]
        if not node then
            return
        end
        if node.nameButton then
            node.nameButton.Text = inst.Name
        end
        if node.parentInst and nodesByInstance[node.parentInst] then
            renderChildren(node.parentInst)
        else
            renderRoots()
        end
    end)
    
    inst.AncestryChanged:Connect(function(_, newParent)
        local node = nodesByInstance[inst]
        if not node then
            return
        end
        node.parentInst = newParent
        
        if newParent == nil then
            if selectedInstance == inst then
                selectedInstance = nil
                clearPropertyArea()
                propSelectedLabel.Text = "(no selection)"
            end
            pruneDeadNode(inst)
            renderRoots()
            return
        end
        
        task.defer(function()
            if newParent and nodesByInstance[newParent] then
                renderChildren(newParent)
            else
                renderRoots()
            end
        end)
    end)
    
    inst.ChildAdded:Connect(function(child)
        if not child:IsDescendantOf(screenGui) then
            task.defer(function()
                if nodesByInstance[inst] then
                    renderChildren(inst)
                end
            end)
        end
    end)
    
    inst.ChildRemoved:Connect(function(child)
        if not child:IsDescendantOf(screenGui) then
            task.defer(function()
                if nodesByInstance[inst] then
                    renderChildren(inst)
                end
            end)
        end
    end)
end
 
renderNode = function(inst, parentContainer, layoutOrder, depth)
    local node = nodesByInstance[inst]
    if not node then
        node = {
        inst = inst,
        frame = nil,
        header = nil,
        nameButton = nil,
        expandButton = nil,
        icon = nil,
        childrenHolder = nil,
        expanded = false,
        parentInst = inst.Parent,
        }
        nodesByInstance[inst] = node
        hookNodeSignals(inst)
    end
    
    if not node.frame then
        local frame = Instance.new("Frame")
        frame.Name = "Node_" .. inst.Name
        frame.BackgroundTransparency = 1
        frame.BorderSizePixel = 0
        frame.Size = UDim2.new(1, 0, 0, 0)
        frame.AutomaticSize = Enum.AutomaticSize.Y
        frame.LayoutOrder = layoutOrder
        frame.Parent = parentContainer
        node.frame = frame
        
        local vlist = Instance.new("UIListLayout")
        vlist.SortOrder = Enum.SortOrder.LayoutOrder
        vlist.Parent = frame
        
        local header = Instance.new("Frame")
        header.Name = "Header"
        header.Size = UDim2.new(1, 0, 0, ROW_HEIGHT)
        header.BackgroundColor3 = THEME.PanelBackground
        header.BackgroundTransparency = 1
        header.BorderSizePixel = 0
        header.Parent = frame
        node.header = header
        
        local expandBtn = Instance.new("ImageButton")
        expandBtn.Name = "ExpandBtn"
        expandBtn.Size = UDim2.new(0, ARROW_SIZE, 0, ARROW_SIZE)
        expandBtn.Position = UDim2.new(0, 2 + depth * INDENT, 0, (ROW_HEIGHT - ARROW_SIZE) / 2)
        expandBtn.BackgroundTransparency = 1
        expandBtn.Image = EXPAND_ARROW_RIGHT_URI
        expandBtn.ImageTransparency = 0
        expandBtn.Parent = header
        node.expandButton = expandBtn
        
        local icon = Instance.new("ImageLabel")
        icon.Name = "Icon"
        icon.Size = UDim2.new(0, 16, 0, 16)
        icon.Position = UDim2.new(0, 14 + depth * INDENT, 0, 2)
        icon.BackgroundTransparency = 1
        icon.Image = getClassIcon(inst.ClassName)
        icon.Parent = header
        node.icon = icon
        
        local nameBtn = Instance.new("TextButton")
        nameBtn.Name = "NameButton"
        nameBtn.Size = UDim2.new(1, -34 - depth * INDENT, 1, 0)
        nameBtn.Position = UDim2.new(0, 30 + depth * INDENT, 0, 0)
        nameBtn.BackgroundTransparency = 1
        nameBtn.Text = inst.Name
        nameBtn.Font = Enum.Font.SourceSans
        nameBtn.TextSize = 14
        nameBtn.TextColor3 = THEME.Text
        nameBtn.TextXAlignment = Enum.TextXAlignment.Left
        nameBtn.Parent = header
        node.nameButton = nameBtn
        
        local childrenHolder = Instance.new("Frame")
        childrenHolder.Name = "ChildrenHolder"
        childrenHolder.BackgroundTransparency = 1
        childrenHolder.BorderSizePixel = 0
        childrenHolder.Size = UDim2.new(1, 0, 0, 0)
        childrenHolder.AutomaticSize = Enum.AutomaticSize.Y
        childrenHolder.Visible = false
        childrenHolder.Parent = frame
        node.childrenHolder = childrenHolder
        
        local pad = Instance.new("UIPadding")
        pad.PaddingLeft = UDim.new(0, INDENT)
        pad.Parent = childrenHolder
        
        local childrenLayout = Instance.new("UIListLayout")
        childrenLayout.SortOrder = Enum.SortOrder.LayoutOrder
        childrenLayout.Parent = childrenHolder
        
        expandBtn.MouseButton1Click:Connect(function()
            node.expanded = not node.expanded
            if node.expanded then
                renderChildren(inst)
            else
                node.childrenHolder.Visible = false
            end
            expandBtn.Image = (node.expanded and hasChildren(inst)) and EXPAND_ARROW_DOWN_URI or EXPAND_ARROW_RIGHT_URI
        end)
        
        nameBtn.MouseButton1Click:Connect(function()
            selectInstance(inst)
        end)
        
        nameBtn.MouseEnter:Connect(function()
            if selectedInstance ~= inst then
                header.BackgroundTransparency = 0
                header.BackgroundColor3 = THEME.RowHover
            end
        end)
        
        nameBtn.MouseLeave:Connect(function()
            if selectedInstance ~= inst then
                header.BackgroundTransparency = 1
                header.BackgroundColor3 = THEME.PanelBackground
            end
        end)
    end
    
    local okParent = pcall(function()
        node.frame.Parent = parentContainer
    end)
    if not okParent then
        node.frame:Destroy()
        nodesByInstance[inst] = nil
        hooked[inst] = nil
        return renderNode(inst, parentContainer, layoutOrder, depth)
    end
    
    node.frame.LayoutOrder = layoutOrder
    node.icon.Image = getClassIcon(inst.ClassName)
    node.nameButton.Text = inst.Name
    node.expandButton.Image = (node.expanded and hasChildren(inst)) and EXPAND_ARROW_DOWN_URI or EXPAND_ARROW_RIGHT_URI
    node.expandButton.ImageTransparency = hasChildren(inst) and 0 or 1
    node.header.BackgroundTransparency = (selectedInstance == inst) and 0 or 1
    node.header.BackgroundColor3 = (selectedInstance == inst) and THEME.RowSelected or THEME.PanelBackground
    node.childrenHolder.Visible = node.expanded or currentSearch ~= ""
    
    return node
end
 
renderChildren = function(parentInst)
    if renderBusy then
        return
    end
    renderBusy = true
    
    local node = nodesByInstance[parentInst]
    if not node then
        renderBusy = false
        return
    end
    
    node.childrenHolder.Visible = true
    detachFrameChildren(node.childrenHolder)
    
    local children = safeGetChildren(parentInst)
    table.sort(children, function(a, b)
        return a.Name < b.Name
    end)
    
    local order = 1
    for _, child in ipairs(children) do
        if currentSearch == "" or matchesFilter(child, currentSearch) then
            local childNode = renderNode(child, node.childrenHolder, order, 1)
            childNode.parentInst = parentInst
            order += 1
            
            if childNode.expanded or currentSearch ~= "" then
                childNode.childrenHolder.Visible = true
                renderChildren(child)
            else
                childNode.childrenHolder.Visible = false
            end
        end
    end
    
    renderBusy = false
end
 
renderRoots = function()
    if renderBusy then
        return
    end
    renderBusy = true
    
    clearTreeArea()
    
    local order = 1
    for _, serviceName in ipairs(ROOT_SERVICES) do
        local ok, service = pcall(function()
            return game:GetService(serviceName)
        end)
        
        if ok and service then
            local forceShow = ALWAYS_SHOW_ROOT[serviceName] or serviceName == "CoreGui"
            if forceShow or hasChildren(service) or currentSearch ~= "" then
                if currentSearch == "" or matchesFilter(service, currentSearch) or forceShow then
                    local node = renderNode(service, treeScroll, order, 0)
                    node.parentInst = nil
                    order += 1
                    
                    if node.expanded or currentSearch ~= "" then
                        node.childrenHolder.Visible = true
                        renderChildren(service)
                    else
                        node.childrenHolder.Visible = false
                    end
                end
            end
        end
    end
    
    updateSelectionHighlights()
    renderBusy = false
end
 
revealAncestors = function(inst)
    local chain = {}
    local cursor = inst
    
    while cursor and cursor ~= game do
        table.insert(chain, 1, cursor)
        cursor = cursor.Parent
    end
    
    for _, ancestor in ipairs(chain) do
        local node = nodesByInstance[ancestor]
        if node then
            node.expanded = true
        end
    end
end
 
selectInstance = function(inst)
    selectedInstance = inst
    if inst then
        propSelectedLabel.Text = inst.Name .. " (" .. inst.ClassName .. ")"
        revealAncestors(inst)
        buildPropertiesList(inst)
    else
        propSelectedLabel.Text = "(no selection)"
        clearPropertyArea()
    end
    updateSelectionHighlights()
end
 
updateSelectionHighlights = function()
    for inst, node in pairs(nodesByInstance) do
        if node.header then
            local selected = selectedInstance == inst
            node.header.BackgroundTransparency = selected and 0 or 1
            node.header.BackgroundColor3 = selected and THEME.RowSelected or THEME.PanelBackground
        end
    end
end
 
local function attachExistingSignals(inst)
    if not inst or hooked[inst] then
        return
    end
    hookNodeSignals(inst)
    for _, child in ipairs(safeGetChildren(inst)) do
        attachExistingSignals(child)
    end
end
 
for _, serviceName in ipairs(ROOT_SERVICES) do
    local ok, service = pcall(function()
        return game:GetService(serviceName)
    end)
    if ok and service then
        attachExistingSignals(service)
    end
end
 
searchBox:GetPropertyChangedSignal("Text"):Connect(function()
    currentSearch = string.lower(searchBox.Text or "")
    renderRoots()
end)
 
explorerRefreshBtn.MouseButton1Click:Connect(function()
    renderRoots()
end)
 
dupeBtn.MouseButton1Click:Connect(function()
    if not selectedInstance then
        return
    end
    local ok, clone = pcall(function()
        local c = selectedInstance:Clone()
        c.Parent = selectedInstance.Parent
        return c
    end)
    if ok and clone then
        renderRoots()
        selectInstance(clone)
    end
end)
 
copyBtn.MouseButton1Click:Connect(function()
    if not selectedInstance then
        return
    end
    clipboardInstance = selectedInstance
    clipboardIsCut = false
end)
 
cutBtn.MouseButton1Click:Connect(function()
    if not selectedInstance then
        return
    end
    clipboardInstance = selectedInstance
    clipboardIsCut = true
end)
 
deleteBtn.MouseButton1Click:Connect(function()
    if not selectedInstance then
        return
    end
    local target = selectedInstance
    selectInstance(nil)
    pcall(function()
        target:Destroy()
    end)
    renderRoots()
end)
 
pasteBtn.MouseButton1Click:Connect(function()
    if not clipboardInstance or not selectedInstance then
        return
    end
    
    if clipboardIsCut then
        local ok = pcall(function()
            clipboardInstance.Parent = selectedInstance
        end)
        if ok then
            renderRoots()
        end
        clipboardInstance = nil
    else
        local ok, clone = pcall(function()
            local c = clipboardInstance:Clone()
            c.Parent = selectedInstance
            return c
        end)
        if ok and clone then
            renderRoots()
            selectInstance(clone)
        end
    end
end)
 
selectChildrenBtn.MouseButton1Click:Connect(function()
    if not selectedInstance then
        return
    end
    local children = safeGetChildren(selectedInstance)
    if #children > 0 then
        selectInstance(children[1])
    end
end)
 
setExplorerVisible = function(show)
    safeSetVisible(explorerWindow, show)
    safeSetVisible(propertiesWindow, show)
    if show then
        renderRoots()
    end
end
 
explorerCloseBtn.MouseButton1Click:Connect(function()
    setExplorerVisible(false)
end)
 
propCloseBtn.MouseButton1Click:Connect(function()
    setExplorerVisible(false)
end)
 
toggleButton.MouseButton1Click:Connect(function()
    local show = not explorerWindow.Visible
    setExplorerVisible(show)
end)

setExplorerVisible(false)
renderRoots()