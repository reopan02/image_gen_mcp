# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-10-25

### Fixed
- ❌ 移除了所有硬编码的绝对路径 (Removed all hardcoded absolute paths)
- ✅ 使用 `cwd` 参数使配置可移植 (Use `cwd` parameter for portable config)
- ✅ 添加配置生成器工具 (Added config generator tool)

### Added
- 🆕 `generate-config.js` - 自动生成正确的配置 (Auto-generate correct config)
- 🆕 `npm run config` - 快速查看配置选项 (Quick config options)
- 📚 更新所有文档使用相对路径 (Updated all docs to use relative paths)

### Configuration Examples

#### 之前 (Before) - ❌ 不可移植
```json
{
  "command": "node",
  "args": ["/Users/reo/coding/mcp_build/dist/index.js"]
}
```

#### 现在 (Now) - ✅ 可移植
```json
{
  "command": "node",
  "args": ["dist/index.js"],
  "cwd": "/path/to/mcp_build"
}
```

或使用 npm script (推荐):
```json
{
  "command": "npm",
  "args": ["run", "start"],
  "cwd": "/path/to/mcp_build"
}
```

### Benefits
- ✅ 配置可以跨环境使用 (Config works across environments)
- ✅ 部署到远程服务器无需修改 (Deploy to remote without changes)
- ✅ 团队成员可以直接使用 (Team members can use directly)
- ✅ Docker 容器内路径一致 (Consistent paths in Docker)

---

## [1.0.0] - 2026-10-25

### Initial Release
- ✨ 8 个完整的图像生成 MCP 工具 (8 complete image generation MCP tools)
- 📝 完整的中英文文档 (Complete bilingual documentation)
- 🔧 TypeScript + Zod 类型安全 (Type-safe with TypeScript + Zod)
- 🚀 支持本地和远程部署 (Support local and remote deployment)
