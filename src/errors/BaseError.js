class BaseError extends Error {
  constructor(message = "Erro interno do servidor", status = 500) {
    super(message);
    this.message = message;
    this.status = status;
  }

  sendAnswer(res) {
    res.status(this.status).send({ message: this.message, status: this.status });
  }
}

export default BaseError;
