const express = require('express');
const db = require("../db/models");
const { Tweet } = db;
const { asyncHandler, userValidators, handleValidationErrors } = require('../utils')
const { requireAuth } = require("../auth");

const router = express.Router();
router.use(requireAuth);


const tweetNotFoundError = (tweetId) => {
    const error = new Error(`Tweet number ${tweetId} cannot be found.`);
    error.title = "Tweet not found.";
    error.status = 404;
    return error;
}

router.get("/", asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll({
        include: [{ model: User, as: "user", attributes: ["username"] }],
        order: [["createdAt", "DESC"]],
        attributes: ["message"],
      });
    console.log(tweets)
    res.json({
        tweets
    });
}));

router.get('/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(req.params.id);
    if (tweet) {
        res.json({
            tweet
        });
    } else {
        return next(tweetNotFoundError(tweetId));
    };
}));

router.post('/', userValidators, handleValidationErrors, asyncHandler(async (req, res) => {
    const {
        message,
    } = req.body;

    const tweet = await Tweet.create({ message, userId: req.user.id });
    res.redirect('/');
}))

router.put('/:id(\\d+)', userValidators, handleValidationErrors, asyncHandler(async(req,res) => {
    const {
        message
    } = req.body;

    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(req.params.id);
    if (tweet) {
        tweet.update({
            message
        });
        await tweet.save();
        res.redirect('/');
    } else {
        return next(tweetNotFoundError(tweetId));
    }
    next();
}));

router.delete('/:id(\\d+)', asyncHandler(async(req, res, next) => {
    const tweetId = req.params.id;
    const tweet = await Tweet.findByPk(req.params.id);
    if (tweet) {
        await tweet.destroy();
        res.status(204).end();
    } else {
        return next(tweetNotFoundError(tweetId));
    }
    next();
}))


module.exports = router;
