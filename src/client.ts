import axios, { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  CreateTaskRequest,
  StatusTaskRequest,
  ListTasksRequest,
  DetailTaskRequest,
  DeleteTasksRequest,
  CancelTaskRequest,
  ConfigRequest,
  ImageGenerationConfig,
  TaskInfo
} from './types.js';

/**
 * Client for the Image Generation API
 */
export class ImageGenerationClient {
  private client: AxiosInstance;
  private openid: string;

  constructor(apiUrl: string, openid: string) {
    this.openid = openid;
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-wx-openid': openid
      }
    });
  }

  /**
   * Get configuration options
   */
  async getConfig(): Promise<ImageGenerationConfig> {
    const response = await this.client.post<ApiResponse<ImageGenerationConfig>>('', {
      action: 'config'
    } as ConfigRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get configuration');
    }

    return response.data.data;
  }

  /**
   * Create a new image generation task
   */
  async createTask(request: Omit<CreateTaskRequest, 'action'>): Promise<TaskInfo> {
    const response = await this.client.post<ApiResponse<TaskInfo>>('', {
      action: 'create',
      mode: request.inputFileIDs?.length ? 'edit' : 'generate',
      ...request
    } as CreateTaskRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create task');
    }

    return response.data.data;
  }

  /**
   * Check task status
   */
  async getStatus(taskId: string): Promise<TaskInfo> {
    const response = await this.client.post<ApiResponse<TaskInfo>>('', {
      action: 'status',
      taskId
    } as StatusTaskRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get task status');
    }

    return response.data.data;
  }

  /**
   * List all tasks
   */
  async listTasks(limit = 20, offset = 0): Promise<{ tasks: TaskInfo[]; total: number; hasMore: boolean }> {
    const response = await this.client.post<ApiResponse<TaskInfo[]>>('', {
      action: 'list',
      limit,
      offset
    } as ListTasksRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to list tasks');
    }

    const tasks = response.data.data;
    return {
      tasks,
      total: tasks.length,
      hasMore: tasks.length === limit
    };
  }

  /**
   * Get detailed task information
   */
  async getTaskDetail(taskId: string): Promise<TaskInfo> {
    const response = await this.client.post<ApiResponse<TaskInfo>>('', {
      action: 'detail',
      taskId
    } as DetailTaskRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get task detail');
    }

    return response.data.data;
  }

  /**
   * Delete tasks
   */
  async deleteTasks(taskIds: string[]): Promise<void> {
    const response = await this.client.post<ApiResponse>('', {
      action: 'delete',
      taskIds
    } as DeleteTasksRequest);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete tasks');
    }
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<void> {
    const response = await this.client.post<ApiResponse>('', {
      action: 'cancel',
      taskId
    } as CancelTaskRequest);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel task');
    }
  }
}
