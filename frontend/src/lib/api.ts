export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface CheckInUpdate {
    status: 'done' | 'partial' | 'missed';
    use_freeze?: boolean;
}

export interface StreakFreezeResponse {
    streak_freeze_count: number;
}

export interface GhostModeStatus {
    ghost_mode: boolean;
    pending_task: RedemptionTask | null;
}

export interface RedemptionTask {
    _id: string;
    user_id: string;
    description: string;
    link?: string;
    submitted_at: string;
    cosigns: string[];
    status: 'pending' | 'approved';
}

export interface AtonementRule {
    _id: string;
    threshold: number;
    description: string;
    active_atonement_ids: string[];
}

export type ContributionType = "taught_concept" | "shared_resource" | "brain_dump" | "reflection";

export interface FileMeta {
    _id: string;
    uploader_id: string;
    original_filename: string;
    content_type: string;
    size_bytes: number;
    storage_key: string;
    created_at: string;
}

export interface UserPublic {
    _id: string;
    name: string;
    avatar_seed: string;
    points_total: number;
    current_streak: number;
}

export interface Post {
    _id: string;
    user_id: string;
    title: string;
    body: string | null;
    tags: string[];
    contribution_type: ContributionType;
    file_id: string | null;
    created_at: string;
    updated_at: string;
    edited: boolean;
    author: UserPublic;
}

export interface PostCreate {
    title: string;
    body: string | null;
    tags: string[];
    contribution_type: ContributionType;
    file_id: string | null;
}

export interface PostUpdate {
    title?: string;
    body?: string;
    tags?: string[];
    contribution_type?: ContributionType;
}

export interface AtonementInstance {
    _id: string;
    user_id: string;
    rule_id: string;
    description: string;
    activated_at: string;
    completed_at?: string;
    status: 'pending' | 'completed';
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // essential for httpOnly cookies
  });

  if (!response.ok) {
    let message = 'API Error';
    try {
      const errData = await response.json();
      message = errData.detail || errData.message || message;
    } catch (e) {
      // ignore
    }
    
    // If it's a 401, we might want to trigger a global logout or redirect
    if (response.status === 401) {
        // We'll let the components handle 401 via AuthContext for now
    }
    
    throw new ApiError(message, response.status);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const Api = {
    fetchHealth: async () => {
        try {
            return await fetchApi<{status: string, db: string}>('/health');
        } catch (error) {
            console.error("Health check failed:", error);
            return { status: 'error', db: 'disconnected' };
        }
    },
    
    createOrUpdateCommitment: (content: string, format: string) => {
        return fetchApi<any>('/commitments', {
            method: 'POST',
            body: JSON.stringify({ content, format })
        });
    },

    getMyTodayCommitment: () => {
        return fetchApi<any>('/commitments/me/today');
    },

    checkInCommitment: (commitmentId: string, status: string, use_freeze?: boolean) => {
        return fetchApi<any>(`/commitments/${commitmentId}/check-in`, {
            method: 'POST',
            body: JSON.stringify({ status, use_freeze })
        });
    },

    getSquadTodayStatus: () => {
        return fetchApi<any[]>('/commitments/squad/today');
    },

    getStreakFreezes: () => fetchApi<StreakFreezeResponse>('/users/me/streak-freezes'),

    getGhostModeStatus: () => fetchApi<GhostModeStatus>('/ghost-mode/me'),

    submitRedemptionTask: (description: string, link?: string) => fetchApi<RedemptionTask>('/ghost-mode/redemption', {
        method: 'POST',
        body: JSON.stringify({ description, link })
    }),

    cosignRedemptionTask: (taskId: string) => fetchApi<RedemptionTask>(`/ghost-mode/redemption/${taskId}/cosign`, {
        method: 'POST'
    }),

    getAtonementRules: () => fetchApi<AtonementRule[]>('/atonement/rules'),

    getMyAtonementInstances: () => fetchApi<AtonementInstance[]>('/atonement/me'),
    completeAtonementInstance: (id: string) => fetchApi<{status: string}>(`/atonement/${id}/complete`, { method: 'POST' }),

    // Posts & Files (Phase 4)
    createPost: (data: PostCreate) => fetchApi<Post>('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    getFeed: (query?: { tags?: string[], contribution_type?: string, user_id?: string, q?: string, limit?: number, skip?: number }) => {
        let qs = '';
        if (query) {
            const params = new URLSearchParams();
            if (query.tags) query.tags.forEach(t => params.append('tags', t));
            if (query.contribution_type) params.append('contribution_type', query.contribution_type);
            if (query.user_id) params.append('user_id', query.user_id);
            if (query.q) params.append('q', query.q);
            if (query.limit) params.append('limit', query.limit.toString());
            if (query.skip) params.append('skip', query.skip.toString());
            const str = params.toString();
            if (str) qs = `?${str}`;
        }
        return fetchApi<Post[]>(`/posts${qs}`);
    },
    getPost: (id: string) => fetchApi<Post>(`/posts/${id}`),
    updatePost: (id: string, data: PostUpdate) => fetchApi<Post>(`/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    deletePost: (id: string) => fetchApi<{status: string}>(`/posts/${id}`, { method: 'DELETE' }),
    getAllTags: () => fetchApi<string[]>('/posts/tags/all'),
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetchApi<FileMeta>('/files', {
            method: 'POST',
            body: formData
            // Don't set Content-Type header manually for FormData, browser sets it with boundary
        });
    },
    getFileUrl: (id: string) => `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/files/${id}`
};
