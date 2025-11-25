export default class ApiError extends Error {
    public statusCode: number;
    public data: any | null;
    public success: boolean;
    public errors: any[];
    constructor(
        statusCode: number,
        message: string = "An error occurred",
        errors: any[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
} 

