# Code-to-ApiFox MCP Server

一个基于Node.js的MCP（Model Context Protocol）服务器，专门用于Swagger文档生成和ApiFox平台集成。

[![npm version](https://badge.fury.io/js/code-to-apifox-mcp.svg)](https://www.npmjs.com/package/code-to-apifox-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

- 🚀 **标准MCP协议支持** - 完全兼容MCP协议规范
- 📝 **Swagger规范生成** - 提供标准的Swagger JSON示例和最佳实践
- 🔗 **ApiFox无缝集成** - 一键上传API文档到ApiFox平台
- 🔄 **双模式运行** - 支持STDIO和HTTP两种连接方式
- 🌐 **云端部署就绪** - 支持本地开发和生产环境部署
- 🤖 **AI助手友好** - 专为AI助手设计的工具集成

## 🚀 快速开始

### 全局安装（推荐）

```bash
# 全局安装
npm install -g code-to-apifox-mcp

# 直接使用
code-to-apifox-mcp --stdio    # MCP客户端模式
code-to-apifox-mcp            # HTTP服务模式
```

### 临时使用

```bash
# 无需安装，直接运行
npx code-to-apifox-mcp --stdio
npx code-to-apifox-mcp
```

### 本地开发

```bash
# 克隆项目
git clone https://github.com/xzg0919/code-to-apifox-mcp.git
cd code-to-apifox-mcp

# 安装依赖
npm install

# 开发模式运行
npm run dev:stdio    # STDIO模式
npm run dev          # HTTP模式
```

## 📖 使用方法

### 1. MCP客户端集成（推荐）

在支持MCP的AI助手（如Claude Desktop）中配置：

```json
{
  "mcpServers": {
    "doc-mcp-server": {
      "command": "code-to-apifox-mcp",
      "args": ["--stdio"]
    }
  }
}
```

配置完成后，你可以直接在AI助手中使用：

```
请帮我获取Swagger规范示例
```

```
请帮我上传API文档到ApiFox：
- 项目ID: your-project-id
- 访问令牌: your-access-token
- Swagger JSON: {...}
```

### 2. HTTP API调用

启动HTTP服务：

```bash
code-to-apifox-mcp  # 默认端口3033
```

#### 获取Swagger规范示例

```bash
curl -X POST http://127.0.0.1:3033/tools/getSwaggerSpecification
```

#### 上传文档到ApiFox

```bash
curl -X POST http://127.0.0.1:3033/tools/uploadSwaggerToApiFox \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "accessToken": "your-access-token",
    "swaggerJson": "your-swagger-json-string"
  }'
```

#### 健康检查

```bash
curl http://127.0.0.1:3033/health
```

### 3. 编程方式使用

在Node.js项目中直接使用：

```javascript
import { SwaggerUploadService } from 'code-to-apifox-mcp';

const config = {
  apifox: {
    api: {
      baseUrl: 'https://api.apifox.com',
      version: '2024-03-28'
    }
  }
};

const service = new SwaggerUploadService(config);

// 获取Swagger规范
const spec = await service.getSwaggerSpecification();
console.log(spec);

// 上传到ApiFox
const result = await service.uploadSwaggerToApiFox(
  'project-id',
  'access-token', 
  'swagger-json'
);
console.log(result);
```

## 🛠️ 工具说明

### getSwaggerSpecification

**功能**: 获取标准的Swagger JSON规范示例

**返回**: 包含完整Petstore示例的Swagger规范，以及详细的使用说明和最佳实践建议

**适用场景**:
- 学习Swagger规范格式
- 作为API文档模板
- 了解最佳实践和注意事项

### uploadSwaggerToApiFox

**功能**: 将Swagger JSON上传到ApiFox平台

**参数**:
- `projectId` (必填): ApiFox项目ID
- `accessToken` (必填): ApiFox访问令牌
- `swaggerJson` (必填): 完整的Swagger JSON字符串

**返回**: 上传结果和详细信息

## ⚙️ 配置说明

配置文件位置: `config/config.json`

```json
{
  "app": {
    "name": "doc-mcp",
    "port": 3033
  },
  "apifox": {
    "api": {
      "baseUrl": "https://api.apifox.com",
      "version": "2024-03-28"
    }
  },
  "mcp": {
    "server": {
      "name": "doc-mcp-server",
      "version": "1.0.0",
      "instructions": "Swagger文档生成和ApiFox集成工具"
    }
  }
}
```

## 🌐 部署指南

### 本地部署

```bash
# 全局安装
npm install -g code-to-apifox-mcp

# 启动服务
code-to-apifox-mcp  # HTTP模式，端口3033
```

### 云服务器部署

```bash
# 1. 上传到服务器
scp -r . user@your-server.com:/opt/doc-mcp/

# 2. 在服务器上安装和启动
ssh user@your-server.com
cd /opt/doc-mcp
npm install -g code-to-apifox-mcp

# 3. 后台运行
nohup code-to-apifox-mcp > mcp-server.log 2>&1 &
```

### Docker部署

```dockerfile
FROM node:18-alpine
RUN npm install -g code-to-apifox-mcp
EXPOSE 3033
CMD ["code-to-apifox-mcp"]
```

```bash
docker build -t doc-mcp .
docker run -p 3033:3033 doc-mcp
```

## 🔗 API端点

当以HTTP模式运行时，提供以下端点：

- `GET /health` - 服务健康检查
- `GET /sse` - MCP客户端SSE连接
- `POST /tools/getSwaggerSpecification` - 获取Swagger规范
- `POST /tools/uploadSwaggerToApiFox` - 上传到ApiFox

## 🧪 测试和验证

```bash
# 运行单元测试
npm test

# 测试HTTP服务
curl http://127.0.0.1:3033/health

# 测试工具功能
npx code-to-apifox-mcp --stdio
```

## 📋 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **操作系统**: Windows, macOS, Linux

## ❓ 常见问题

### Q: 如何获取ApiFox的项目ID和访问令牌？
A: 登录ApiFox，在项目设置 -> 开放API中可以找到项目ID和生成访问令牌。

### Q: 支持哪些Swagger版本？
A: 支持Swagger 2.0和OpenAPI 3.0格式。

### Q: 如何在AI助手中使用？
A: 配置MCP客户端后，直接用自然语言描述需求即可，如"帮我上传API文档到ApiFox"。

### Q: 端口被占用怎么办？
A: 修改`config/config.json`中的端口号，或设置环境变量`PORT=your-port`。


## 🔗 相关链接

- [GitHub仓库](https://github.com/xzg0919/code-to-apifox-mcp)
- [npm包](https://www.npmjs.com/package/code-to-apifox-mcp)
- [ApiFox官网](https://www.apifox.cn/)
- [MCP协议文档](https://modelcontextprotocol.io/)

---

如果这个工具对你有帮助，请给个⭐️支持一下！