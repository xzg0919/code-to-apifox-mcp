import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SwaggerUploadService } from './SwaggerUploadService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HTTP服务器 - 提供SSE端点用于MCP通信
 */
class HttpServer {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    async initialize() {
        try {
            // 加载配置
            const configPath = path.resolve(__dirname, '../config/config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            this.config = JSON.parse(configData);

            // 初始化服务
            this.swaggerUploadService = new SwaggerUploadService(this.config);

            console.log('=== HTTP服务器初始化完成 ===');
        } catch (error) {
            console.error('HTTP服务器初始化失败:', error);
            throw error;
        }
    }

    setupMiddleware() {
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS设置
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });
    }

    setupRoutes() {
        // 健康检查端点
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'UP', 
                service: 'doc-mcp-server',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            });
        });

        // MCP工具端点 - 获取Swagger规范
        this.app.post('/tools/getSwaggerSpecification', async (req, res) => {
            try {
                const result = await this.swaggerUploadService.getSwaggerSpecification();
                res.json({ success: true, data: result });
            } catch (error) {
                console.error('获取Swagger规范失败:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // MCP工具端点 - 上传到ApiFox
        this.app.post('/tools/uploadSwaggerToApiFox', async (req, res) => {
            try {
                const { projectId, accessToken, swaggerJson } = req.body;
                const result = await this.swaggerUploadService.uploadSwaggerToApiFox(projectId, accessToken, swaggerJson);
                res.json({ success: true, data: result });
            } catch (error) {
                console.error('上传到ApiFox失败:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // SSE端点 - 用于MCP客户端连接
        this.app.get('/sse', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            });

            // 发送初始连接消息
            res.write(`data: ${JSON.stringify({
                type: 'connection',
                status: 'connected',
                server: 'doc-mcp-server',
                version: '1.0.0',
                capabilities: ['tools'],
                tools: this.swaggerUploadService ? this.swaggerUploadService.getToolDefinitions() : []
            })}\\n\\n`);

            // 保持连接活跃
            const heartbeat = setInterval(() => {
                res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\\n\\n`);
            }, 30000);

            req.on('close', () => {
                clearInterval(heartbeat);
                console.log('SSE客户端断开连接');
            });
        });

        // 错误处理
        this.app.use((error, req, res, next) => {
            console.error('HTTP服务器错误:', error);
            res.status(500).json({ success: false, error: error.message });
        });
    }

    async start() {
        await this.initialize();
        
        const port = this.config.app.port || 8080;
        
        return new Promise((resolve, reject) => {
            const server = this.app.listen(port, (error) => {
                if (error) {
                    reject(error);
                } else {
                    console.log('=== HTTP服务器启动成功 ===');
                    console.log(`服务器地址: http://127.0.0.1:${port}`);
                    console.log(`SSE端点: http://127.0.0.1:${port}/sse`);
                    console.log(`健康检查: http://127.0.0.1:${port}/health`);
                    resolve(server);
                }
            });
        });
    }
}

export { HttpServer };