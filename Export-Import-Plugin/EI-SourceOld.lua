local HttpService = game:GetService("HttpService")
local StarterPlayer = game:GetService("StarterPlayer")

local guiContainer = script.Parent
local scrollingFrame = guiContainer:WaitForChild("ScrollingFrame")
local templateBox = scrollingFrame:WaitForChild("InputTextBox1")
templateBox.Name = "InputTextBoxTemplate"

local scriptsSaves = guiContainer:WaitForChild("ScriptsSaves")
local scriptTemplateBox = scriptsSaves:WaitForChild("ScriptTextBox1")
scriptTemplateBox.Visible = false
scriptTemplateBox.Name = "ScriptTextBoxTemplate"

local copyButton = guiContainer:WaitForChild("CopyButton")
local loadButton = guiContainer:WaitForChild("LoadButton")
local clearButton = guiContainer:WaitForChild("ClearButton")
local toggleButton = guiContainer:WaitForChild("ToggleButton")
local inputTextBoxPath = guiContainer:WaitForChild("InputTextBoxPath")

local cloneButton = guiContainer:FindFirstChild("CloneButton")
local deletePButton = guiContainer:FindFirstChild("DeletePButton")

inputTextBoxPath.Visible = false

local function printProgress(current, total, message)
    local status = message and (" - " .. message) or ""
    print(string.format("[PROGRESS] %d/%d%s", current, total, status))
end

scriptsSaves.AutomaticCanvasSize = Enum.AutomaticSize.Y

local scriptsListLayout = scriptsSaves:FindFirstChildOfClass("UIListLayout")
if not scriptsListLayout then
    scriptsListLayout = Instance.new("UIListLayout")
    scriptsListLayout.Parent = scriptsSaves
end
scriptsListLayout.FillDirection = Enum.FillDirection.Vertical
scriptsListLayout.SortOrder = Enum.SortOrder.LayoutOrder
scriptsListLayout.Padding = UDim.new(0, 10)

scriptTemplateBox.LayoutOrder = -1

local currentScriptCount = 0

local function ClearScriptsSaves()
    currentScriptCount = 0
    for _, child in ipairs(scriptsSaves:GetChildren()) do
        if child ~= scriptTemplateBox and (child:IsA("GuiObject") or child:IsA("StringValue")) then
            child:Destroy()
        end
    end
    scriptTemplateBox.Visible = false
end

local function AddScriptToSaves(name, scriptType, sourceText)
    if not sourceText or sourceText == "" or string.match(sourceText, "^%s*$") then
        warn(string.format("[Script Saver] Warning: Source code not found or empty for script '%s' (%s). Skipping creation.", tostring(name), tostring(scriptType)))
        return
    end
    
    currentScriptCount = currentScriptCount + 1
    
    local targetObj = scriptTemplateBox:Clone()
    
    local formattedTitle = string.format("%s [%s]", tostring(name), tostring(scriptType))
    targetObj.Name = formattedTitle
    
    local cleanText = string.gsub(sourceText, "\r\n", "\n")
    
    if targetObj:IsA("TextBox") then
        targetObj.Text = cleanText
    else
        local innerText = targetObj:FindFirstChildOfClass("TextBox")
        if innerText then
            innerText.Text = cleanText
        end
    end
    
    for _, child in ipairs(targetObj:GetDescendants()) do
        if child:IsA("TextLabel") then
            child.Text = formattedTitle
            break 
        end
    end
    
    targetObj.Visible = true
    targetObj.Parent = scriptsSaves
end

local FastCompress = {}

local FC_MIN_BITS = 9
local FC_MAX_BITS = 16
local FC_MAX_DICT_SIZE = 2 ^ FC_MAX_BITS
local FC_CLEAR_CODE = 256
local FC_START_CODE = 257

local B85_CHARS =
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" ..
"!#$%()*+-./:;=?@[]^_{}|"

local B85_LOOKUP = {}
for i = 1, #B85_CHARS do
    B85_LOOKUP[string.byte(B85_CHARS, i)] = i - 1
end

local function fc_newBitWriter()
    local bitBuffer = 0
    local bitCount = 0
    local bytes = {}
    
    local function writeBits(code, numBits)
        bitBuffer = bit32.bor(bitBuffer, bit32.lshift(code, bitCount))
        bitCount = bitCount + numBits
        while bitCount >= 8 do
            table.insert(bytes, string.char(bit32.band(bitBuffer, 0xFF)))
            bitBuffer = bit32.rshift(bitBuffer, 8)
            bitCount = bitCount - 8
        end
    end
    
    local function flush()
        if bitCount > 0 then
            table.insert(bytes, string.char(bit32.band(bitBuffer, 0xFF)))
            bitBuffer, bitCount = 0, 0
        end
    end
    
    local function getBytes()
        return table.concat(bytes)
    end
    
    return { writeBits = writeBits, flush = flush, getBytes = getBytes }
