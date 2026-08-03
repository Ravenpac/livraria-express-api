import NotFoundError from "../errors/NotFoundError.js";

function notFoundManipulator(req, res, next) {
  const notFoundError = new NotFoundError();

  next(notFoundError);
}

export default notFoundManipulator;
