export class ApiError extends Error {
  status: number; // 0 = sin conexión / timeout
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
