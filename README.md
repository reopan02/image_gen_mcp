# Image Generation MCP Server

An MCP (Model Context Protocol) server that provides image generation and editing capabilities using the Nano Banana AI model.

## Features

- **Generate Images**: Create images from text prompts
- **Edit Images**: Modify images using reference images and text descriptions
- **Task Management**: Check status, list, and manage generation tasks
- **Flexible Configuration**: Multiple aspect ratios, resolutions, and batch generation
- **Full API Coverage**: Complete access to all image generation API endpoints

## Tools

### `image_gen_create`
Generate new images from a text prompt.

**Parameters:**
- `prompt` (string, required): Text description of the image to generate
- `aspect_ratio` (optional): Image aspect ratio (1:1, 3:2, 2:3, 3:4, 4:3, 16:9, 9:16, 21:9, 4:5, 5:4, 1:4, 4:1, 1:8, 8:1)
- `image_size` (optional): Resolution (1K, 2K, 4K)
- `count` (optional): Number of images to generate (1-4)

**Returns:** Task information with task ID for status tracking

### `image_gen_edit`
Edit images using reference images and a text prompt.

**Parameters:**
- `prompt` (string, required): Text description of the desired edit
- `reference_image_ids` (array, required): File IDs of reference images (1-14 images)
- `aspect_ratio` (optional): Output aspect ratio
- `image_size` (optional): Output resolution
- `count` (optional): Number of variations

**Returns:** Task information with task ID

### `image_gen_status`
Check the status of an image generation task.

**Parameters:**
- `task_id` (string, required): The task ID to check

**Returns:** Current task status, progress, and output file IDs when completed

### `image_gen_list`
List all image generation tasks with pagination.

**Parameters:**
- `limit` (optional): Maximum tasks to return (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Returns:** List of tasks with summary information

### `image_gen_detail`
Get detailed information about a specific task.

**Parameters:**
- `task_id` (string, required): The task ID to query

**Returns:** Complete task information including all parameters and outputs

### `image_gen_delete`
Delete one or more image generation tasks.

**Parameters:**
- `task_ids` (array, required): Task IDs to delete

**Returns:** Confirmation of deleted tasks

### `image_gen_cancel`
Cancel a running image generation task.

**Parameters:**
- `task_id` (string, required): The task ID to cancel

**Returns:** Confirmation of cancellation

### `image_gen_config`
Get available configuration options (aspect ratios, resolutions, models).

**Returns:** Complete configuration including supported options

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Setup

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Create a `.env` file based on `.env.example`:
```env
IMAGE_API_URL=https://your-api-url.com
USER_OPENID=your-user-openid
```

## Configuration

### Environment Variables

- `IMAGE_API_URL`: The base URL for the image generation API
- `USER_OPENID`: Your user authentication token

### MCP Client Configuration

Add this server to your MCP client configuration (e.g., Claude Desktop, Cline):

**For stdio transport:**

```json
{
  "mcpServers": {
    "image-generation": {
      "command": "node",
      "args": ["/absolute/path/to/mcp_build/dist/index.js"],
      "env": {
        "IMAGE_API_URL": "https://your-api-url.com",
        "USER_OPENID": "your-user-openid"
      }
    }
  }
}
```

## Usage

Once configured in your MCP client, you can use natural language to:

- "Generate an image of a sunset over the ocean"
- "Create 4 variations of a cat wearing a hat"
- "Edit this image to add flowers" (with reference image IDs)
- "Check the status of task abc123"
- "List my recent image generation tasks"
- "Show me the available configuration options"

## Development

### Project Structure

```
mcp_build/
├── src/
│   ├── index.ts      # MCP server entry point
│   ├── client.ts     # Image generation API client
│   └── types.ts      # TypeScript type definitions
├── dist/             # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env             # Environment configuration
```

### Building

```bash
npm run build
```

### Testing

You can test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## API Reference

This server wraps the Nano Banana image generation API with the following capabilities:

- **Models**: Nano Banana (default)
- **Max Input Images**: Up to 14 reference images for editing
- **Aspect Ratios**: 14 different aspect ratios supported
- **Resolutions**: 1K, 2K, 4K
- **Batch Generation**: 1-4 images per task

## License

MIT

## Support

For issues or questions about:
- **MCP Server**: Open an issue in this repository
- **Image Generation API**: Contact your API provider
