#!/usr/bin/env node

import { HttpServer } from './http-server.js';

/**
 * Doc-MCP 应用主入口
 * 基于Node.js重写的MCP服务器，提供Swagger规范获取和ApiFox上传功能
 */

console.log('=== 启动MCP服务器应用 ===');

async function main() {
    try {
        // 检查命令行参数
        const args = process.argv.slice(2);
        const mode = args.includes('--stdio') ? 'stdio' : 'http';
        
        if (mode === 'stdio') {
            // STDIO模式 - 用于MCP客户端直接连接
            console.error('启动模式: STDIO'); // 使用stderr避免干扰MCP通信
            
            // 动态导入并启动MCP服务器
            const { McpServer } = await import('./mcp-server.js');
            const mcpServer = new McpServer();
            await mcpServer.run();
        } else {
            // HTTP模式 - 用于云服务器部署
            console.log('启动模式: HTTP');
            const httpServer = new HttpServer();
            await httpServer.start();
        }
        
        if (mode === 'http') {
            console.log('=== MCP服务器应用启动完成 ===');
        } else {
            console.error('=== MCP服务器应用启动完成 ==='); // STDIO模式使用stderr
        }
        
    } catch (error) {
        console.error('=== MCP服务器启动失败 ===', error);
        process.exit(1);
    }
}

// 优雅关闭处理
process.on('SIGINT', () => {
    console.log('\\n=== 收到SIGINT信号，正在关闭服务器 ===');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\\n=== 收到SIGTERM信号，正在关闭服务器 ===');
    process.exit(0);
});

main().catch(console.error);