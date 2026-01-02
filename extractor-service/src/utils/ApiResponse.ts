class ApiResponse<T = unknown> {

    statusCode: number;
    data: T;
    message: string;
    success: boolean;

    constructor(statusCode: number, data: T, message: string) {
        this.statusCode = statusCode,
            this.data = data;
        this.message = message;
        this.success = statusCode >= 200 && statusCode < 400;
    }
}

export default ApiResponse