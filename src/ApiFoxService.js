import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ApiFox API集成服务
 */
export class ApiFoxService {
    constructor(config) {
        this.apiFoxBaseUrl = config?.apifox?.api?.baseUrl || 'https://api.apifox.com';
        this.apiVersion = config?.apifox?.api?.version || '2024-03-28';
        this.defaultProjectId = config?.apifox?.api?.projectId || '';
        this.defaultAccessToken = config?.apifox?.api?.accessToken || '';
        
        // 检查是否是stdio模式
        this.isStdioMode = process.argv.includes('--stdio');
        
        const logFunc = this.isStdioMode ? console.error : console.log;
        logFunc('ApiFoxService 初始化完成');
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
     * 上传Swagger JSON到ApiFox
     *
     * @param {string} projectId 项目ID
     * @param {string} accessToken 访问令牌
     * @param {string} swaggerJson Swagger JSON字符串
     * @param {Object} options 导入选项
     * @returns {Promise<Object>} 上传结果
     */
    async uploadSwaggerToApiFox(projectId, accessToken, swaggerJson, options = null) {
        try {
            // 构建请求体 - 直接传递JSON字符串，过滤null值
            const requestBody = {};
            if (swaggerJson && swaggerJson.trim()) {
                requestBody.input = swaggerJson;
            }

            // 格式化JSON用于Postman测试，排除null值
            try {
                const formattedJson = JSON.stringify(requestBody, null, 2);
                this.log('=== ApiFox请求体 (Postman格式) ===');
                this.log(`\\n${formattedJson}`);
                this.log('=== 请求URL ===');
                this.log(`POST ${this.apiFoxBaseUrl}/v1/projects/${projectId}/import-openapi?locale=zh-CN`);
                this.log('=== 请求头 ===');
                this.log(`Authorization: Bearer ${accessToken}`);
                this.log(`X-Apifox-Api-Version: ${this.apiVersion}`);
                this.log('Content-Type: application/json');
                this.log('===============================');
            } catch (e) {
                this.log('ApiFox请求体:', requestBody);
            }

            this.log(`开始上传到ApiFox - 项目ID: ${projectId}, API版本: ${this.apiVersion}`);

            const response = await axios({
                method: 'POST',
                url: `${this.apiFoxBaseUrl}/v1/projects/${projectId}/import-openapi?locale=zh-CN`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Apifox-Api-Version': this.apiVersion,
                    'Content-Type': 'application/json'
                },
                data: requestBody,
                timeout: 30000 // 30秒超时
            });

            this.log('成功上传到ApiFox:', response.data);
            return response.data;

        } catch (error) {
            if (error.response) {
                console.error(`ApiFox API错误响应 - 状态码: ${error.response.status}, 响应体:`, error.response.data);
                throw new Error(`ApiFox API调用失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else {
                console.error('上传到ApiFox失败', error);
                throw new Error(`上传到ApiFox失败: ${error.message}`);
            }
        }
    }
}