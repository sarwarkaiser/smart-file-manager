# Smart File Manager

An Obsidian plugin that automatically organizes your notes by moving them to folders based on frontmatter properties. Customize which property to use, add base folders, create nested subfolders, and more!

## Features

- 🎯 **Customizable Property**: Choose any frontmatter property (topic, tag, category, etc.)
- 📁 **Base Folder Support**: Organize files into a base folder structure
- 📂 **Subfolder Support**: Create nested folders using multiple properties
- 🔧 **Smart Normalization**: Automatically normalize folder names for compatibility
- ⚙️ **Flexible Settings**: Enable/disable features as needed
- 🚀 **Auto-create Folders**: Automatically create folders if they don't exist

## Installation

### From Obsidian Community Plugins (Recommended)

1. Open Obsidian Settings
2. Go to Community Plugins
3. Click "Browse" and search for "Smart File Manager"
4. Click Install, then Enable

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/sarwarkaiser/smart-file-manager/releases)
2. Extract the zip file to your vault's `.obsidian/plugins/` directory
3. Reload Obsidian or restart the app
4. Enable the plugin in Settings → Community Plugins

## Usage

### Basic Usage

1. Add a property to your markdown file's frontmatter (default is `topic`):

```yaml
---
topic: soccer
---
```

2. When you save the file, it will automatically be moved to the `soccer` folder.

### Custom Property

You can use any frontmatter property. For example, using `category`:

1. Go to Settings → Smart File Manager
2. Set "Property Name" to `category`
3. Add to your file:

```yaml
---
category: work
---
```

The file will be moved to the `work` folder.

### Base Folder

Organize files into a base folder:

1. In settings, set "Base Folder" to `Organized`
2. With `topic: soccer`, the file will be moved to `Organized/soccer/`

### Subfolders

Create nested folder structures:

1. Enable "Use Subfolders" in settings
2. Set "Subfolder Property" to `subtopic` (or any property)
3. Add to your file:

```yaml
---
topic: sports
subtopic: soccer
---
```

The file will be moved to `sports/soccer/`

### Complete Example

With these settings:
- Base Folder: `Notes`
- Property Name: `category`
- Use Subfolders: Enabled
- Subfolder Property: `project`

```yaml
---
category: work
project: website
---
```

The file will be moved to: `Notes/work/website/`

## Settings

Access settings via: **Settings → Smart File Manager**

### Available Options

- **Enable Plugin**: Turn automatic file moving on/off
- **Property Name**: The frontmatter property to use for folder organization
- **Base Folder**: Optional base folder path (leave empty for vault root)
- **Use Subfolders**: Enable nested subfolders based on additional property
- **Subfolder Property**: Property name for subfolder creation
- **Normalize Folder Names**: Convert to lowercase and remove special characters
- **Auto-create Folders**: Automatically create folders if they don't exist

## Examples

### Example 1: Simple Organization
```yaml
---
topic: soccer
---
```
→ Moves to: `soccer/`

### Example 2: With Base Folder
```yaml
---
category: work
---
```
Base Folder: `Notes`
→ Moves to: `Notes/work/`

### Example 3: With Subfolders
```yaml
---
topic: sports
subtopic: soccer
---
```
→ Moves to: `sports/soccer/`

### Example 4: Complete Setup
```yaml
---
category: personal
project: journal
---
```
Base Folder: `Documents`
→ Moves to: `Documents/personal/journal/`

## How It Works

1. The plugin monitors metadata changes in your markdown files
2. When a file is saved or created, it checks the specified frontmatter property
3. If the property exists, it determines the target folder path
4. The file is automatically moved to the appropriate folder
5. Folders are created automatically if they don't exist (if enabled)

## Troubleshooting

### Files Not Moving

- Check that the plugin is enabled in settings
- Verify the property name matches exactly (case-sensitive)
- Ensure the frontmatter property has a value
- Check the console for error messages (Ctrl/Cmd + Shift + I)

### Invalid Folder Names

- Enable "Normalize Folder Names" to automatically clean folder names
- Avoid special characters in property values
- The plugin will skip invalid folder names and log a warning

### Infinite Loops

The plugin includes protection against infinite loops. If you experience issues:
- Restart Obsidian
- Check that files aren't being moved to the same location repeatedly

## Building from Source

```bash
# Install dependencies
npm install

# Build for development (with watch mode)
npm run dev

# Build for production
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have feature requests, please open an issue on GitHub.

---

Made with ❤️ for the Obsidian community
