/**
 * API Client for Backend Integration
 * Handles all HTTP requests to the FastAPI backend with JWT token management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_PREFIX = '/v1'

export interface ApiError {
  detail: string
  request_id?: string
  status?: number
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

class ApiClient {
  private baseURL: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_PREFIX}`
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token')
      this.refreshToken = localStorage.getItem('refresh_token')
    }
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        })

        if (!response.ok) {
          this.clearTokens()
          throw new Error('Failed to refresh token')
        }

        const data = await response.json()
        const newAccessToken = data.access_token
        const newRefreshToken = data.refresh_token || this.refreshToken!
        this.setTokens(newAccessToken, newRefreshToken)
        return newAccessToken
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  /**
   * Make authenticated request with automatic token refresh
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add authorization header if token exists
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 - try to refresh token
    if (response.status === 401 && this.refreshToken && endpoint !== '/auth/refresh') {
      try {
        const newAccessToken = await this.refreshAccessToken()
        headers['Authorization'] = `Bearer ${newAccessToken}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      } catch (error) {
        this.clearTokens()
        // Redirect to login or trigger logout
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }
        throw error
      }
    }

    // Handle errors
    if (!response.ok) {
      let error: ApiError
      try {
        const errorData = await response.json()
        error = {
          detail: errorData.detail || errorData.message || 'An error occurred',
          request_id: errorData.request_id,
          status: response.status,
        }
      } catch {
        error = {
          detail: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        }
      }
      throw error
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T
    }

    return response.json()
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : ''
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.post<{
      user: any
      tokens: {
        access_token: string
        refresh_token: string
        token_type: string
        expires_in: number
      }
    }>('/auth/login', { email, password })
  }

  async register(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) {
    return this.post<{
      user: any
      tokens: {
        access_token: string
        refresh_token: string
        token_type: string
        expires_in: number
      }
    }>('/auth/register', userData)
  }

  async getCurrentUser() {
    return this.get<any>('/auth/me')
  }

  // Leads endpoints
  async getLeads(params?: {
    page?: number
    limit?: number
    status?: string
    source?: string
  }) {
    return this.get<PaginatedResponse<any>>('/leads', params)
  }

  async createLead(data: {
    email: string
    phone?: string
    first_name?: string
    last_name?: string
    company?: string
    job_title?: string
    source?: string
    tags?: string[]
  }) {
    return this.post<any>('/leads', data)
  }

  async getLead(id: string) {
    return this.get<any>(`/leads/${id}`)
  }

  async updateLead(id: string, data: {
    status?: string
    score?: number
    assigned_to?: string
    tags?: string[]
  }) {
    return this.patch<any>(`/leads/${id}`, data)
  }

  async deleteLead(id: string) {
    return this.delete(`/leads/${id}`)
  }

  // Lead Flows endpoints
  async getLeadFlows(params?: {
    page?: number
    limit?: number
  }) {
    return this.get<PaginatedResponse<any>>('/leads/flows', params)
  }

  async createLeadFlow(data: {
    name: string
    description?: string
    trigger_type: string
    trigger_conditions?: Record<string, any>
    steps?: any[]
  }) {
    return this.post<any>('/leads/flows', data)
  }

  async getLeadFlow(id: string) {
    return this.get<any>(`/leads/flows/${id}`)
  }

  async updateLeadFlow(id: string, data: {
    name?: string
    description?: string
    trigger_type?: string
    trigger_conditions?: Record<string, any>
    steps?: any[]
    is_active?: boolean
  }) {
    return this.patch<any>(`/leads/flows/${id}`, data)
  }

  async deleteLeadFlow(id: string) {
    return this.delete(`/leads/flows/${id}`)
  }

  async toggleLeadFlow(id: string) {
    return this.post<any>(`/leads/flows/${id}/activate`)
  }

  async getLeadFlowStats(id: string) {
    return this.get<any>(`/leads/flows/${id}/stats`)
  }

  // Content endpoints
  async getContent(params?: {
    page?: number
    limit?: number
    status?: string
    content_type?: string
  }) {
    return this.get<PaginatedResponse<any>>('/content', params)
  }

  async createContent(data: any) {
    return this.post<any>('/content', data)
  }

  async getContentItem(id: string) {
    return this.get<any>(`/content/${id}`)
  }

  async updateContent(id: string, data: any) {
    return this.patch<any>(`/content/${id}`, data)
  }

  async deleteContent(id: string) {
    return this.delete(`/content/${id}`)
  }

  // Email Campaign endpoints
  async getEmailCampaigns(params?: {
    page?: number
    limit?: number
    status?: string
  }) {
    return this.get<PaginatedResponse<any>>('/email/campaigns', params)
  }

  async createEmailCampaign(data: any) {
    return this.post<any>('/email/campaigns', data)
  }

  async getEmailCampaign(id: string) {
    return this.get<any>(`/email/campaigns/${id}`)
  }

  async updateEmailCampaign(id: string, data: any) {
    return this.patch<any>(`/email/campaigns/${id}`, data)
  }

  async deleteEmailCampaign(id: string) {
    return this.delete(`/email/campaigns/${id}`)
  }

  // Social Post endpoints
  async getSocialPosts(params?: {
    page?: number
    limit?: number
    platform?: string
    status?: string
  }) {
    return this.get<PaginatedResponse<any>>('/social/posts', params)
  }

  async createSocialPost(data: any) {
    return this.post<any>('/social/posts', data)
  }

  async updateSocialPost(id: string, data: any) {
    return this.patch<any>(`/social/posts/${id}`, data)
  }

  async deleteSocialPost(id: string) {
    return this.delete(`/social/posts/${id}`)
  }

  // Workflow endpoints
  async getWorkflows(params?: {
    page?: number
    limit?: number
  }) {
    return this.get<PaginatedResponse<any>>('/workflows', params)
  }

  async createWorkflow(data: any) {
    return this.post<any>('/workflows', data)
  }

  async getWorkflow(id: string) {
    return this.get<any>(`/workflows/${id}`)
  }

  async updateWorkflow(id: string, data: { is_active?: boolean; [key: string]: any }) {
    return this.patch<any>(`/workflows/${id}`, data)
  }

  async deleteWorkflow(id: string) {
    return this.delete(`/workflows/${id}`)
  }

  async runWorkflow(id: string) {
    return this.post<any>(`/workflows/${id}/run`)
  }

  // Agent endpoints
  async getAgents(params?: {
    page?: number
    limit?: number
  }) {
    return this.get<PaginatedResponse<any>>('/agents', params)
  }

  async createAgent(data: any) {
    return this.post<any>('/agents', data)
  }

  async getAgent(id: string) {
    return this.get<any>(`/agents/${id}`)
  }

  async updateAgent(id: string, data: any) {
    return this.patch<any>(`/agents/${id}`, data)
  }

  async deleteAgent(id: string) {
    return this.delete(`/agents/${id}`)
  }

  // Analytics endpoints
  async getDashboardAnalytics(params?: {
    start_date?: string
    end_date?: string
    product_id?: string
  }) {
    return this.get<any>('/analytics/dashboard', params)
  }

  // CRM endpoints
  async getContacts(params?: {
    page?: number
    limit?: number
  }) {
    return this.get<PaginatedResponse<any>>('/crm/contacts', params)
  }

  async createContact(data: any) {
    return this.post<any>('/crm/contacts', data)
  }

  async getDeals(params?: {
    page?: number
    limit?: number
    stage?: string
  }) {
    return this.get<PaginatedResponse<any>>('/crm/deals', params)
  }

  async createDeal(data: any) {
    return this.post<any>('/crm/deals', data)
  }

  // Calendar endpoints
  async getCalendarEvents(params?: {
    page?: number
    limit?: number
    start_date?: string
    end_date?: string
    event_type?: string
  }) {
    return this.get<PaginatedResponse<any>>('/calendar/events', params)
  }

  async createCalendarEvent(data: {
    title: string
    description?: string
    event_type?: string
    start_time: string
    end_time?: string
    all_day?: boolean
    location?: string
  }) {
    return this.post<any>('/calendar/events', data)
  }

  async updateCalendarEvent(id: string, data: any) {
    return this.patch<any>(`/calendar/events/${id}`, data)
  }

  async deleteCalendarEvent(id: string) {
    return this.delete(`/calendar/events/${id}`)
  }

  // Approvals endpoints
  async getApprovals(params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
  }) {
    return this.get<PaginatedResponse<any>>('/approvals', params)
  }

  async approveItem(id: string, comments?: string) {
    return this.post<any>(`/approvals/${id}/approve`, { comments })
  }

  async rejectItem(id: string, comments?: string) {
    return this.post<any>(`/approvals/${id}/reject`, { comments })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

