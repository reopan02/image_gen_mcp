# 部署指南 (Deployment Guide)

## 概述 (Overview)

这个 MCP 服务器封装了图像生成 API，可以通过 MCP 协议访问图像生成和编辑功能。

This MCP server wraps the image generation API, providing image generation and editing capabilities through the MCP protocol.

## 本地部署 (Local Deployment)

### 1. 构建项目 (Build Project)

```bash
# 安装依赖 (Install dependencies)
npm install

# 构建项目 (Build project)
npm run build
```

### 2. 配置环境变量 (Configure Environment)

创建 `.env` 文件 (Create `.env` file):

```bash
cp .env.example .env
```

编辑 `.env` 并填入实际值 (Edit `.env` with actual values):

```env
IMAGE_API_URL=https://your-actual-api-url.com
USER_OPENID=your-actual-user-openid
```

### 3. 配置 MCP 客户端 (Configure MCP Client)

#### Claude Desktop / Cline

编辑配置文件 (Edit configuration file):
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

添加服务器配置 (Add server configuration):

**推荐方式 1: 使用 cwd (Recommended - Using cwd)**

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

**推荐方式 2: 使用 npx + tsx (No build required)**

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

**推荐方式 3: 使用 npm script**

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

**注意**: 将 `/path/to/mcp_build` 替换为实际路径 (Replace with actual path)

### 4. 测试 (Test)

使用 MCP Inspector 测试 (Test with MCP Inspector):

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## 远程部署 (Remote Deployment)

### 选项 1: 使用 stdio 通过 SSH (Option 1: stdio via SSH)

如果你的 MCP 客户端支持 SSH，可以直接通过 SSH 运行 (If your MCP client supports SSH, you can run directly via SSH):

```json
{
  "mcpServers": {
    "image-generation": {
      "command": "ssh",
      "args": [
        "user@remote-server",
        "cd mcp_build && node dist/index.js"
      ],
      "env": {
        "IMAGE_API_URL": "https://your-api-url.com",
        "USER_OPENID": "your-user-openid"
      }
    }
  }
}
```

或者使用 npm script:

```json
{
  "mcpServers": {
    "image-generation": {
      "command": "ssh",
      "args": [
        "user@remote-server",
        "cd mcp_build && npm run start"
      ],
      "env": {
        "IMAGE_API_URL": "https://your-api-url.com",
        "USER_OPENID": "your-user-openid"
      }
    }
  }
}
```

### 选项 2: 使用 HTTP 传输 (Option 2: HTTP Transport)

对于真正的远程部署，需要修改服务器使用 HTTP 传输 (For true remote deployment, modify the server to use HTTP transport).

#### 步骤 (Steps):

1. **修改 index.ts** (Modify index.ts):

```typescript
// 替换 (Replace):
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// 为 (With):
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';

// 在 main() 函数中，替换 (In main() function, replace):
const transport = new StdioServerTransport();
await server.connect(transport);

// 为 (With):
const app = express();
const transport = new StreamableHTTPServerTransport({
  endpoint: '/mcp',
  app: app as any,
  cors: {
    origin: ['https://claude.ai'],
    credentials: true
  }
});

await server.connect(transport);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.error(`MCP Server listening on http://localhost:${PORT}/mcp`);
});
```

2. **添加 Express 依赖** (Add Express dependency):

```bash
npm install express
npm install -D @types/express
```

3. **重新构建** (Rebuild):

```bash
npm run build
```

4. **部署到服务器** (Deploy to server):

使用 PM2、systemd 或 Docker 等工具部署。

Use PM2, systemd, or Docker to deploy.

**使用 PM2 示例** (PM2 Example):

```bash
# 安装 PM2 (Install PM2)
npm install -g pm2

# 启动服务 (Start service)
pm2 start dist/index.js --name image-gen-mcp

# 保存配置 (Save configuration)
pm2 save

# 开机自启 (Auto-start on boot)
pm2 startup
```

5. **配置客户端使用 HTTP** (Configure client to use HTTP):

```json
{
  "mcpServers": {
    "image-generation": {
      "url": "https://your-server.com/mcp",
      "headers": {
        "Authorization": "Bearer your-token-if-needed"
      }
    }
  }
}
```

### 选项 3: Docker 部署 (Option 3: Docker Deployment)

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
```

构建并运行 (Build and run):

```bash
# 构建镜像 (Build image)
docker build -t image-gen-mcp .

# 运行容器 (Run container)
docker run -d \
  --name image-gen-mcp \
  -e IMAGE_API_URL=https://your-api-url.com \
  -e USER_OPENID=your-user-openid \
  -p 3000:3000 \
  image-gen-mcp
```

## 安全建议 (Security Recommendations)

1. **不要在配置文件中硬编码凭证** (Don't hardcode credentials)
   - 使用环境变量或密钥管理服务
   - Use environment variables or secret management services

2. **使用 HTTPS** (Use HTTPS)
   - 对于远程部署，始终使用 HTTPS
   - Always use HTTPS for remote deployments

3. **限制访问** (Restrict access)
   - 使用防火墙规则
   - 实施身份验证
   - Use firewall rules
   - Implement authentication

4. **监控日志** (Monitor logs)
   - 使用日志聚合工具
   - 设置告警
   - Use log aggregation tools
   - Set up alerts

## 故障排除 (Troubleshooting)

### 问题: 环境变量未设置 (Issue: Environment variables not set)

**症状** (Symptom):
```
Error: IMAGE_API_URL environment variable is required
```

**解决方案** (Solution):
- 确保 `.env` 文件存在且包含所有必需变量
- 对于 MCP 客户端配置，在 `env` 字段中设置变量
- Ensure `.env` file exists with all required variables
- For MCP client config, set variables in `env` field

### 问题: 模块加载失败 (Issue: Module loading fails)

**症状** (Symptom):
```
Cannot find module './dist/index.js'
```

**解决方案** (Solution):
- 运行 `npm run build` 构建项目
- 检查路径是否为绝对路径
- Run `npm run build` to build the project
- Verify the path is absolute

### 问题: API 调用失败 (Issue: API calls fail)

**症状** (Symptom):
```
Failed to create task: Network error
```

**解决方案** (Solution):
- 验证 `IMAGE_API_URL` 正确
- 检查 `USER_OPENID` 有效
- 确认网络连接
- Verify `IMAGE_API_URL` is correct
- Check `USER_OPENID` is valid
- Confirm network connectivity

## 监控和维护 (Monitoring and Maintenance)

### 日志 (Logs)

服务器将日志输出到 stderr:
The server outputs logs to stderr:

- 启动信息 (Startup info)
- API 调用 (API calls)
- 错误信息 (Error messages)

### 性能指标 (Performance Metrics)

建议监控 (Recommended to monitor):
- API 响应时间 (API response times)
- 任务成功率 (Task success rate)
- 并发连接数 (Concurrent connections)

## 升级指南 (Upgrade Guide)

1. 备份当前部署 (Backup current deployment)
2. 拉取最新代码 (Pull latest code)
3. 运行 `npm install` (Run `npm install`)
4. 运行 `npm run build` (Run `npm run build`)
5. 重启服务 (Restart service)

## 支持 (Support)

如有问题，请检查:
For issues, please check:

1. README.md - 基本使用说明 (Basic usage)
2. 本文档 - 部署指南 (Deployment guide)
3. GitHub Issues - 报告问题 (Report issues)
