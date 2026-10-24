import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import { ImageGenerationClient } from './client.js';
import type { TaskInfo } from './types.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const API_URL = process.env.IMAGE_API_URL;
const USER_OPENID = process.env.USER_OPENID;

if (!API_URL) {
  throw new Error('IMAGE_API_URL environment variable is required');
}

if (!USER_OPENID) {
  throw new Error('USER_OPENID environment variable is required');
}

// Initialize API client
const client = new ImageGenerationClient(API_URL, USER_OPENID);

// Create MCP server
const server = new McpServer({
  name: 'image-generation-mcp-server',
  version: '1.0.0'
});

/**
 * Format task information as markdown
 */
function formatTaskMarkdown(task: TaskInfo): string {
  const statusEmoji = {
    processing: '⏳',
    completed: '✅',
    failed: '❌',
    cancelled: '🚫',
    queued: '⏸️'
  };

  let output = `${statusEmoji[task.status] || '❓'} **Task: ${task.taskId}**\n\n`;
  output += `**Status:** ${task.status}\n`;
  output += `**Progress:** ${task.progress}%\n`;
  output += `**Mode:** ${task.mode}\n`;
  output += `**Model:** ${task.model}\n`;
  output += `**Aspect Ratio:** ${task.aspectRatio}\n`;
  output += `**Resolution:** ${task.imageSize}\n`;
  output += `**Prompt:** ${task.prompt}\n`;
  output += `**Created:** ${new Date(task.createdAt).toLocaleString()}\n`;
  output += `**Updated:** ${new Date(task.updatedAt).toLocaleString()}\n`;

  if (task.inputFileIDs && task.inputFileIDs.length > 0) {
    output += `\n**Reference Images:** ${task.inputFileIDs.length} file(s)\n`;
  }

  if (task.status === 'completed') {
    const outputFiles = task.outputFileIDs || (task.outputFileID ? [task.outputFileID] : []);
    output += `\n**✨ Generated Images:** ${outputFiles.length} file(s)\n`;
    outputFiles.forEach((fileId, idx) => {
      output += `  ${idx + 1}. \`${fileId}\`\n`;
    });
  }

  if (task.status === 'failed' && task.errorMessage) {
    output += `\n**Error:** ${task.errorMessage}\n`;
  }

  return output;
}

/**
 * Format task list as markdown
 */
function formatTaskListMarkdown(tasks: TaskInfo[], total: number, hasMore: boolean): string {
  let output = `# Image Generation Tasks\n\n`;
  output += `Showing ${tasks.length} task(s)${hasMore ? ' (more available)' : ''}\n\n`;

  if (tasks.length === 0) {
    output += '*No tasks found*\n';
    return output;
  }

  tasks.forEach((task, idx) => {
    const statusEmoji = {
      processing: '⏳',
      completed: '✅',
      failed: '❌',
      cancelled: '🚫',
      queued: '⏸️'
    };

    output += `## ${idx + 1}. ${statusEmoji[task.status] || '❓'} ${task.taskId}\n`;
    output += `- **Status:** ${task.status} (${task.progress}%)\n`;
    output += `- **Prompt:** ${task.prompt.substring(0, 80)}${task.prompt.length > 80 ? '...' : ''}\n`;
    output += `- **Config:** ${task.imageSize} • ${task.aspectRatio} • ${task.mode}\n`;
    output += `- **Created:** ${new Date(task.createdAt).toLocaleString()}\n\n`;
  });

  return output;
}

