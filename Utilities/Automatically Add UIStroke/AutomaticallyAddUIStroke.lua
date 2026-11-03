local p=script.Parent
local function a(o)
    if(o:IsA("TextButton")or o:IsA("ImageButton"))and not o:FindFirstChild("ButtonOutline")then
        local s=Instance.new("UIStroke")
        s.Name="ButtonOutline"
        s.Thickness=1
        s.Color=Color3.fromRGB(0,0,0)
        s.Transparency=0
        s.ApplyStrokeMode=Enum.ApplyStrokeMode.Border
        s.Parent=o
    end
end
for _,o in ipairs(p:GetChildren())do a(o)end
p.ChildAdded:Connect(a)
