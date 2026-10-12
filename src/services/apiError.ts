export class ApiError extends Error {
  status: number; // 0 = sin conexión / tiempo agotado
  fieldErrors?: Record<string, string>; // errores por campo (validación del backend)

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
