# ObjectExporter – Supported Classes and Properties

Every exported instance keeps its `Name`. The properties below are the only other values saved for each class. Any property not listed is not exported.

Scripts (`LocalScript`, `Script`, `ModuleScript`) and `StringValue` with a `ScriptType` attribute save their source code instead of properties.

Classes not listed here are skipped, and so is everything inside them.

## Scripts and Values

| Class | Properties |
|---|---|
| Folder | (none) |
| LocalScript | source |
| Script | source |
| ModuleScript | source |
| StringValue | Value |
| BoolValue | Value |
| IntValue | Value |
| NumberValue | Value |
| Vector3Value | Value |
| CFrameValue | Value |
| Color3Value | Value |
| ObjectValue | Value |

## GUI Containers

| Class | Properties |
|---|---|
| ScreenGui | Enabled, ResetOnSpawn, ZIndexBehavior, DisplayOrder, IgnoreGuiInset |
| BillboardGui | Enabled, Size, StudsOffset, AlwaysOnTop, MaxDistance, Active, ClipsDescendants, LightInfluence, SizeOffset, StudsOffsetWorldSpace |
| SurfaceGui | Enabled, Face, SizingMode, AlwaysOnTop, Active, ClipsDescendants, LightInfluence, PixelsPerStud, ToolPunchThroughDistance, ZOffset |
| CanvasGroup | Size, Position, AnchorPoint, BackgroundColor3, BackgroundTransparency, BorderColor3, BorderSizePixel, Visible, ZIndex, ClipsDescendants, Active, Rotation, LayoutOrder, GroupTransparency, GroupColor3 |
| Frame | Size, Position, AnchorPoint, BackgroundColor3, BackgroundTransparency, BorderColor3, BorderSizePixel, Visible, ZIndex, ClipsDescendants, Active, Rotation, LayoutOrder |
| TextLabel | Frame properties + Text, TextColor3, TextSize, Font, FontFace, TextScaled, TextWrapped, TextXAlignment, TextYAlignment, TextTransparency, TextStrokeColor3, TextStrokeTransparency, LineHeight, MaxVisibleGraphemes, RichText |
| TextButton | TextLabel properties + AutoButtonColor, Selected |
| TextBox | Frame properties + Text, TextColor3, TextSize, Font, FontFace, TextScaled, TextWrapped, TextXAlignment, TextYAlignment, TextTransparency, PlaceholderText, PlaceholderColor3, ClearTextOnFocus, MultiLine, ShowNativeInput |
| ImageLabel | Frame properties + Image, ImageColor3, ImageTransparency, ImageRectOffset, ImageRectSize, ScaleType, SliceCenter, SliceScale, TileSize |
| ImageButton | ImageLabel properties + AutoButtonColor, Selected |
| ScrollingFrame | Frame properties + CanvasSize, CanvasPosition, ScrollBarThickness, ScrollBarImageColor3, ScrollBarImageTransparency, ScrollingDirection, ElasticBehavior, HorizontalScrollBarInset, VerticalScrollBarInset, VerticalScrollBarPosition, AutomaticCanvasSize |
| VideoFrame | Size, Position, AnchorPoint, BackgroundColor3, BackgroundTransparency, Visible, ZIndex, Video, Looped, Playing, Volume |
| ViewportFrame | Size, Position, AnchorPoint, BackgroundColor3, BackgroundTransparency, Visible, ZIndex, CurrentCamera, ImageColor3, ImageTransparency, LightColor, LightDirection |

"Frame properties" = Size, Position, AnchorPoint, BackgroundColor3, BackgroundTransparency, BorderColor3, BorderSizePixel, Visible, ZIndex, ClipsDescendants, Active, Rotation, LayoutOrder.

## UI Modifiers

