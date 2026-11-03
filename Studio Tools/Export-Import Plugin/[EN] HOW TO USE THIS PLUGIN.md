# Export-Import Plugin — How to Use

[Tiếng Việt](https://github.com/minhReal/SieuSV-Storage/blob/main/Export-Import-Plugin/[VN]%20HOW%20TO%20USE%20THIS%20PLUGIN.md) · English

This plugin lets you **export / import plugins as code strings**, so you can share and install plugins right on your phone **without building a model on a computer** (quite annoying).

---

## First: understand 2 concepts

### 1. What is `Part` used for?

When you export or import one or multiple plugins, the **Part** textboxes hold the code inside each Part.

- Use **Add a Part** to add a new Part.
- Use **Delete a Part** to remove one you don't need.

### 2. What are `Script Sources` used for?

> **Limitation:** The plugin cannot copy the source code inside `Script` / `LocalScript` / `ModuleScript`, because it causes many errors.

---

## 1. Export

This button exports **everything** inside `StarterCharacterScripts`.

To export a specific object, use the **Target Object** button and enter its path, for example:

```text
StarterCharacterScripts.MyPlugin
```

## 2. Import

This button imports a plugin into your game without having to create a model using a computer (quite annoying).

1. Get the plugin's **code string**.
2. Paste it into the **Part** textboxes (there can be multiple Parts).
3. Press **Import** and **wait** until it finishes.

---

## Summary

| Button | Function |
| --- | --- |
| **Export** | Export everything in `StarterCharacterScripts` |
| **Target Object** | Pick a specific object to export |
| **Add a Part** | Add a Part textbox |
| **Delete a Part** | Remove a Part textbox |
| **Import** | Import a plugin from a code string |
