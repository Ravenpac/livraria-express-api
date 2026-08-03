import InvalidRequest from "../errors/InvalidRequest.js";

async function pagination(req, res, next) {
  try {
    let { limit = 10, page = 1, order = "_id:-1" } = req.query;

    limit = parseInt(limit);
    page = parseInt(page);

    const [orderField, orderDirection] = order.split(":");
    order = parseInt(orderDirection);

    const results = req.results;

    if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
      return next(new InvalidRequest("Limit e page devem ser números positivos"));
    } else {
      const paginatedResults = await results
        .sort({ [orderField]: order })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      res.status(200).json(paginatedResults);
    }
  } catch (error) {
    next(error);
  }
}

export default pagination;
