/**
 * Type definitions for the Image Generation API
 */

export type AspectRatio =
  | '1:1' | '3:2' | '2:3' | '3:4' | '4:3'
  | '16:9' | '9:16' | '21:9' | '4:5' | '5:4'
  | '1:4' | '4:1' | '1:8' | '8:1';

export type ImageSize = '1K' | '2K' | '4K';

export type TaskStatus = 'processing' | 'completed' | 'failed' | 'cancelled' | 'queued';

export interface ImageGenerationConfig {
  ratios: Array<{ value: string; label: string }>;
  imageSizes: Array<{ value: string; label: string; baseResolution: number }>;
  defaultImageSize: string;
  baseResolutions: number[];
  clarities: Array<{ value: string; label: string; baseResolution: number }>;
  advanced: { counts: number[] };
  models: string[];
  maxInputImages: number;
  [key: string]: unknown;
}

export interface CreateTaskRequest {
  action: 'create';
  prompt: string;
  mode?: 'generate' | 'edit';
  aspectRatio?: AspectRatio;
  aspect_ratio?: AspectRatio;
  imageSize?: ImageSize;
  image_size?: ImageSize;
  count?: number;
  inputFileIDs?: string[];
  model?: string;
}

export interface StatusTaskRequest {
  action: 'status';
  taskId: string;
}

export interface ListTasksRequest {
  action: 'list';
  limit?: number;
  offset?: number;
}

export interface DetailTaskRequest {
  action: 'detail';
  taskId: string;
}

export interface DeleteTasksRequest {
  action: 'delete';
  taskIds: string[];
}

export interface CancelTaskRequest {
  action: 'cancel';
  taskId: string;
}

export interface ConfigRequest {
  action: 'config';
}

export interface TaskInfo {
  taskId: string;
  status: TaskStatus;
  progress: number;
  createdAt: number;
  updatedAt: number;
  prompt: string;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  model: string;
  mode: 'generate' | 'edit';
  outputFileIDs?: string[];
  outputFileID?: string;
  errorMessage?: string;
  inputFileIDs?: string[];
  [key: string]: unknown;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  code?: number;
  message?: string;
}
