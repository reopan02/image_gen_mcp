# 魔搭 MCP 服务器部署指南

## 📋 部署准备

### 1. 环境变量配置

在魔搭 MCP 平台的环境变量表单中配置：

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `USER_OPENID` | ✅ **是** | - | 用户认证令牌（必须填写） |
| `IMAGE_API_URL` | ❌ 否 | `https://api.example.com` | API 地址（可选，不填使用默认值） |

### 2. 填写表单示例

**必填项：**
```
环境变量名: USER_OPENID
是否必填: ✅ 是
默认值: (留空)
描述: 用户认证令牌 (User authentication token)
```

**可选项：**
```
环境变量名: IMAGE_API_URL
是否必填: ❌ 否
默认值: https://api.example.com
描述: 图像生成 API 地址 (Image generation API base URL)
```

## 🚀 部署步骤

### 方式一：使用 modelscope-mcp-config.json

1. 将 `modelscope-mcp-config.json` 上传到魔搭平台
2. 平台会自动读取配置
3. 填写环境变量：
   - **必填**：`USER_OPENID=your-actual-openid`
   - **可选**：`IMAGE_API_URL=https://your-api-url.com`（不填则使用默认值）

### 方式二：手动配置

#### 基本信息
- **服务器名称**: `image-generation-mcp`
- **描述**: MCP server for image generation API
- **Node 版本**: >= 18.0.0
- **传输协议**: stdio

#### 构建命令
```bash
npm install && npm run build
```

#### 启动命令
```bash
node dist/index.js
```

#### 环境变量
按照上面"环境变量配置"章节填写

## 📦 提交文件清单

上传到魔搭平台的文件：

```
mcp_build/
├── src/
│   ├── index.ts          # MCP 服务器入口
│   ├── client.ts         # API 客户端
│   └── types.ts          # 类型定义
├── package.json          # 依赖配置
├── tsconfig.json         # TypeScript 配置
├── modelscope-mcp-config.json  # 魔搭配置文件
└── README.md             # 项目文档
```

**不需要上传的文件：**
- `node_modules/` (平台自动安装)
- `dist/` (平台自动构建)
- `.env` (通过表单配置)
- `.agents/`, `.claude/` (本地开发目录)

## ✅ 测试验证

部署后，在魔搭平台测试：

### 1. 测试工具列表
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

应该返回 8 个工具：
- `image_gen_create`
- `image_gen_edit`
- `image_gen_status`
- `image_gen_list`
- `image_gen_detail`
- `image_gen_delete`
- `image_gen_cancel`
- `image_gen_config`

### 2. 测试配置信息
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "image_gen_config",
    "arguments": {}
  }
}
```

应该返回可用的宽高比、分辨率等配置信息。

### 3. 测试环境变量
检查服务器启动日志：

```
Starting Image Generation MCP Server...
API URL: https://api.example.com    # 如果没配置 IMAGE_API_URL
API URL: https://your-api-url.com   # 如果配置了 IMAGE_API_URL
User OpenID: your-actual-openid
```

## 🔧 故障排查

### 问题 1: 启动失败 "USER_OPENID is required"

**原因**: 没有配置必填的 `USER_OPENID` 环境变量

**解决**: 在魔搭平台环境变量表单中填写 `USER_OPENID`

### 问题 2: API 地址不正确

**原因**: 
- 使用了默认值 `https://api.example.com`
- 或者配置的 `IMAGE_API_URL` 不正确

**解决**: 在环境变量表单中填写正确的 `IMAGE_API_URL`

### 问题 3: 构建失败

**原因**: Node 版本过低

**解决**: 确保使用 Node.js >= 18.0.0

## 📊 使用统计

部署后可以在魔搭平台查看：
- 工具调用次数
- 成功/失败率
- 响应时间
- 用户数量

## 🔐 安全建议

1. **不要在代码中硬编码** `USER_OPENID`
2. **使用环境变量**管理敏感信息
3. **定期轮换** `USER_OPENID`
4. **监控异常调用**，及时发现安全问题

## 📝 更新部署

如需更新代码：

1. 修改源代码
2. 提交到 Git 仓库
3. 在魔搭平台触发重新部署
4. 或者重新上传文件包

环境变量配置会保留，无需重新填写。

## 💡 提示

- `IMAGE_API_URL` 是可选的，如果你的 API 地址固定，可以不填，使用默认值
- 只有 `USER_OPENID` 是必填的
- 首次部署建议先使用默认的 `IMAGE_API_URL` 测试，确认服务器正常工作后再修改