end

local function fc_newBitReader(byteStr)
    local pos = 1
    local total = #byteStr
    local bitBuffer = 0
    local bitCount = 0
    
    local function readBits(numBits)
        while bitCount < numBits do
            if pos > total then
                return nil
            end
            local b = string.byte(byteStr, pos)
            bitBuffer = bit32.bor(bitBuffer, bit32.lshift(b, bitCount))
            bitCount = bitCount + 8
            pos = pos + 1
        end
        local mask = bit32.lshift(1, numBits) - 1
        local code = bit32.band(bitBuffer, mask)
        bitBuffer = bit32.rshift(bitBuffer, numBits)
        bitCount = bitCount - numBits
        return code
    end
    
    local function getPos()
        return pos
    end
    
    return { readBits = readBits, getPos = getPos }
end

local function fc_encodeBase85(rawBytes)
    local out = {}
    local len = #rawBytes
    local i = 1
    while i <= len do
        local b1 = string.byte(rawBytes, i) or 0
        local b2 = string.byte(rawBytes, i + 1)
        local b3 = string.byte(rawBytes, i + 2)
        local b4 = string.byte(rawBytes, i + 3)
        
        local n = b1 * 16777216 + (b2 or 0) * 65536 + (b3 or 0) * 256 + (b4 or 0)
        
        local c5 = n % 85; n = (n - c5) / 85
        local c4 = n % 85; n = (n - c4) / 85
        local c3 = n % 85; n = (n - c3) / 85
        local c2 = n % 85; n = (n - c2) / 85
        local c1 = n % 85
        
        local chunkLen = 4
        if not b2 then chunkLen = 1
        elseif not b3 then chunkLen = 2
        elseif not b4 then chunkLen = 3
        end
            
            local chars = { c1, c2, c3, c4, c5 }
            local outCount = chunkLen + 1
            for k = 1, outCount do
                table.insert(out, string.sub(B85_CHARS, chars[k] + 1, chars[k] + 1))
            end
            
            i = i + 4
        end
        return table.concat(out)
    end
    
    local function fc_decodeBase85(str)
        local rawBytes = {}
        local len = #str
        local i = 1
        while i <= len do
            local remaining = math.min(5, len - i + 1)
            local n = 0
            for k = 0, remaining - 1 do
                local ch = string.byte(str, i + k)
                local val = B85_LOOKUP[ch] or 0
                n = n * 85 + val
            end
            for _ = remaining, 4 do
                n = n * 85 + 84
            end
            
            local byteCount = remaining - 1
            local b1 = math.floor(n / 16777216) % 256
            local b2 = math.floor(n / 65536) % 256
            local b3 = math.floor(n / 256) % 256
            local b4 = n % 256
            
            local bs = { b1, b2, b3, b4 }
            for k = 1, byteCount do
                table.insert(rawBytes, string.char(bs[k]))
            end
            
            i = i + 5
        end
        return table.concat(rawBytes)
    end
    
    function FastCompress.Compress(input, onProgress)
        if not input or #input == 0 then
            return ""
        end
        
        local writer = fc_newBitWriter()
        local dict = {}
        for i = 0, 255 do
            dict[string.char(i)] = i
        end
        local dictSize = FC_START_CODE
        local codeBits = FC_MIN_BITS
        local w = ""
        local totalLen = #input
        local lastPercent = -1
        
        writer.writeBits(FC_CLEAR_CODE, codeBits)
        
        for i = 1, totalLen do
            local c = string.sub(input, i, i)
            local wc = w .. c
            if dict[wc] then
                w = wc
            else
                writer.writeBits(dict[w], codeBits)
                
                if dictSize >= FC_MAX_DICT_SIZE then
                    writer.writeBits(FC_CLEAR_CODE, codeBits)
                    dict = {}
                    for j = 0, 255 do
                        dict[string.char(j)] = j
                    end
                    dictSize = FC_START_CODE
                    codeBits = FC_MIN_BITS
                else
                    dict[wc] = dictSize
                    dictSize = dictSize + 1
                    if dictSize > (2 ^ codeBits) and codeBits < FC_MAX_BITS then
                        codeBits = codeBits + 1
                    end
                end
                w = c
            end
            
            if onProgress and (i % 2000 == 0 or i == totalLen) then
                local percent = math.floor((i / totalLen) * 100)
                if percent ~= lastPercent then
                    lastPercent = percent
                    onProgress(percent, i, totalLen)
                end
            end
        end
        if w ~= "" then
            writer.writeBits(dict[w], codeBits)
        end
        writer.flush()
        
        return fc_encodeBase85(writer.getBytes())
    end
    
    function FastCompress.Decompress(input, onProgress)
        if not input or #input == 0 then
            return ""
        end
        
        local byteStr = fc_decodeBase85(input)
        local reader = fc_newBitReader(byteStr)
        local totalBytes = #byteStr
        
        local dict = {}
        for i = 0, 255 do
            dict[i] = string.char(i)
        end
        local dictSize = FC_START_CODE
        local codeBits = FC_MIN_BITS
        
        local result = {}
        local prevEntry = nil
        local lastPercent = -1
        local iterCount = 0
        
        while true do
            local code = reader.readBits(codeBits)
            if code == nil then
                break
            end
            
            if code == FC_CLEAR_CODE then
                dict = {}
                for i = 0, 255 do
                    dict[i] = string.char(i)
                end
                dictSize = FC_START_CODE
                codeBits = FC_MIN_BITS
                prevEntry = nil
            else
                local entry
                if dict[code] then
                    entry = dict[code]
                elseif code == dictSize and prevEntry then
                    entry = prevEntry .. string.sub(prevEntry, 1, 1)
                else
                    return nil
                end
                
                table.insert(result, entry)
                
                if prevEntry and dictSize < FC_MAX_DICT_SIZE then
                    dict[dictSize] = prevEntry .. string.sub(entry, 1, 1)
                    dictSize = dictSize + 1
                    if dictSize >= (2 ^ codeBits) and codeBits < FC_MAX_BITS then
                        codeBits = codeBits + 1
                    end
                end
                
                prevEntry = entry
            end
            
            iterCount = iterCount + 1
            if onProgress and (iterCount % 500 == 0) then
                local percent = math.floor((reader.getPos() / totalBytes) * 100)
                if percent > 100 then percent = 100 end
                if percent ~= lastPercent then
                    lastPercent = percent
                    onProgress(percent)
                end
            end
        end
        
        if onProgress and lastPercent ~= 100 then
            onProgress(100)
        end
        
        return table.concat(result)
    end
    
    scrollingFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
    
    local listLayout = scrollingFrame:FindFirstChildOfClass("UIListLayout")
    if not listLayout then
        listLayout = Instance.new("UIListLayout")
        listLayout.Parent = scrollingFrame
    end
    
    listLayout.FillDirection = Enum.FillDirection.Vertical
    listLayout.SortOrder = Enum.SortOrder.LayoutOrder
    listLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
    listLayout.Padding = UDim.new(0, 10)
    
    templateBox.LayoutOrder = -1
    
    templateBox.Visible = false
    
    local function SetBoxText(boxObj, textValue)
        if boxObj:IsA("TextBox") then
            boxObj.Text = textValue
        else
            local innerText = boxObj:FindFirstChildOfClass("TextBox")
            if innerText then
                innerText.Text = textValue
            end
        end
    end
    
    local function GetBoxText(boxObj)
        if boxObj:IsA("TextBox") then
            return boxObj.Text
        else
            local innerText = boxObj:FindFirstChildOfClass("TextBox")
            return innerText and innerText.Text or ""
        end
    end
    
    local function CreateNewBox(num)
        local existing = scrollingFrame:FindFirstChild("InputTextBox" .. num)
        if existing then
            existing.Visible = true
            local label = existing:FindFirstChildOfClass("TextLabel") or existing:FindFirstChild("PartLabel")
            if label then
                label.Text = "Part" .. num
                label.TextScaled = true
            end
            return existing
        end
        
        local newBox = templateBox:Clone()
        newBox.Name = "InputTextBox" .. num
        newBox.LayoutOrder = num
        newBox.Visible = true
        
        local label = newBox:FindFirstChildOfClass("TextLabel") or newBox:FindFirstChild("PartLabel")
        if label then
            label.Text = "Part" .. num
            label.TextScaled = true
        end
        
        SetBoxText(newBox, "")
        newBox.Parent = scrollingFrame
        return newBox
    end
    
    local function GetAllBoxesSorted()
        local boxes = {}
        for _, child in ipairs(scrollingFrame:GetChildren()) do
            if child:IsA("GuiObject") and child.Name:match("^InputTextBox(%d+)$") then
                local num = tonumber(child.Name:match("^InputTextBox(%d+)$"))
                if num then
                    table.insert(boxes, { num = num, obj = child })
                end
            end
        end
        table.sort(boxes, function(a, b)
            return a.num < b.num
        end)
        return boxes
    end
    
    local PropertyWhitelist = {
    Folder = { "Name" },
    LocalScript = { "Name", "Enabled", "Source", "RunContext" },
    ModuleScript = { "Name", "Source" },
    Script = { "Name", "Enabled", "Source", "RunContext" },
    
    StringValue = { "Name", "Value" },
    BoolValue = { "Name", "Value" },
    IntValue = { "Name", "Value" },
    NumberValue = { "Name", "Value" },
    Vector3Value = { "Name", "Value" },
    CFrameValue = { "Name", "Value" },
    Color3Value = { "Name", "Value" },
    ObjectValue = { "Name", "Value" },
    
    ScreenGui = { "Name", "Enabled", "ResetOnSpawn", "ZIndexBehavior", "DisplayOrder", "IgnoreGuiInset" },
    BillboardGui = { "Name", "Enabled", "Size", "StudsOffset", "AlwaysOnTop", "MaxDistance", "Active", "ClipsDescendants", "LightInfluence", "SizeOffset", "StudsOffsetWorldSpace" },
    SurfaceGui = { "Name", "Enabled", "Face", "SizingMode", "AlwaysOnTop", "Active", "ClipsDescendants", "LightInfluence", "PixelsPerStud", "ToolPunchThroughDistance", "ZOffset" },
    CanvasGroup = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "ClipsDescendants", "Active", "Rotation", "LayoutOrder", "GroupTransparency", "GroupColor3" },
    
    Frame = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "ClipsDescendants", "Active", "Rotation", "LayoutOrder" },
    TextLabel = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "ClipsDescendants", "Active", "Rotation", "LayoutOrder", "Text", "TextColor3", "TextSize", "Font", "FontFace", "TextScaled", "TextWrapped", "TextXAlignment", "TextYAlignment", "TextTransparency", "TextStrokeColor3", "TextStrokeTransparency", "LineHeight", "MaxVisibleGraphemes", "RichText" },
    TextButton = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "ClipsDescendants", "Active", "Rotation", "LayoutOrder", "Text", "TextColor3", "TextSize", "Font", "FontFace", "TextScaled", "TextWrapped", "TextXAlignment", "TextYAlignment", "TextTransparency", "TextStrokeColor3", "TextStrokeTransparency", "LineHeight", "MaxVisibleGraphemes", "RichText", "AutoButtonColor", "Selected" },
    TextBox = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "ClipsDescendants", "Active", "Rotation", "LayoutOrder", "Text", "TextColor3", "TextSize", "Font", "FontFace", "TextScaled", "TextWrapped", "TextXAlignment", "TextYAlignment", "TextTransparency", "PlaceholderText", "PlaceholderColor3", "ClearTextOnFocus", "MultiLine", "ShowNativeInput" },
    ImageLabel = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "ClipsDescendants", "Active", "Rotation", "LayoutOrder", "Image", "ImageColor3", "ImageTransparency", "ImageRectOffset", "ImageRectSize", "ScaleType", "SliceCenter", "SliceScale", "TileSize" },
    ImageButton = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "ClipsDescendants", "Active", "Rotation", "LayoutOrder", "Image", "ImageColor3", "ImageTransparency", "ImageRectOffset", "ImageRectSize", "ScaleType", "SliceCenter", "SliceScale", "TileSize", "AutoButtonColor", "Selected" },
    ScrollingFrame = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "ClipsDescendants", "Active", "Rotation", "LayoutOrder", "CanvasSize", "CanvasPosition", "ScrollBarThickness", "ScrollBarImageColor3", "ScrollBarImageTransparency", "ScrollingDirection", "ElasticBehavior", "HorizontalScrollBarInset", "VerticalScrollBarInset", "VerticalScrollBarPosition", "AutomaticCanvasSize" },
    VideoFrame = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "Visible", "ZIndex", "Video", "Looped", "Playing", "Volume" },
    ViewportFrame = { "Name", "Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency", "Visible", "ZIndex", "CurrentCamera", "ImageColor3", "ImageTransparency", "LightColor", "LightDirection" },
    
    UICorner = { "Name", "CornerRadius" },
    UIPadding = { "Name", "PaddingTop", "PaddingBottom", "PaddingLeft", "PaddingRight" },
    UIListLayout = { "Name", "FillDirection", "HorizontalAlignment", "VerticalAlignment", "SortOrder", "Padding", "HorizontalFlex", "VerticalFlex", "ItemLineAlignment", "Wraps" },
    UIGridLayout = { "Name", "CellSize", "CellPadding", "FillDirectionMaxCells", "StartCorner", "FillDirection", "HorizontalAlignment", "VerticalAlignment", "SortOrder" },
    UIPageLayout = { "Name", "Animated", "Circular", "EasingDirection", "EasingStyle", "FillDirection", "HorizontalAlignment", "Padding", "SortOrder", "TweenTime", "VerticalAlignment" },
    UIAspectRatioConstraint = { "Name", "AspectRatio", "AspectType", "DominantAxis" },
    UISizeConstraint = { "Name", "MaxSize", "MinSize" },
    UIScale = { "Name", "Scale" },
    UIStroke = { "Name", "Color", "Enabled", "LineJoinMode", "Thickness", "Transparency", "ApplyStrokeMode" },
    UIGradient = { "Name", "Color", "Enabled", "Offset", "Rotation", "Transparency" },
    
    BasePart = { "Name", "Size", "CFrame", "Color", "Material", "Transparency", "Reflectance", "Anchored", "CanCollide", "CastShadow", "CollisionGroup", "CanQuery", "CanTouch", "Massless", "PivotOffset" },
    Part = "BasePart",
    MeshPart = "BasePart",
    WedgePart = "BasePart",
    CornerWedgePart = "BasePart",
    TrussPart = "BasePart",
    Seat = "BasePart",
    VehicleSeat = "BasePart",
    SpawnLocation = "BasePart",
    Model = { "Name", "WorldPivot" },
    SpecialMesh = { "Name", "MeshId", "TextureId", "MeshType", "Offset", "Scale", "VertexColor" },
    BlockMesh = { "Name", "Offset", "Scale", "VertexColor" },
    CylinderMesh = { "Name", "Offset", "Scale", "VertexColor" },
    
    PointLight = { "Name", "Color", "Brightness", "Range", "Shadows", "Enabled" },
    SpotLight = { "Name", "Color", "Brightness", "Range", "Angle", "Face", "Shadows", "Enabled" },
    SurfaceLight = { "Name", "Color", "Brightness", "Range", "Face", "Shadows", "Enabled" },
    
    Decal = { "Name", "Texture", "Face", "Transparency", "Color3" },
    Texture = { "Name", "Texture", "Face", "Transparency", "Color3", "StudsPerTileU", "StudsPerTileV", "OffsetStudsU", "OffsetStudsV" },
    
    ParticleEmitter = { "Name", "Texture", "Rate", "Lifetime", "Speed", "SpreadAngle", "Enabled", "LightEmission", "LightInfluence", "Orientation", "RotSpeed", "Rotation", "Color", "Transparency", "Size" },
    Beam = { "Name", "Attachment0", "Attachment1", "Color", "Enabled", "FaceCamera", "LightEmission", "LightInfluence", "Texture", "TextureLength", "TextureMode", "TextureSpeed", "Transparency", "Width0", "Width1" },
    Trail = { "Name", "Attachment0", "Attachment1", "Color", "Enabled", "FaceCamera", "Lifetime", "LightEmission", "LightInfluence", "MaxLength", "MinLength", "Texture", "TextureLength", "TextureMode", "Transparency", "WidthScale" },
    Fire = { "Name", "Color", "Enabled", "Heat", "SecondaryColor", "Size" },
    Smoke = { "Name", "Color", "Enabled", "Opacity", "RiseVelocity", "Size" },
    Sparkles = { "Name", "SparkleColor", "Enabled" },
    Highlight = { "Name", "FillColor", "OutlineColor", "FillTransparency", "OutlineTransparency", "Enabled", "DepthMode" },
    SelectionBox = { "Name", "Color3", "LineThickness", "SurfaceColor3", "SurfaceTransparency", "Transparency", "Visible" },
    
    Sound = { "Name", "SoundId", "Volume", "PlaybackSpeed", "Looped", "Playing", "RollOffMaxDistance", "RollOffMinDistance", "RollOffMode" },
    SoundGroup = { "Name", "Volume" },
    
    Attachment = { "Name", "CFrame", "Visible" },
    AlignPosition = { "Name", "Enabled", "MaxForce", "MaxVelocity", "Responsiveness", "Mode" },
    AlignOrientation = { "Name", "Enabled", "MaxTorque", "MaxAngularVelocity", "Responsiveness", "Mode" },
    LinearVelocity = { "Name", "Enabled", "MaxForce", "VectorVelocity", "RelativeTo" },
    AngularVelocity = { "Name", "Enabled", "MaxTorque", "AngularVelocity", "RelativeTo" },
    }
    
    local function cleanRichText(val)
        if type(val) == "string" then
            return (string.gsub(val, "<[^>]->", ""))
        end
        return val
    end
    
    local function getScriptSource(scriptInst)
        if scriptInst:IsA("TextBox") then
            return scriptInst.Text
        elseif scriptInst:IsA("StringValue") then
            return scriptInst.Value
        end
        
        for _, child in ipairs(scriptInst:GetChildren()) do
            if child:IsA("TextBox") then
                local text = (child.ContentText ~= "") and child.ContentText or child.Text
                if text and text ~= "" then
                    return text
                end
            elseif child:IsA("StringValue") and child.Value ~= "" then
                return child.Value
            elseif child:IsA("TextLabel") then
                local text = (child.ContentText ~= "") and child.ContentText or child.Text
                if text and text ~= "" then
                    return text
                end
            end
        end
        
        local attrCode = scriptInst:GetAttribute("Source") or scriptInst:GetAttribute("Code")
        if attrCode then
            return tostring(attrCode)
        end
        
        return ""
    end
    
    local function getPropertiesForClass(className)
        local props = PropertyWhitelist[className]
        if type(props) == "string" then
            return PropertyWhitelist[props]
        end
        return props
    end
    
    local function serializeValue(val)
        local t = typeof(val)
        if t == "Vector3" then
            return { t = "v3", x = val.X, y = val.Y, z = val.Z }
        elseif t == "Vector2" then
            return { t = "v2", x = val.X, y = val.Y }
        elseif t == "UDim2" then
            return { t = "u2", xs = val.X.Scale, xo = val.X.Offset, ys = val.Y.Scale, yo = val.Y.Offset }
        elseif t == "UDim" then
            return { t = "u1", s = val.Scale, o = val.Offset }
        elseif t == "Color3" then
            return { t = "c3", r = val.R, g = val.G, b = val.B }
        elseif t == "CFrame" then
            return { t = "cf", c = { val:GetComponents() } }
        elseif t == "EnumItem" then
            return { t = "e", e = tostring(val.EnumType), n = val.Name }
        elseif t == "string" then
            return cleanRichText(val)
        elseif t == "number" or t == "boolean" then
            return val
        end
        return nil
    end
    
    local function deserializeValue(val)
        if type(val) == "table" and val.t then
            if val.t == "v3" then
                return Vector3.new(val.x, val.y, val.z)
            elseif val.t == "v2" then
                return Vector2.new(val.x, val.y)
            elseif val.t == "u2" then
                return UDim2.new(val.xs, val.xo, val.ys, val.yo)
            elseif val.t == "u1" then
                return UDim.new(val.s, val.o)
            elseif val.t == "c3" then
                return Color3.new(val.r, val.g, val.b)
            elseif val.t == "cf" then
                return CFrame.new(unpack(val.c))
            elseif val.t == "e" then
                local enumType = Enum[val.e]
                return enumType and enumType[val.n]
            end
        elseif type(val) == "string" then
            return cleanRichText(val)
        end
        return val
    end
    
    local function serializeInstance(inst)
        local scriptTypeAttr = inst:GetAttribute("ScriptType")
        local className = scriptTypeAttr or inst.ClassName
        local isScript = (className == "LocalScript" or className == "Script" or className == "ModuleScript")
        
        if isScript then
            local origName = inst:GetAttribute("OriginalName") or inst.Name:gsub("%s*%[" .. className .. "%]$", "")
            local rawCode = getScriptSource(inst)
            local isEmpty = (not rawCode) or rawCode == "" or string.match(rawCode, "^%s*$") ~= nil
            
            local parentPath = inst.Parent and ("game." .. inst.Parent:GetFullName()) or "game"
            local headerComment = "-- Target Parent: " .. parentPath .. "\n"
            
            local code = ""
            if not isEmpty then
                if string.match(rawCode, "^%s*%-%-%s*Target Parent:") or string.match(rawCode, "^%s*%-%-%s*Parent:") then
                    code = rawCode
                else
                    code = headerComment .. rawCode
                end
            end
            
            local childrenTable = {}
            local hasChildren = false
            for _, child in ipairs(inst:GetChildren()) do
                local childData = serializeInstance(child)
                if childData then
                    table.insert(childrenTable, childData)
                    hasChildren = true
                end
            end
            
            if isEmpty and not hasChildren then
                return nil
            end
            
            if not isEmpty then
                AddScriptToSaves(origName, className, code)
            end
            
            local data = { c = className, p = { Name = origName, Source = code } }
            if hasChildren then
                data.k = childrenTable
            end
            return data
        end
        
        local classProps = getPropertiesForClass(className)
        if not classProps then
            return nil
        end
        
        local data = { c = className }
        local propsTable = {}
        local hasProps = false
        
        for _, propName in ipairs(classProps) do
            local success, val = pcall(function()
                return inst[propName]
            end)
            if success and val ~= nil then
                propsTable[propName] = serializeValue(val)
                hasProps = true
            end
        end
        if hasProps then
            data.p = propsTable
        end
        
        local childrenTable = {}
        local hasChildren = false
        for _, child in ipairs(inst:GetChildren()) do
            local childData = serializeInstance(child)
            if childData then
                table.insert(childrenTable, childData)
                hasChildren = true
            end
        end
        if hasChildren then
            data.k = childrenTable
        end
        
        return data
    end
    
    local function deserializeInstance(data, parent)
        local isScriptClass = (data.c == "LocalScript" or data.c == "Script" or data.c == "ModuleScript")
        local newInst = nil
        
        if isScriptClass then
            local scriptName = (data.p and data.p.Name) or "Script"
            local sourceCode = tostring((data.p and data.p.Source) or "")
            local isEmpty = sourceCode == "" or string.match(sourceCode, "^%s*$") ~= nil
            local hasChildren = data.k ~= nil and #data.k > 0
            
            if isEmpty and not hasChildren then
                return nil
            end
            
            newInst = Instance.new("StringValue")
            newInst.Name = string.format("%s [%s]", scriptName, data.c)
            newInst.Value = sourceCode
            
            newInst:SetAttribute("ScriptType", data.c)
            newInst:SetAttribute("OriginalName", scriptName)
            
            if not isEmpty then
                AddScriptToSaves(scriptName, data.c, sourceCode)
            end
            
            if data.p then
                for propName, rawVal in pairs(data.p) do
                    if propName ~= "Name" and propName ~= "Source" then
                        local val = deserializeValue(rawVal)
                        pcall(function()
                            newInst:SetAttribute(propName, val)
                        end)
                    end
                end
            end
        else
            local success, inst = pcall(function()
                return Instance.new(data.c)
            end)
            if not success or not inst then
                return nil
            end
            newInst = inst
            
            if data.p then
                for propName, rawVal in pairs(data.p) do
                    local val = deserializeValue(rawVal)
                    pcall(function()
                        newInst[propName] = val
                    end)
                end
            end
        end
        
        if data.k then
            for _, childData in ipairs(data.k) do
                deserializeInstance(childData, newInst)
            end
        end
        
        newInst.Parent = parent
        return newInst
    end
    
    local function isValidSCSItem(inst)
        if inst:IsA("Folder") or inst:IsA("LocalScript") or inst:IsA("ModuleScript") or inst:IsA("Script") then
            return true
        end
        if (inst:IsA("TextBox") or inst:IsA("StringValue")) and inst:GetAttribute("ScriptType") ~= nil then
            return true
        end
        if inst:IsA("GuiObject") or inst:IsA("LayerCollector") or inst:IsA("UIComponent") or inst:IsA("UIGridStyleLayout") or inst:IsA("UIConstraint") then
            return true
        end
        return false
    end
    
    local function getFilteredTargets()
        local targets = {}
        local added = {}
        
        local function addTarget(inst)
            if inst and not added[inst] then
                added[inst] = true
                table.insert(targets, inst)
            end
        end
        
        local scs = StarterPlayer:FindFirstChild("StarterCharacterScripts")
        if scs then
            for _, child in ipairs(scs:GetChildren()) do
                if isValidSCSItem(child) then
                    addTarget(child)
                end
            end
        end
        
        local servicesToScan = {
        workspace,
        game:GetService("ReplicatedStorage"),
        game:GetService("StarterGui"),
        StarterPlayer,
        game:GetService("Lighting"),
        }
        
        for _, service in ipairs(servicesToScan) do
            for _, descendant in ipairs(service:GetDescendants()) do
                if descendant.Name == "Plugins" then
                    addTarget(descendant)
                end
            end
        end
        
        return targets
    end
    
    local function getObjectFromPath(pathStr)
        if not pathStr or pathStr == "" then
            return nil
        end
        local cleanPath = cleanRichText(pathStr)
        local current = game
        local segments = {}
        for segment in string.gmatch(cleanPath, "[^%.]+") do
            local cleanSegment = string.gsub(segment, "[\"%[%]]", "")
            cleanSegment = string.match(cleanSegment, "^%s*(.-)%s*$")
            if cleanSegment ~= "" then
                table.insert(segments, cleanSegment)
            end
        end
        if segments[1] == "game" then
            table.remove(segments, 1)
        end
        for _, name in ipairs(segments) do
            current = current:FindFirstChild(name)
            if not current then
                return nil
            end
        end
        return current
    end
    
    local function PopulateJsonToBoxes(jsonString, compress, maxCharsPerBox)
        maxCharsPerBox = maxCharsPerBox or 8000
        
        local finalPayload = jsonString
        if compress then
            printProgress(0, 100, "Starting LZW compression...")
            finalPayload = FastCompress.Compress(jsonString, function(percent, current, total)
                local step = math.floor((percent / 100) * 15)
                printProgress(step, 100, string.format("Compressing LZW: %d%% (%d/%d bytes)", percent, current, total))
            end)
            printProgress(15, 100, string.format("Compression finished (%d chars)", #finalPayload))
        end
        
        local totalLength = #finalPayload
        local totalParts = math.ceil(totalLength / maxCharsPerBox)
        
        printProgress(15, 100, string.format("Splitting into %d parts", totalParts))
        
        for partIdx = 1, totalParts do
            local startPos = (partIdx - 1) * maxCharsPerBox + 1
            local endPos = math.min(partIdx * maxCharsPerBox, totalLength)
            local chunk = string.sub(finalPayload, startPos, endPos)
            
            local targetBox = CreateNewBox(partIdx)
            SetBoxText(targetBox, chunk)
            
            local currentProgress = 15 + math.floor((partIdx / totalParts) * 85)
            printProgress(currentProgress, 100, string.format("Loaded Part%d", partIdx))
        end
        
        printProgress(100, 100, "Export completed successfully!")
    end
    
    local function SaveAllToBoxes()
        ClearScriptsSaves()
        
        printProgress(0, 100, "Collecting objects...")
        local targets = getFilteredTargets()
        local serializedTree = {}
        
        for idx, target in ipairs(targets) do
            local data = serializeInstance(target)
            if data then
                table.insert(serializedTree, data)
            end
            printProgress(math.floor((idx / #targets) * 50), 100, "Serializing objects...")
        end
        
        local fullJson = HttpService:JSONEncode(serializedTree)
        PopulateJsonToBoxes(fullJson, true, 8000)
    end
    
    local function SaveByPathToBoxes(pathText)
        ClearScriptsSaves()
        
        local targetObject = getObjectFromPath(pathText)
        if not targetObject then
            warn("[Serializer] Object path not found: " .. tostring(pathText))
            return
        end
        
        printProgress(0, 100, "Serializing object from Path...")
        local data = serializeInstance(targetObject)
        if not data then
            warn("[Serializer] Failed to serialize object at path: " .. tostring(pathText))
            return
        end
        
        local fullJson = HttpService:JSONEncode({ data })
        PopulateJsonToBoxes(fullJson, true, 8000)
    end
    
    local function LoadFromAllBoxes()
        ClearScriptsSaves()
        
        local sortedBoxes = GetAllBoxesSorted()
        if #sortedBoxes == 0 then
            warn("[Serializer] No InputTextBox found!")
            return false
        end
        
        printProgress(0, 100, "Combining data from parts...")
        local chunkList = {}
        for idx, item in ipairs(sortedBoxes) do
            local text = GetBoxText(item.obj)
            if text and text ~= "" then
                table.insert(chunkList, text)
            end
            printProgress(math.floor((idx / #sortedBoxes) * 30), 100, string.format("Read Part%d", item.num))
        end
        
        local fullPayload = table.concat(chunkList)
        if fullPayload == "" then
            warn("[Serializer] All input boxes are empty!")
            return false
        end
        
        printProgress(35, 100, "Decompressing data...")
        local decompressed = FastCompress.Decompress(fullPayload, function(percent)
            local step = 35 + math.floor((percent / 100) * 15)
            printProgress(step, 100, string.format("Decompressing LZW: %d%%", percent))
        end)
        local rawJson = decompressed or fullPayload
        
        printProgress(50, 100, "Decoding JSON...")
        local success, dataTree = pcall(function()
            return HttpService:JSONDecode(rawJson)
        end)
        if not success or type(dataTree) ~= "table" then
            warn("[Serializer] Invalid JSON or missing data!")
            return false
        end
        
        local targetFolder = workspace:FindFirstChild("LoadedData") or Instance.new("Folder")
        targetFolder.Name = "LoadedData"
        targetFolder.Parent = workspace
        
        local loadedCount = 0
        local totalItems = #dataTree
        for idx, objData in ipairs(dataTree) do
            local inst = deserializeInstance(objData, targetFolder)
            if inst then
                loadedCount = loadedCount + 1
            end
            local currentProg = 50 + math.floor((idx / totalItems) * 50)
            printProgress(currentProg, 100, "Restoring instances...")
        end
        
        printProgress(100, 100, string.format("Import completed: Restored %d objects into workspace.LoadedData", loadedCount))
        return true
    end
    
    local pathMode = false
    
    toggleButton.MouseButton1Click:Connect(function()
        pathMode = not pathMode
        if pathMode then
            toggleButton.BackgroundColor3 = Color3.fromRGB(180, 255, 180)
            inputTextBoxPath.Visible = true
        else
            toggleButton.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
            inputTextBoxPath.Visible = false
        end
    end)
    
    copyButton.MouseButton1Click:Connect(function()
        if pathMode then
            SaveByPathToBoxes(inputTextBoxPath.Text)
        else
            SaveAllToBoxes()
        end
    end)
    
    loadButton.MouseButton1Click:Connect(function()
        LoadFromAllBoxes()
    end)
    
    clearButton.MouseButton1Click:Connect(function()
        local sortedBoxes = GetAllBoxesSorted()
        for _, item in ipairs(sortedBoxes) do
            SetBoxText(item.obj, "")
        end
        inputTextBoxPath.Text = ""
        ClearScriptsSaves()
    end)
    
    if cloneButton then
        cloneButton.MouseButton1Click:Connect(function()
            local sortedBoxes = GetAllBoxesSorted()
            local maxNum = #sortedBoxes > 0 and sortedBoxes[#sortedBoxes].num or 1
            CreateNewBox(maxNum + 1)
        end)
    end
    
    if deletePButton then
        deletePButton.MouseButton1Click:Connect(function()
            local sortedBoxes = GetAllBoxesSorted()
            if #sortedBoxes > 0 then
                local highestItem = sortedBoxes[#sortedBoxes]
                if highestItem.num > 1 and highestItem.obj.Name ~= "InputTextBox1" then
                    highestItem.obj:Destroy()
                end
            end
        end)
    end
    
    CreateNewBox(1)
    
