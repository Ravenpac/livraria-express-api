import { jest } from "@jest/globals";
import mongoose from "mongoose";
import errorManipulator from "./errorManipulator.js";
import NotFoundError from "../errors/NotFoundError.js";

function mockReq() {
  return {};
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe("errorManipulator", () => {
  it("retorna 400 para erros de CastError", () => {
    const error = new mongoose.Error.CastError("ObjectId", "abc", "id");
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    errorManipulator(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Um ou mais dados fornecidos estão inválidos",
      status: 400,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 400 para erros de ValidationError com as mensagens dos campos", () => {
    const error = new mongoose.Error.ValidationError(null);
    error.addError(
      "autor",
      new mongoose.Error.ValidatorError({
        message: "O autor do livro é obrigatório",
        path: "autor",
      }),
    );
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    errorManipulator(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Os seguintes erros foram encontrados: O autor do livro é obrigatório",
      status: 400,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 500 para erros genéricos", () => {
    const error = new Error("Erro inesperado");
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    errorManipulator(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Erro interno do servidor",
      status: 500,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 404 para erros de NotFoundError", () => {
    const error = new NotFoundError("Livro não encontrado");
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    errorManipulator(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Livro não encontrado",
      status: 404,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