| Class | Properties |
|---|---|
| UICorner | CornerRadius |
| UIPadding | PaddingTop, PaddingBottom, PaddingLeft, PaddingRight |
| UIListLayout | FillDirection, HorizontalAlignment, VerticalAlignment, SortOrder, Padding, HorizontalFlex, VerticalFlex, ItemLineAlignment, Wraps |
| UIGridLayout | CellSize, CellPadding, FillDirectionMaxCells, StartCorner, FillDirection, HorizontalAlignment, VerticalAlignment, SortOrder |
| UIPageLayout | Animated, Circular, EasingDirection, EasingStyle, FillDirection, HorizontalAlignment, Padding, SortOrder, TweenTime, VerticalAlignment |
| UIAspectRatioConstraint | AspectRatio, AspectType, DominantAxis |
| UISizeConstraint | MaxSize, MinSize |
| UIScale | Scale |
| UIStroke | Color, Enabled, LineJoinMode, Thickness, Transparency, ApplyStrokeMode |
| UIGradient | Color, Enabled, Offset, Rotation, Transparency |

## Parts and Models

| Class | Properties |
|---|---|
| Part | Size, CFrame, Color, Material, Transparency, Reflectance, Anchored, CanCollide, CastShadow, CollisionGroup, CanQuery, CanTouch, Massless, PivotOffset |
| MeshPart | Part properties |
| WedgePart | Part properties |
| CornerWedgePart | Part properties |
| TrussPart | Part properties |
| Seat | Part properties |
| VehicleSeat | Part properties |
| SpawnLocation | Part properties |
| Model | WorldPivot |

## Meshes, Lights and Effects

| Class | Properties |
|---|---|
| SpecialMesh | MeshId, TextureId, MeshType, Offset, Scale, VertexColor |
| BlockMesh | Offset, Scale, VertexColor |
| CylinderMesh | Offset, Scale, VertexColor |
| PointLight | Color, Brightness, Range, Shadows, Enabled |
| SpotLight | Color, Brightness, Range, Angle, Face, Shadows, Enabled |
| SurfaceLight | Color, Brightness, Range, Face, Shadows, Enabled |
| Decal | Texture, Face, Transparency, Color3 |
| Texture | Texture, Face, Transparency, Color3, StudsPerTileU, StudsPerTileV, OffsetStudsU, OffsetStudsV |
| ParticleEmitter | Texture, Rate, Lifetime, Speed, SpreadAngle, Enabled, LightEmission, LightInfluence, Orientation, RotSpeed, Rotation, Color, Transparency, Size |
| Beam | Attachment0, Attachment1, Color, Enabled, FaceCamera, LightEmission, LightInfluence, Texture, TextureLength, TextureMode, TextureSpeed, Transparency, Width0, Width1 |
| Trail | Attachment0, Attachment1, Color, Enabled, FaceCamera, Lifetime, LightEmission, LightInfluence, MaxLength, MinLength, Texture, TextureLength, TextureMode, Transparency, WidthScale |
| Fire | Color, Enabled, Heat, SecondaryColor, Size |
| Smoke | Color, Enabled, Opacity, RiseVelocity, Size |
| Sparkles | SparkleColor, Enabled |
| Highlight | FillColor, OutlineColor, FillTransparency, OutlineTransparency, Enabled, DepthMode |
| SelectionBox | Color3, LineThickness, SurfaceColor3, SurfaceTransparency, Transparency, Visible |

## Sound and Constraints

| Class | Properties |
|---|---|
| Sound | SoundId, Volume, PlaybackSpeed, Looped, Playing, RollOffMaxDistance, RollOffMinDistance, RollOffMode |
| SoundGroup | Volume |
| Attachment | CFrame, Visible |
| AlignPosition | Enabled, MaxForce, MaxVelocity, Responsiveness, Mode |
| AlignOrientation | Enabled, MaxTorque, MaxAngularVelocity, Responsiveness, Mode |
| LinearVelocity | Enabled, MaxForce, VectorVelocity, RelativeTo |
| AngularVelocity | Enabled, MaxTorque, AngularVelocity, RelativeTo |

## Notes

- A property that cannot be read or written is skipped without an error.
