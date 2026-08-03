/* eslint-disable no-unused-vars */
import mongoose from "mongoose";
import BaseError from "../errors/BaseError.js";
import InvalidRequest from "../errors/InvalidRequest.js";
import ValidationError from "../errors/ValidationError.js";
import NotFoundError from "../errors/NotFoundError.js";

function errorManipulator(error, req, res, next) {
  if (error instanceof mongoose.Error.CastError) {
    new InvalidRequest().sendAnswer(res);
  } else if (error instanceof mongoose.Error.ValidationError) {
    new ValidationError(error).sendAnswer(res);
  } else if (error instanceof NotFoundError) {
    error.sendAnswer(res);
  } else {
    new BaseError().sendAnswer(res);
  }
}

export default errorManipulator;
