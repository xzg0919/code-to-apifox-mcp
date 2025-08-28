# Doc-MCP: Swagger to ApiFox MCP Server (Node.js版本)

这是一个基于Node.js和MCP SDK的服务，提供Swagger规范获取和上传到ApiFox的功能。

## 项目特性

- 🚀 基于Node.js 18+和@modelcontextprotocol/sdk
- 🔧 实现标准MCP协议通信
- 📝 提供标准Swagger格式规范示例
- 🌐 集成ApiFox开放API，支持自动上传接口文档
- ⚡ 支持HTTP传输协议，可部署在云服务器上
- 🔗 通过HTTP SSE端点与AI助手无缝集成
- 📋 基于Petstore示例的完整Swagger规范

## 功能说明

MCP服务提供两个工具函数：

### 1. `getSwaggerSpecification`
获取Swagger参数规范示例，返回标准的Swagger JSON格式规范。

**功能**：
- 提供完整的Petstore Swagger JSON示例
- 详细的字段说明和使用指导
- 包含最佳实践建议

### 2. `uploadSwaggerToApiFox`
上传Swagger JSON到ApiFox平台。

**参数**：
- `projectId`: ApiFox项目ID (必填)
- `accessToken`: ApiFox访问令牌 (必填)
- `swaggerJson`: 完整的Swagger JSON字符串 (必填)

## 快速开始

### 1. 环境要求

- Node.js 18+
- npm 或 yarn

### 2. 安装和运行

```bash
# 安装依赖
npm install

# STDIO模式运行（用于MCP客户端直接连接）
npm run start:stdio
# 或者
npm start -- --stdio

# HTTP模式运行（用于云服务器部署）
npm run start:http
# 或者
npm start

# 开发模式（带热重载）
npm run dev          # HTTP模式
npm run dev:stdio    # STDIO模式
```

### 3. 云服务器部署

```bash
# 上传项目文件到云服务器
scp -r . user@your-server.com:/opt/doc-mcp/

# 在云服务器上安装依赖并启动服务
ssh user@your-server.com
cd /opt/doc-mcp
npm install
nohup npm start > mcp-server.log 2>&1 &
```

### 4. MCP客户端配置

#### STDIO模式配置（本地连接）

在支持MCP的AI助手中添加以下配置：

```json
{
  "mcpServers": {
    "doc-mcp-server": {
      "command": "node",
      "args": ["src/index.js", "--stdio"],
      "cwd": "d:\\IDEA\\CODE\\code-to-apifox-mcp"
    }
  }
}
```

#### HTTP模式配置（远程连接）

云服务器配置：
```json
{
  "mcpServers": {
    "doc-mcp-server": {
      "url": "http://your-server.com:8080/sse"
    }
  }
}
```

本地HTTP服务配置：
```json
{
  "mcpServers": {
    "doc-mcp-server-local": {
      "url": "http://127.0.0.1:8080/sse"
    }
  }
}
```

## 使用示例

### STDIO模式示例

通过AI助手调用工具：

```
请帮我上传一个API文档到ApiFox：
- 项目ID: 4478210
- 访问令牌: your-access-token
```

### HTTP模式示例

直接调用HTTP接口：

```bash
# 获取Swagger规范
curl -X POST http://127.0.0.1:8080/tools/getSwaggerSpecification

# 上传到ApiFox
curl -X POST http://127.0.0.1:8080/tools/uploadSwaggerToApiFox \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "your-project-id",
    "accessToken": "your-access-token",
    "swaggerJson": "your-swagger-json"
  }'
```

### 协议测试

```bash
# 运行MCP协议测试
node test/mcp-protocol-test.js
```

## 配置说明

主要配置项在 `config/config.json` 中：

```json
{
  "app": {
    "name": "doc-mcp",
    "port": 8080
  },
  "apifox": {
    "api": {
      "baseUrl": "https://api.apifox.com",
      "version": "2024-03-28"
    }
  },
  "mcp": {
    "server": {
      "enabled": true,
      "stdio": false,
      "name": "doc-mcp-server",
      "version": "1.0.0",
      "instructions": "This MCP server provides functionality to generate Swagger JSON and upload to ApiFox",
      "type": "SYNC",
      "capabilities": {
        "tool": true,
        "resource": false,
        "prompt": false,
        "completion": false
      }
    }
  }
}
```

## 技术架构

- **Node.js**: 运行时环境
- **@modelcontextprotocol/sdk**: MCP协议实现
- **Express**: HTTP服务器框架
- **Axios**: HTTP客户端
- **ES Modules**: 现代JavaScript模块系统

## 开发说明

项目结构：
```
src/
├── index.js                    # 主启动文件
├── mcp-server.js              # MCP协议服务器
├── http-server.js             # HTTP服务器（SSE端点）
├── SwaggerUploadService.js    # MCP工具实现
└── ApiFoxService.js           # ApiFox API集成服务
config/
└── config.json                # 应用配置
resources/
└── petstore-swagger.json      # Swagger示例文件
test/
└── *.test.js                  # 测试文件
```

## API端点

HTTP模式下提供以下端点：

- `GET /health` - 健康检查
- `GET /sse` - MCP客户端SSE连接端点
- `POST /tools/getSwaggerSpecification` - 获取Swagger规范
- `POST /tools/uploadSwaggerToApiFox` - 上传到ApiFox

## 与Java版本的对比

| 特性 | Java版本 | Node.js版本 |
|------|----------|-------------|
| 运行环境 | JDK 21 + Spring Boot | Node.js 18+ |
| MCP实现 | Spring AI MCP | @modelcontextprotocol/sdk |
| HTTP客户端 | WebFlux | Axios |
| 配置管理 | application.properties | config.json |
| 工具逻辑 | ✅ 完全一致 | ✅ 完全一致 |
| 部署方式 | JAR包 | npm start |

## 开发和测试

```bash
# 运行测试
npm test

# 测试工具调用
curl -X POST http://127.0.0.1:8080/tools/getSwaggerSpecification

# 测试ApiFox上传
curl -X POST http://127.0.0.1:8080/tools/uploadSwaggerToApiFox \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "your-project-id",
    "accessToken": "your-access-token",
    "swaggerJson": "your-swagger-json"
  }'
```

## 许可证

MIT License