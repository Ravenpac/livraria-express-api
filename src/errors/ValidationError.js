import InvalidRequest from "./InvalidRequest.js";

class ValidationError extends InvalidRequest {
  constructor(error) {
    const errorMessages = Object.values(error.errors)
      .map((err) => err.message)
      .join(", ");

    super(`Os seguintes erros foram encontrados: ${errorMessages}`);
  }
}

export default ValidationError;
