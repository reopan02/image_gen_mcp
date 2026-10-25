# 变更日志 (Changelog)

## [1.0.1] - 2024-10-25

### 🔧 Changed (变更)

- **`IMAGE_API_URL` 现在是可选的环境变量**
  - 默认值: `https://api.example.com`
  - 不提供时自动使用默认值
  - 只有 `USER_OPENID` 是必填的

### ✨ Added (新增)

- 添加了 `MODELSCOPE_DEPLOYMENT.md` - 魔搭部署指南
- 添加了 `modelscope-mcp-config.json` - 魔搭配置文件
- 更新了 `.env.example` 标注可选变量
- 更新了 `README.md` 说明环境变量要求

### 📝 Documentation (文档)

- 明确标注哪些环境变量是必填、哪些是可选
- 添加了魔搭平台部署步骤
- 添加了环境变量表单填写示例

---

## [1.0.0] - 2024-10-25

### 🎉 Initial Release (初始版本)

#### ✨ Features (功能)

- 实现了 8 个 MCP 工具：
  - `image_gen_create` - 生成图像
  - `image_gen_edit` - 编辑图像（1-14 张参考图）
  - `image_gen_status` - 检查任务状态
  - `image_gen_list` - 列出所有任务
  - `image_gen_detail` - 获取任务详情
  - `image_gen_delete` - 删除任务
  - `image_gen_cancel` - 取消任务
  - `image_gen_config` - 获取配置信息

#### 🛠️ Technical (技术)

- TypeScript + Zod 类型安全
- 支持 stdio 传输协议
- Markdown + JSON 双格式输出
- 工具注解（只读、破坏性、幂等性）
- 完整的错误处理

#### 📚 Documentation (文档)

- `README.md` - 项目文档和 API 参考
- `DEPLOYMENT.md` - 部署指南（中英文）
- `SUMMARY.md` - 实现总结
- `QUICK_REFERENCE.md` - 快速参考

#### 🎨 Image Features (图像功能)

- 14 种宽高比支持
- 3 种分辨率（1K/2K/4K）
- 批量生成（1-4 张）
- 图像编辑（最多 14 张参考图）

---

## 迁移指南 (Migration Guide)

### 从 1.0.0 升级到 1.0.1

**无需修改代码！** 只需要调整环境变量配置：

#### 之前 (Before):
```bash
# 两个都必填
IMAGE_API_URL=https://your-api.com
USER_OPENID=your-openid
```

#### 现在 (Now):
```bash
# 只有 USER_OPENID 必填
USER_OPENID=your-openid

# IMAGE_API_URL 可选，不填使用默认值
# IMAGE_API_URL=https://your-api.com
```

#### 兼容性 (Compatibility)

- ✅ **向后兼容**: 如果你已经配置了 `IMAGE_API_URL`，继续正常工作
- ✅ **更灵活**: 新部署可以不配置 `IMAGE_API_URL`
- ✅ **无破坏性变更**: 现有配置无需修改

---

## 计划中的功能 (Planned Features)

### v1.1.0
- [ ] 支持 streamable HTTP 传输
- [ ] 添加图像上传功能
- [ ] 添加批量删除优化
- [ ] 性能监控和日志

### v1.2.0
- [ ] 支持 MCP 资源（Resources）
- [ ] 添加图像缓存
- [ ] 添加速率限制
- [ ] Docker 镜像发布

### v2.0.0
- [ ] 支持多用户认证
- [ ] 添加 WebSocket 支持
- [ ] 分布式任务队列
- [ ] 管理面板
