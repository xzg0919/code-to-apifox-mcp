import { spawn } from 'child_process';
import { readFileSync } from 'fs';

/**
 * MCP协议测试脚本
 * 测试stdio模式下的工具调用
 */

class McpTester {
    constructor() {
        this.requestId = 1;
    }

    async testMcpServer() {
        console.log('=== MCP协议测试开始 ===');
        
        // 启动MCP服务器进程
        const mcpProcess = spawn('node', ['src/index.js', '--stdio'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let responseBuffer = '';
        
        mcpProcess.stdout.on('data', (data) => {
            responseBuffer += data.toString();
            this.handleResponse(responseBuffer);
        });

        mcpProcess.stderr.on('data', (data) => {
            console.log('服务器日志:', data.toString());
        });

        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // 1. 测试初始化
            console.log('\\n1. 测试MCP初始化...');
            await this.sendRequest(mcpProcess, {
                jsonrpc: '2.0',
                id: this.requestId++,
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {}
                    },
                    clientInfo: {
                        name: 'test-client',
                        version: '1.0.0'
                    }
                }
            });

            // 2. 测试工具列表
            console.log('\\n2. 测试获取工具列表...');
            await this.sendRequest(mcpProcess, {
                jsonrpc: '2.0',
                id: this.requestId++,
                method: 'tools/list',
                params: {}
            });

            // 3. 测试getSwaggerSpecification工具
            console.log('\\n3. 测试getSwaggerSpecification工具...');
            await this.sendRequest(mcpProcess, {
                jsonrpc: '2.0',
                id: this.requestId++,
                method: 'tools/call',
                params: {
                    name: 'getSwaggerSpecification',
                    arguments: {}
                }
            });

            console.log('\\n=== MCP协议测试完成 ===');
            
        } catch (error) {
            console.error('测试失败:', error);
        } finally {
            mcpProcess.kill();
        }
    }

    async sendRequest(process, request) {
        const requestStr = JSON.stringify(request) + '\\n';
        console.log('发送请求:', JSON.stringify(request, null, 2));
        process.stdin.write(requestStr);
        
        // 等待响应
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    handleResponse(buffer) {
        const lines = buffer.split('\\n').filter(line => line.trim());
        
        for (const line of lines) {
            try {
                const response = JSON.parse(line);
                console.log('收到响应:', JSON.stringify(response, null, 2));
            } catch (e) {
                // 忽略非JSON行
            }
        }
    }
}

// 运行测试
const tester = new McpTester();
tester.testMcpServer().catch(console.error);