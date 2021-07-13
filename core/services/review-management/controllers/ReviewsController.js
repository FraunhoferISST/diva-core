const reviewsService = require("../services/ReviewsService");
const messagesProducer = require("../services/MessagesProducerService");

class ReviewsController {
  async createReview(req, res, next) {
    try {
      const newReviewId = await reviewsService.createReview(
        req.body,
        req.headers["x-actorid"]
      );
      res.status(201).send(newReviewId);
      messagesProducer.produce(
        newReviewId,
        req.headers["x-actorid"],
        req.body.belongsTo,
        "create"
      );
    } catch (err) {
      return next(err);
    }
  }

  async getReviews(req, res, next) {
    try {
      const result = await reviewsService.getReviews(req.query);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  }

  async getReview(req, res, next) {
    try {
      const result = await reviewsService.getReviewById(req.params.id);
      res.status(200).send(result);
    } catch (err) {
      return next(err);
    }
  }

  async patchReview(req, res, next) {
    try {
      const { id } = req.params;
      const actorId = req.headers["x-actorid"];
      const { belongsTo } = await reviewsService.patchReview(
        id,
        req.body,
        actorId
      );
      res.status(200).send();
      messagesProducer.produce(id, actorId, belongsTo, "update");
    } catch (err) {
      return next(err);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const actorId = req.headers["x-actorid"];
      const { belongsTo } = await reviewsService.deleteReview(id, actorId);
      res.status(200).send();
      messagesProducer.produce(id, actorId, belongsTo, "delete");
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new ReviewsController();