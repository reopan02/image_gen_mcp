# 快速参考 (Quick Reference)

## 环境变量 (Environment Variables)

```bash
IMAGE_API_URL=https://your-api-url.com
USER_OPENID=your-user-openid
```

## MCP 工具清单 (MCP Tools)

| 工具名 | 功能 | 只读 | 必需参数 |
|--------|------|------|---------|
| `image_gen_create` | 生成图像 | ❌ | prompt |
| `image_gen_edit` | 编辑图像 | ❌ | prompt, reference_image_ids |
| `image_gen_status` | 查询状态 | ✅ | task_id |
| `image_gen_list` | 列出任务 | ✅ | - |
| `image_gen_detail` | 任务详情 | ✅ | task_id |
| `image_gen_delete` | 删除任务 | ❌ | task_ids |
| `image_gen_cancel` | 取消任务 | ❌ | task_id |
| `image_gen_config` | 获取配置 | ✅ | - |

## 支持的宽高比 (Aspect Ratios)

```
1:1, 3:2, 2:3, 3:4, 4:3, 16:9, 9:16, 21:9, 
4:5, 5:4, 1:4, 4:1, 1:8, 8:1
```

## 支持的分辨率 (Resolutions)

```
1K, 2K, 4K
```

## 批量生成 (Batch)

```
1-4 张图片/任务
```

## 参考图数量 (Reference Images)

```
1-14 张参考图
```

## 常用命令 (Common Commands)

### 构建 (Build)
```bash
npm install
npm run build
```

### 测试结构 (Test Structure)
```bash
node test-structure.js
```

### 使用 Inspector 测试 (Test with Inspector)
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## 配置示例 (Configuration Example)

### Claude Desktop / Cline

**方式 1: 使用 cwd (推荐)**

```json
{
  "mcpServers": {
    "image-generation": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/mcp_build",
      "env": {
        "IMAGE_API_URL": "https://your-api-url.com",
        "USER_OPENID": "your-user-openid"
      }
    }
  }
}
```

**方式 2: 使用 npm script**

```json
{
  "mcpServers": {
    "image-generation": {
      "command": "npm",
      "args": ["run", "start"],
      "cwd": "/path/to/mcp_build",
      "env": {
        "IMAGE_API_URL": "https://your-api-url.com",
        "USER_OPENID": "your-user-openid"
      }
    }
  }
}
```

**方式 3: 使用 npx + tsx (无需 build)**

```json
{
  "mcpServers": {
    "image-generation": {
      "command": "npx",
      "args": ["-y", "tsx", "src/index.ts"],
      "cwd": "/path/to/mcp_build",
      "env": {
        "IMAGE_API_URL": "https://your-api-url.com",
        "USER_OPENID": "your-user-openid"
      }
    }
  }
}
```

## 典型工作流 (Typical Workflow)

### 1. 生成图像 (Generate)
```
User: 生成一张日落海景图，16:9 宽屏，4K 分辨率
Tool: image_gen_create
  - prompt: "日落海景"
  - aspect_ratio: "16:9"
  - image_size: "4K"
Result: task_id = "abc123"
```

### 2. 检查进度 (Check Progress)
```
User: 检查任务 abc123
Tool: image_gen_status
  - task_id: "abc123"
Result: Status: processing, Progress: 75%
```

### 3. 获取结果 (Get Result)
```
Tool: image_gen_status
  - task_id: "abc123"
Result: Status: completed
        Output: ["file_xyz789"]
```

### 4. 基于结果编辑 (Edit Based on Result)
```
User: 在这张图上加入飞鸟
Tool: image_gen_edit
  - prompt: "添加飞鸟"
  - reference_image_ids: ["file_xyz789"]
Result: task_id = "def456"
```

## 错误处理 (Error Handling)

| 错误 | 原因 | 解决方法 |
|------|------|----------|
| 环境变量缺失 | .env 未配置 | 复制 .env.example 并填写 |
| 模块未找到 | 未构建 | 运行 npm run build |
| API 调用失败 | 凭证错误 | 检查 USER_OPENID |
| 网络错误 | URL 错误 | 验证 IMAGE_API_URL |

## 文件位置 (File Locations)

- **源代码**: `src/*.ts`
- **构建输出**: `dist/*.js`
- **配置模板**: `.env.example`
- **文档**: `README.md`, `DEPLOYMENT.md`, `SUMMARY.md`
- **测试**: `test-structure.js`

## 提示与技巧 (Tips & Tricks)

1. **批量生成**: 使用 count 参数一次生成多张
2. **高质量**: 使用 4K 分辨率获得最佳质量
3. **快速原型**: 使用 1K 分辨率快速测试
4. **迭代编辑**: 使用 image_gen_edit 基于已有图片优化
5. **任务管理**: 定期使用 image_gen_list 查看所有任务
6. **清理空间**: 使用 image_gen_delete 删除不需要的任务

## 性能优化 (Performance Tips)

- 低分辨率 (1K) 生成最快
- 批量生成比单次生成更高效
- 参考图越多，编辑越精确但耗时越长
- 取消不需要的任务释放资源

## 调试模式 (Debug Mode)

查看服务器日志（stderr 输出）:
```bash
# 直接运行查看日志
node dist/index.js 2>&1 | tee server.log
```

## 版本信息 (Version Info)

- **MCP SDK**: 1.0.4+
- **Node.js**: 18+
- **TypeScript**: 5+
- **Zod**: 3.24+

## 链接 (Links)

- [MCP 协议规范](https://modelcontextprotocol.io)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)
