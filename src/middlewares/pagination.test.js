import { jest } from "@jest/globals";
import InvalidRequest from "../errors/InvalidRequest.js";
import pagination from "./pagination.js";

function mockReq(results, query = {}) {
  return { query, results };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockResults(value) {
  const chain = {
    sort: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    skip: jest.fn(() => chain),
  };
  chain.exec = jest.fn().mockResolvedValue(value);
  return chain;
}

describe("pagination", () => {
  it("aplica paginação com valores padrão", async () => {
    const books = [{ titulo: "A" }];
    const results = mockResults(books);
    const req = mockReq(results);
    const res = mockRes();
    const next = jest.fn();

    await pagination(req, res, next);

    expect(results.sort).toHaveBeenCalledWith({ _id: -1 });
    expect(results.limit).toHaveBeenCalledWith(10);
    expect(results.skip).toHaveBeenCalledWith(0);
    expect(results.exec).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(books);
    expect(next).not.toHaveBeenCalled();
  });

  it("aplica paginação com limit, page e order informados", async () => {
    const books = [{ titulo: "A" }];
    const results = mockResults(books);
    const req = mockReq(results, { limit: "5", page: "3", order: "titulo:1" });
    const res = mockRes();
    const next = jest.fn();

    await pagination(req, res, next);

    expect(results.sort).toHaveBeenCalledWith({ titulo: 1 });
    expect(results.limit).toHaveBeenCalledWith(5);
    expect(results.skip).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(books);
  });

  it("encaminha InvalidRequest ao middleware quando limit não é positivo", async () => {
    const results = mockResults([]);
    const req = mockReq(results, { limit: "0" });
    const res = mockRes();
    const next = jest.fn();

    await pagination(req, res, next);

    expect(results.exec).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Limit e page devem ser números positivos",
        status: 400,
      }),
    );
    expect(next.mock.calls[0][0]).toBeInstanceOf(InvalidRequest);
  });

  it("encaminha InvalidRequest ao middleware quando page não é número", async () => {
    const results = mockResults([]);
    const req = mockReq(results, { page: "abc" });
    const res = mockRes();
    const next = jest.fn();

    await pagination(req, res, next);

    expect(results.exec).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(InvalidRequest);
  });

  it("encaminha o erro ao middleware de tratamento de erros", async () => {
    const error = new Error("DB error");
    const results = mockResults([]);
    results.exec = jest.fn().mockRejectedValue(error);
    const req = mockReq(results);
    const res = mockRes();
    const next = jest.fn();

    await pagination(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});
