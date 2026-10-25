local scrollingFrame = script.Parent
 
scrollingFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
scrollingFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
scrollingFrame.ScrollBarThickness = 6
scrollingFrame.ClipsDescendants = true
 
local padding = scrollingFrame:FindFirstChildOfClass("UIPadding") or Instance.new("UIPadding")
padding.Parent = scrollingFrame
padding.PaddingTop = UDim.new(0, 6)
padding.PaddingBottom = UDim.new(0, 6)
padding.PaddingLeft = UDim.new(0, 6)
padding.PaddingRight = UDim.new(0, 6)
 
local grid = scrollingFrame:FindFirstChildOfClass("UIGridLayout") or Instance.new("UIGridLayout")
grid.Parent = scrollingFrame
grid.SortOrder = Enum.SortOrder.LayoutOrder
grid.FillDirection = Enum.FillDirection.Horizontal
grid.FillDirectionMaxCells = 2
grid.HorizontalAlignment = Enum.HorizontalAlignment.Center
grid.VerticalAlignment = Enum.VerticalAlignment.Top
grid.CellPadding = UDim2.fromOffset(6, 70)
 
local BUTTON_HEIGHT = 60
local function updateLayout()
    local totalWidth = scrollingFrame.AbsoluteSize.X
    - padding.PaddingLeft.Offset
    - padding.PaddingRight.Offset
    - grid.CellPadding.X.Offset
    
    local cellWidth = math.floor(totalWidth / 2)
    grid.CellSize = UDim2.fromOffset(cellWidth, BUTTON_HEIGHT)
end

local function setupButton(obj)
    if obj:IsA("TextButton") then
        obj.AutomaticSize = Enum.AutomaticSize.None
        obj.Size = UDim2.new(1, 0, 1, 0)
    end
end

for _, obj in ipairs(scrollingFrame:GetChildren()) do
    setupButton(obj)
end

scrollingFrame.ChildAdded:Connect(function(obj)
    setupButton(obj)
    task.defer(updateLayout)
end)

scrollingFrame.ChildRemoved:Connect(function(obj)
    if obj:IsA("TextButton") then
        task.defer(updateLayout)
    end
end)

scrollingFrame:GetPropertyChangedSignal("AbsoluteSize"):Connect(updateLayout)
updateLayout()
