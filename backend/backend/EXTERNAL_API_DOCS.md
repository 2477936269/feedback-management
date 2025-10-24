# 外部反馈API接口文档

## 概述

外部反馈API允许第三方系统通过API密钥认证的方式提交和查询反馈信息。所有接口都需要有效的API密钥进行认证。

## 认证方式

### API密钥认证
所有请求都需要在请求头中包含API密钥：

```http
X-API-Key: your-api-key-here
```

或者使用Authorization头：

```http
Authorization: Bearer your-api-key-here
```

## 接口列表

### 1. 提交反馈

**接口地址：** `POST /api/external/feedback/submit`

**请求头：**
```http
Content-Type: application/json
X-API-Key: your-api-key-here
```

**请求体：**
```json
{
  "title": "反馈标题（可选）",
  "content": "反馈内容（必填）",
  "type": "反馈类型（可选，默认：外部反馈）",
  "mediaType": "媒体类型（可选，默认：TEXT）",
  "priority": "优先级（可选：low/medium/high/urgent，默认：medium）",
  "contact": "联系方式（可选）",
  "attachments": [
    {
      "fileName": "文件名",
      "fileSize": 1024,
      "fileType": "image/jpeg",
      "fileUrl": "https://example.com/file.jpg",
      "fileContent": "base64编码的文件内容（可选）"
    }
  ],
  "externalId": "外部系统ID（可选）",
  "externalData": {
    "customField1": "自定义数据1",
    "customField2": "自定义数据2"
  },
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "反馈提交成功",
  "data": {
    "id": "uuid-string",
    "feedbackNo": "ABC123",
    "status": "PENDING",
    "mediaTypes": "IMAGE,VIDEO",
    "createdAt": "2025-01-15T10:30:00Z",
    "externalId": "external-system-id"
  }
}
```

### 2. 查询反馈状态

**接口地址：** `GET /api/external/feedback/status/{feedbackNo}`

**请求头：**
```http
X-API-Key: your-api-key-here
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "feedbackNo": "ABC123",
    "status": "PROCESSING",
    "reply": "我们正在处理您的反馈",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T11:00:00Z",
    "attachments": [
      {
        "fileName": "screenshot.jpg",
        "fileType": "image/jpeg",
        "fileSize": 1024000,
        "fileUrl": "/uploads/feedback/abc123.jpg"
      }
    ],
    "operationLogs": [
      {
        "action": "UPDATE_STATUS",
        "content": "状态从PENDING改为PROCESSING",
        "operator": "admin",
        "createdAt": "2025-01-15T11:00:00Z"
      }
    ]
  }
}
```

### 3. 批量查询反馈状态

**接口地址：** `POST /api/external/feedback/batch-status`

**请求头：**
```http
Content-Type: application/json
X-API-Key: your-api-key-here
```

**请求体：**
```json
{
  "feedbackNos": ["ABC123", "DEF456", "GHI789"]
}
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string-1",
      "feedbackNo": "ABC123",
      "status": "SOLVED",
      "reply": "问题已解决",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T12:00:00Z",
      "attachments": []
    },
    {
      "id": "uuid-string-2",
      "feedbackNo": "DEF456",
      "status": "PENDING",
      "createdAt": "2025-01-15T11:00:00Z",
      "updatedAt": "2025-01-15T11:00:00Z",
      "attachments": []
    }
  ]
}
```

## 状态码说明

### 反馈状态
- `PENDING`: 待处理
- `PROCESSING`: 处理中
- `SOLVED`: 已解决
- `REJECTED`: 已拒绝

### 优先级
- `low`: 低
- `medium`: 中
- `high`: 高
- `urgent`: 紧急

### 媒体类型
- `TEXT`: 文本
- `IMAGE`: 图片
- `VIDEO`: 视频
- `VOICE`: 语音
- `LINK`: 链接

## 错误响应

### 认证错误
```json
{
  "success": false,
  "message": "缺少API密钥",
  "code": "MISSING_API_KEY"
}
```

```json
{
  "success": false,
  "message": "无效的API密钥",
  "code": "INVALID_API_KEY"
}
```

### 权限错误
```json
{
  "success": false,
  "message": "没有提交反馈的权限",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

### 验证错误
```json
{
  "success": false,
  "message": "数据验证失败",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "content",
      "message": "反馈内容不能为空"
    }
  ]
}
```

## 使用示例

### JavaScript/TypeScript

```typescript
import { createExternalFeedbackService } from './externalFeedbackService';

// 创建服务实例
const feedbackService = createExternalFeedbackService(
  'http://localhost:50008',
  'your-api-key-here'
);

// 提交反馈
async function submitFeedback() {
  try {
    const result = await feedbackService.submitFeedback({
      title: '系统登录问题',
      content: '用户无法正常登录系统，点击登录按钮无响应',
      priority: 'high',
      contact: 'user@example.com',
      attachments: [
        {
          fileName: 'screenshot.jpg',
          fileSize: 1024000,
          fileType: 'image/jpeg',
          fileUrl: 'https://example.com/screenshot.jpg'
        }
      ],
      externalId: 'external-feedback-001'
    });
    
    console.log('反馈提交成功:', result.data);
  } catch (error) {
    console.error('提交失败:', error.message);
  }
}

// 查询反馈状态
async function checkStatus() {
  try {
    const result = await feedbackService.getFeedbackStatus('ABC123');
    console.log('反馈状态:', result.data);
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}
```

### cURL示例

```bash
# 提交反馈
curl -X POST http://localhost:50008/api/external/feedback/submit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "title": "系统登录问题",
    "content": "用户无法正常登录系统",
    "priority": "high",
    "contact": "user@example.com"
  }'

# 查询反馈状态
curl -X GET http://localhost:50008/api/external/feedback/status/ABC123 \
  -H "X-API-Key: your-api-key-here"
```

## 注意事项

1. **API密钥安全**：请妥善保管API密钥，不要在客户端代码中硬编码
2. **请求频率限制**：每个IP地址15分钟内最多100个请求
3. **文件大小限制**：单个文件最大10MB
4. **批量查询限制**：批量查询最多支持100个反馈编号
5. **时间格式**：所有时间字段使用ISO 8601格式（UTC时间）
6. **媒体类型检测**：系统会根据文件扩展名和MIME类型自动检测媒体类型

## 权限说明

外部系统需要以下权限才能调用相应接口：

- `feedback:submit`: 提交反馈
- `feedback:query`: 查询反馈状态
- `stats:view`: 查看统计信息（预留）

## 联系支持

如有问题，请联系技术支持团队。
