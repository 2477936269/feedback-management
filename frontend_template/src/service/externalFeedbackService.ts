// 外部反馈API服务
export interface ExternalFeedbackAttachment {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl?: string;
  fileContent?: string; // base64编码的文件内容
}

export interface ExternalFeedbackData {
  // 基本信息
  title?: string;
  content: string;
  type?: string;
  
  // 媒体类型（支持多个，用逗号分隔）
  mediaType?: string;
  
  // 优先级
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  
  // 联系方式
  contact?: string;
  
  // 附件信息
  attachments?: ExternalFeedbackAttachment[];
  
  // 外部系统相关信息
  externalId?: string; // 外部系统的反馈ID
  externalData?: Record<string, any>; // 外部系统的额外数据
  
  // 时间信息
  createdAt?: string; // ISO格式时间字符串
}

export interface ExternalFeedbackResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    feedbackNo: string;
    status: string;
    mediaTypes: string;
    createdAt: string;
    externalId?: string;
  };
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface FeedbackStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    feedbackNo: string;
    status: string;
    reply?: string;
    createdAt: string;
    updatedAt: string;
    attachments: Array<{
      fileName: string;
      fileType: string;
      fileSize: number;
      fileUrl: string;
    }>;
    operationLogs: Array<{
      action: string;
      content: string;
      operator: string;
      createdAt: string;
    }>;
  };
  code?: string;
}

export interface BatchStatusResponse {
  success: boolean;
  data?: Array<{
    id: string;
    feedbackNo: string;
    status: string;
    reply?: string;
    createdAt: string;
    updatedAt: string;
    attachments: Array<{
      fileName: string;
      fileType: string;
      fileSize: number;
      fileUrl: string;
    }>;
  }>;
}

class ExternalFeedbackService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾的斜杠
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/external/feedback${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  }

  /**
   * 提交外部反馈
   * @param feedbackData 反馈数据
   * @returns 提交结果
   */
  async submitFeedback(feedbackData: ExternalFeedbackData): Promise<ExternalFeedbackResponse> {
    return this.makeRequest<ExternalFeedbackResponse>('/submit', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  /**
   * 查询反馈状态
   * @param feedbackNo 反馈编号
   * @returns 反馈状态信息
   */
  async getFeedbackStatus(feedbackNo: string): Promise<FeedbackStatusResponse> {
    return this.makeRequest<FeedbackStatusResponse>(`/status/${feedbackNo}`, {
      method: 'GET',
    });
  }

  /**
   * 批量查询反馈状态
   * @param feedbackNos 反馈编号数组
   * @returns 批量反馈状态信息
   */
  async getBatchFeedbackStatus(feedbackNos: string[]): Promise<BatchStatusResponse> {
    return this.makeRequest<BatchStatusResponse>('/batch-status', {
      method: 'POST',
      body: JSON.stringify({ feedbackNos }),
    });
  }

  /**
   * 将文件转换为base64编码
   * @param file 文件对象
   * @returns base64编码的字符串
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除data:image/jpeg;base64,前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 创建附件对象（包含base64内容）
   * @param file 文件对象
   * @returns 附件对象
   */
  async createAttachmentWithContent(file: File): Promise<ExternalFeedbackAttachment> {
    const fileContent = await this.fileToBase64(file);
    
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileContent,
    };
  }

  /**
   * 创建附件对象（仅包含URL）
   * @param file 文件对象
   * @param fileUrl 文件URL
   * @returns 附件对象
   */
  createAttachmentWithUrl(file: File, fileUrl: string): ExternalFeedbackAttachment {
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl,
    };
  }
}

// 创建默认实例（需要配置API密钥）
export const createExternalFeedbackService = (baseUrl: string, apiKey: string) => {
  return new ExternalFeedbackService(baseUrl, apiKey);
};

// 导出类供直接使用
export default ExternalFeedbackService;
