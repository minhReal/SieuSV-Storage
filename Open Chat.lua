--[[
      DESC: You can open chat everywhere!
       VER: 26.1
--]]
local S=game:GetService("StarterGui")
local R=game:GetService("RunService")
local B=script.Parent
local ON=Color3.fromRGB(180,255,180)
local OFF=Color3.fromRGB(255,255,255)

local function update()
    local state=S:GetCoreGuiEnabled(Enum.CoreGuiType.Chat)
    B.BackgroundColor3=state and ON or OFF
end

B.Activated:Connect(function()
    local state=S:GetCoreGuiEnabled(Enum.CoreGuiType.Chat)
    S:SetCoreGuiEnabled(Enum.CoreGuiType.Chat,not state)
end)

R.RenderStepped:Connect(update)
update()

