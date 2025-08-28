import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SwaggerUploadService } from './SwaggerUploadService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP服务器主类
 */
class McpServer {
    constructor() {
        this.server = new Server(
            {
                name: 'doc-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupHandlers();
    }

    async initialize() {
        try {
            // 加载配置
            const configPath = path.resolve(__dirname, '../config/config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            this.config = JSON.parse(configData);

            // 初始化服务
            this.swaggerUploadService = new SwaggerUploadService(this.config);

            console.error('=== MCP服务器初始化完成 ==='); // 使用stderr避免干扰MCP通信
            console.error('服务器名称:', this.config.mcp.server.name);
            console.error('版本:', this.config.mcp.server.version);
            console.error('说明:', this.config.mcp.server.instructions);
        } catch (error) {
            console.error('MCP服务器初始化失败:', error);
            throw error;
        }
    }

    setupHandlers() {
        // 处理工具列表请求
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            if (!this.swaggerUploadService) {
                throw new McpError(ErrorCode.InternalError, '服务未初始化');
            }

            const tools = this.swaggerUploadService.getToolDefinitions();
            console.error('返回工具列表:', tools.map(t => t.name)); // 使用stderr
            return { tools };
        });

        // 处理工具调用请求
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            
            console.error(`=== 工具调用请求 ===`); // 使用stderr
            console.error('工具名称:', name);
            console.error('参数:', args);

            if (!this.swaggerUploadService) {
                throw new McpError(ErrorCode.InternalError, '服务未初始化');
            }

            try {
                const result = await this.swaggerUploadService.executeTool(name, args || {});
                return {
                    content: [
                        {
                            type: 'text',
                            text: result,
                        },
                    ],
                };
            } catch (error) {
                console.error('工具执行失败:', error);
                throw new McpError(ErrorCode.InternalError, `工具执行失败: ${error.message}`);
            }
        });
    }

    async run() {
        try {
            await this.initialize();
            
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            
            console.error('=== MCP服务器启动成功 ==='); // 使用stderr
            console.error('等待客户端连接...');
        } catch (error) {
            console.error('MCP服务器启动失败:', error);
            process.exit(1);
        }
    }
}

// 导出McpServer类
export { McpServer };

// 如果直接运行此文件（非stdio模式），则启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
    const mcpServer = new McpServer();
    mcpServer.run().catch(console.error);
}