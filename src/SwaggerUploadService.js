import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiFoxService } from './ApiFoxService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Swagger上传到ApiFox的服务
 */
export class SwaggerUploadService {
    constructor(config) {
        this.apiFoxService = new ApiFoxService(config);
        
        // 检查是否是stdio模式
        this.isStdioMode = process.argv.includes('--stdio');
        
        const logFunc = this.isStdioMode ? console.error : console.log;
        logFunc('=== SwaggerUploadService 初始化完成 ===');
        logFunc('ApiFoxService:', this.apiFoxService);
    }

    // 日志输出方法
    log(...args) {
        if (this.isStdioMode) {
            console.error(...args);
        } else {
            console.log(...args);
        }
    }

    /**
     * 获取Swagger参数规范示例
     * 工具描述与Java版本完全一致
     */
    async getSwaggerSpecification() {
        try {
            this.log('=== 获取Swagger规范工具被调用 ===');
            
            // 从resources读取petstore swagger.json
            const swaggerPath = path.resolve(__dirname, '../resources/petstore-swagger.json');
            const swaggerJson = await fs.readFile(swaggerPath, 'utf8');
            
            this.log('成功读取Swagger规范示例');
            
            return `Swagger参数规范示例（基于Petstore）：

这是一个完整的Swagger 2.0 JSON格式示例，包含以下主要部分：

1. **基本信息 (info)**：
   - title: API标题
   - version: API版本
   - description: API描述
   - contact: 联系信息
   - license: 许可证信息

2. **服务器信息**：
   - host: 主机地址
   - basePath: 基础路径
   - schemes: 支持的协议

3. **标签 (tags)**：API分组标签

4. **路径 (paths)**：具体的API端点定义

5. **安全定义 (securityDefinitions)**：认证方式

6. **数据模型 (definitions)**：请求/响应的数据结构

完整的Swagger JSON：
${swaggerJson}

使用说明：
- 参考此格式创建你自己的API文档
- 修改info部分的基本信息
- 定义你的API路径和方法
- 创建相应的数据模型
- 然后使用uploadSwaggerToApiFox工具上传到ApiFox

重要注意事项：
1. **准确的paths生成**：
   - 仔细阅读代码和项目路由配置
   - 根据实际的Controller路径和@RequestMapping注解生成准确的paths
   - 确保paths与实际部署的API路径一致

2. **完整的接口参数和返回**：
   - 仔细阅读接口代码，生成完整的参数定义
   - 准确识别接口返回类型，如果有包装类应该使用包装类进行封装
   - 包括所有必填和可选参数，以及正确的数据类型
   - 确保响应模型与实际返回的数据结构完全一致
   - 应避免无意义的参数 如权限参数或者token之类的公用接口参数

3. **随机模型名称**：
   - 生成的参数和返回的数据模型应该使用随机的模型名称
   - 避免因模型名称一致导致影响其他接口的数据模型
   - 建议使用项目名+接口名+随机后缀的方式命名模型
   - 例如：UserLoginRequest_abc123、ProductListResponse_xyz789

4.**接口文件夹名称**：
   - 如果能够获取到类型controller层的描述或者注释，可以作为接口文件夹的名称
   - 如果没有，可以使用controller类名作为接口文件夹的名称`;
                    
        } catch (error) {
            console.error('读取Swagger规范文件失败', error);
            return `获取Swagger规范失败: ${error.message}`;
        }
    }

    /**
     * 上传Swagger JSON到ApiFox平台
     * 工具描述和实现逻辑与Java版本完全一致
     */
    async uploadSwaggerToApiFox(projectId, accessToken, swaggerJson) {
        try {
            this.log('===========================================');
            this.log('=== MCP工具 uploadSwaggerToApiFox 被调用 ===');
            this.log('===========================================');
            this.log('调用时间:', new Date().toLocaleString());
            this.log('线程:', 'main');
            this.log('参数详情:');
            this.log('  - projectId:', projectId);
            this.log('  - accessToken:', accessToken ? '***已提供***' : 'null');
            this.log('  - swaggerJson长度:', swaggerJson ? swaggerJson.length : 0);
            this.log('开始上传Swagger JSON到ApiFox');

            // 验证参数
            if (!projectId || !projectId.trim()) {
                return '错误: projectId不能为空';
            }
            if (!accessToken || !accessToken.trim()) {
                return '错误: accessToken不能为空';
            }
            if (!swaggerJson || !swaggerJson.trim()) {
                return '错误: swaggerJson不能为空';
            }

            // 上传到ApiFox - 使用超时避免无限等待
            const result = await this.apiFoxService.uploadSwaggerToApiFox(projectId, accessToken, swaggerJson, null);

            return `成功上传Swagger文档到ApiFox！
项目ID: ${projectId}
结果: ${JSON.stringify(result, null, 2)}`;

        } catch (error) {
            console.error('执行Swagger上传工具失败', error);
            return `上传失败: ${error.message}`;
        }
    }

    /**
     * 获取MCP工具定义
     */
    getToolDefinitions() {
        return [
            {
                name: 'getSwaggerSpecification',
                description: '获取Swagger参数规范示例，返回标准的Swagger JSON格式规范，基于Petstore示例。使用此工具了解正确的Swagger JSON结构，然后可以参考此格式创建自己的API文档并使用uploadSwaggerToApiFox工具上传。',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'uploadSwaggerToApiFox',
                description: '上传Swagger JSON到ApiFox平台。参数：projectId(ApiFox项目ID,必填), accessToken(ApiFox访问令牌,必填), swaggerJson(完整的Swagger JSON字符串,必填)。建议先使用getSwaggerSpecification工具获取规范格式。',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'ApiFox项目ID'
                        },
                        accessToken: {
                            type: 'string',
                            description: 'ApiFox访问令牌'
                        },
                        swaggerJson: {
                            type: 'string',
                            description: '完整的Swagger JSON字符串'
                        }
                    },
                    required: ['projectId', 'accessToken', 'swaggerJson']
                }
            }
        ];
    }

    /**
     * 执行工具调用
     */
    async executeTool(name, args) {
        switch (name) {
            case 'getSwaggerSpecification':
                return await this.getSwaggerSpecification();
            case 'uploadSwaggerToApiFox':
                return await this.uploadSwaggerToApiFox(args.projectId, args.accessToken, args.swaggerJson);
            default:
                throw new Error(`未知的工具: ${name}`);
        }
    }
}