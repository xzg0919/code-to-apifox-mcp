import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { SwaggerUploadService } from '../src/SwaggerUploadService.js';

describe('SwaggerUploadService', () => {
    let service;
    const mockConfig = {
        apifox: {
            api: {
                baseUrl: 'https://api.apifox.com',
                version: '2024-03-28'
            }
        }
    };

    before(() => {
        service = new SwaggerUploadService(mockConfig);
    });

    describe('getSwaggerSpecification', () => {
        it('应该返回包含Swagger规范的字符串', async () => {
            const result = await service.getSwaggerSpecification();
            
            assert(typeof result === 'string');
            assert(result.includes('Swagger参数规范示例（基于Petstore）'));
            assert(result.includes('完整的Swagger JSON'));
            assert(result.includes('使用说明'));
            assert(result.includes('重要注意事项'));
        });

        it('返回的规范应包含所有必要的说明部分', async () => {
            const result = await service.getSwaggerSpecification();
            
            // 检查是否包含所有重要的说明部分
            assert(result.includes('准确的paths生成'));
            assert(result.includes('完整的接口参数和返回'));
            assert(result.includes('随机模型名称'));
            assert(result.includes('接口文件夹名称'));
        });
    });

    describe('uploadSwaggerToApiFox', () => {
        it('应该验证必填参数', async () => {
            // 测试空的projectId
            const result1 = await service.uploadSwaggerToApiFox('', 'token', '{}');
            assert(result1 === '错误: projectId不能为空');

            // 测试空的accessToken
            const result2 = await service.uploadSwaggerToApiFox('123', '', '{}');
            assert(result2 === '错误: accessToken不能为空');

            // 测试空的swaggerJson
            const result3 = await service.uploadSwaggerToApiFox('123', 'token', '');
            assert(result3 === '错误: swaggerJson不能为空');
        });

        it('应该处理null参数', async () => {
            const result1 = await service.uploadSwaggerToApiFox(null, 'token', '{}');
            assert(result1 === '错误: projectId不能为空');

            const result2 = await service.uploadSwaggerToApiFox('123', null, '{}');
            assert(result2 === '错误: accessToken不能为空');

            const result3 = await service.uploadSwaggerToApiFox('123', 'token', null);
            assert(result3 === '错误: swaggerJson不能为空');
        });
    });

    describe('getToolDefinitions', () => {
        it('应该返回正确的工具定义', () => {
            const tools = service.getToolDefinitions();
            
            assert(Array.isArray(tools));
            assert(tools.length === 2);
            
            const getSwaggerTool = tools.find(t => t.name === 'getSwaggerSpecification');
            const uploadTool = tools.find(t => t.name === 'uploadSwaggerToApiFox');
            
            assert(getSwaggerTool !== undefined);
            assert(uploadTool !== undefined);
            
            // 验证getSwaggerSpecification工具描述
            assert(getSwaggerTool.description.includes('获取Swagger参数规范示例'));
            assert(getSwaggerTool.inputSchema.type === 'object');
            assert(Array.isArray(getSwaggerTool.inputSchema.required));
            assert(getSwaggerTool.inputSchema.required.length === 0);
            
            // 验证uploadSwaggerToApiFox工具描述  
            assert(uploadTool.description.includes('上传Swagger JSON到ApiFox平台'));
            assert(uploadTool.inputSchema.type === 'object');
            assert(Array.isArray(uploadTool.inputSchema.required));
            assert(uploadTool.inputSchema.required.includes('projectId'));
            assert(uploadTool.inputSchema.required.includes('accessToken'));
            assert(uploadTool.inputSchema.required.includes('swaggerJson'));
        });
    });

    describe('executeTool', () => {
        it('应该正确执行getSwaggerSpecification工具', async () => {
            const result = await service.executeTool('getSwaggerSpecification', {});
            assert(typeof result === 'string');
            assert(result.includes('Swagger参数规范示例'));
        });

        it('应该正确执行uploadSwaggerToApiFox工具', async () => {
            const args = {
                projectId: '123',
                accessToken: 'token',
                swaggerJson: '{}'
            };
            const result = await service.executeTool('uploadSwaggerToApiFox', args);
            // 由于网络请求会失败，我们预期返回错误信息
            assert(typeof result === 'string');
            assert(result.includes('上传失败') || result.includes('成功'));
        });

        it('应该抛出未知工具错误', async () => {
            try {
                await service.executeTool('unknownTool', {});
                assert.fail('应该抛出错误');
            } catch (error) {
                assert(error.message.includes('未知的工具'));
            }
        });
    });
});

console.log('SwaggerUploadService 测试完成');