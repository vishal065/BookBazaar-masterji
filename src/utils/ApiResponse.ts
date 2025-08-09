// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ApiResponseHandler<T = any> {
    public statusCode: number;
    public data: T | null;
    public message: string;
    public success: boolean;

    constructor(statusCode: number, data: T | null = null, message: string = "") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ApiResponse<T = any>(
    statusCode: number,
    data: T | null = null,
    message: string = "",
): ApiResponseHandler<T> {
    return new ApiResponseHandler<T>(statusCode, data, message);
}

export { ApiResponse };