// Register tools
server.registerTool(
  'image_gen_create',
  {
    title: 'Generate Images',
    description: 'Generate new images from a text prompt',
    inputSchema: {
      prompt: z.string().min(1).describe('Text description of the image to generate'),
      aspect_ratio: z.enum([
        '1:1', '3:2', '2:3', '3:4', '4:3', '16:9', '9:16',
        '21:9', '4:5', '5:4', '1:4', '4:1', '1:8', '8:1'
      ]).optional().describe('Image aspect ratio (default: 1:1)'),
      image_size: z.enum(['1K', '2K', '4K']).optional().describe('Image resolution (default: 1K)'),
      count: z.number().int().min(1).max(4).optional().describe('Number of images to generate (1-4, default: 1)')
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    }
  },
  async ({ prompt, aspect_ratio, image_size, count }) => {
    try {
      const task = await client.createTask({
        prompt,
        aspectRatio: aspect_ratio,
        imageSize: image_size,
        count: count || 1
      });

      const text = `Image generation task created successfully!\n\n${formatTaskMarkdown(task)}\n\nUse \`image_gen_status\` with task_id="${task.taskId}" to check progress.`;

      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: { taskId: task.taskId, status: task.status, progress: task.progress }
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Failed to create image generation task: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

server.registerTool(
  'image_gen_edit',
  {
    title: 'Edit Images',
    description: 'Edit images using reference images and a text prompt (1-14 reference images)',
    inputSchema: {
      prompt: z.string().min(1).describe('Text description of the desired edit'),
      reference_image_ids: z.array(z.string()).min(1).max(14).describe('File IDs of reference images (1-14 images)'),
      aspect_ratio: z.enum([
        '1:1', '3:2', '2:3', '3:4', '4:3', '16:9', '9:16',
        '21:9', '4:5', '5:4', '1:4', '4:1', '1:8', '8:1'
      ]).optional().describe('Output aspect ratio (default: 1:1)'),
      image_size: z.enum(['1K', '2K', '4K']).optional().describe('Output resolution (default: 1K)'),
      count: z.number().int().min(1).max(4).optional().describe('Number of variations (default: 1)')
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    }
  },
  async ({ prompt, reference_image_ids, aspect_ratio, image_size, count }) => {
    try {
      const task = await client.createTask({
        prompt,
        inputFileIDs: reference_image_ids,
        aspectRatio: aspect_ratio,
        imageSize: image_size,
        count: count || 1
      });

      const text = `Image edit task created successfully!\n\n${formatTaskMarkdown(task)}\n\nUse \`image_gen_status\` with task_id="${task.taskId}" to check progress.`;

      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: { taskId: task.taskId, status: task.status, progress: task.progress }
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Failed to create image edit task: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

server.registerTool(
  'image_gen_status',
  {
    title: 'Check Task Status',
    description: 'Check the status of an image generation task',
    inputSchema: {
      task_id: z.string().describe('The task ID to check')
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ task_id }) => {
    try {
      const task = await client.getStatus(task_id);
      const text = formatTaskMarkdown(task);

      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: {
          taskId: task.taskId,
          status: task.status,
          progress: task.progress,
          outputFileIDs: task.outputFileIDs || (task.outputFileID ? [task.outputFileID] : [])
        }
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Failed to get task status: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

server.registerTool(
  'image_gen_list',
  {
    title: 'List Tasks',
    description: 'List all image generation tasks',
    inputSchema: {
      limit: z.number().int().min(1).max(100).optional().describe('Maximum tasks to return (default: 20)'),
      offset: z.number().int().min(0).optional().describe('Pagination offset (default: 0)')
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ limit, offset }) => {
    try {
      const result = await client.listTasks(limit || 20, offset || 0);
      const text = formatTaskListMarkdown(result.tasks, result.total, result.hasMore);

      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: {
          tasks: result.tasks.map(t => ({
            taskId: t.taskId,
            status: t.status,
            prompt: t.prompt,
            progress: t.progress
          })),
          total: result.total,
          hasMore: result.hasMore
        }
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Failed to list tasks: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

server.registerTool(
  'image_gen_detail',
  {
    title: 'Get Task Details',
    description: 'Get detailed information about a specific task',
    inputSchema: {
      task_id: z.string().describe('The task ID to query')
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ task_id }) => {
    try {
      const task = await client.getTaskDetail(task_id);
      const text = formatTaskMarkdown(task);

      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: task
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Failed to get task detail: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

server.registerTool(
  'image_gen_delete',
  {
    title: 'Delete Tasks',
    description: 'Delete one or more image generation tasks',
    inputSchema: {
      task_ids: z.array(z.string()).min(1).describe('Task IDs to delete')
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ task_ids }) => {
    try {
      await client.deleteTasks(task_ids);
      const text = `Successfully deleted ${task_ids.length} task(s): ${task_ids.join(', ')}`;

      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: { deletedCount: task_ids.length, taskIds: task_ids }
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Failed to delete tasks: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

server.registerTool(
  'image_gen_cancel',
  {
    title: 'Cancel Task',
    description: 'Cancel a running image generation task',
    inputSchema: {
      task_id: z.string().describe('The task ID to cancel')
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ task_id }) => {
    try {
      await client.cancelTask(task_id);
      const text = `Successfully cancelled task: ${task_id}`;

      return {
        content: [{ type: 'text' as const, text }],
        structuredContent: { taskId: task_id, cancelled: true }
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Failed to cancel task: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

server.registerTool(
  'image_gen_config',
  {
    title: 'Get Configuration',
    description: 'Get available configuration options (aspect ratios, resolutions, models)',
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async () => {
    try {
      const config = await client.getConfig();

      let output = '# Image Generation Configuration\n\n';
      output += `**Model:** ${config.models.join(', ')}\n`;
      output += `**Max Input Images:** ${config.maxInputImages}\n\n`;

      output += '## Available Aspect Ratios\n';
      config.ratios.forEach(ratio => {
        output += `- ${ratio.value}\n`;
      });

      output += '\n## Available Resolutions\n';
      config.imageSizes.forEach(size => {
        output += `- **${size.value}**: ${size.baseResolution}px base resolution\n`;
      });

      output += `\n## Image Count Options\n`;
      output += `You can generate ${config.advanced.counts.join(', ')} image(s) per task\n`;

      return {
        content: [{ type: 'text' as const, text: output }],
        structuredContent: config
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Failed to get configuration: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// Start the server
async function main() {
  console.error('Starting Image Generation MCP Server...');
  console.error(`API URL: ${API_URL}`);
  console.error(`User OpenID: ${USER_OPENID}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Image Generation MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
