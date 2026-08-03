import BaseError from "./BaseError.js";

class InvalidRequest extends BaseError {
  constructor(message = "Um ou mais dados fornecidos estão inválidos") {
    super(message, 400);
  }
}

export default InvalidRequest;
