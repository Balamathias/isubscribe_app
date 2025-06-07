export interface Response <T> {
    data: T | null,
    error: { message?: string, details?: any } | string | Array<string | object> | null,
    message: string,
    status: number
}

export interface PaginatedResponse<T> {
    count: number
    next: string
    previous: string
    message: string
    data: T
    status: number
    error: { message?: string, details?: any } | string | Array<string | object> | null
}
