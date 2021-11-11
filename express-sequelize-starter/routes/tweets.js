const express = require('express');
const db = require("../db/models");
const { Tweet } = db;
const { check, validationResult } = require('express-validator');

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);
const router = express.Router();

const userValidators = [
    check('message')
        .exists({checkFalsy: true})
        .isLength({ max: 280})
]


const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        return next(err);
    }
    next();
}

const tweetNotFoundError = (tweetId) => {
    const error = new Error(`Tweet number ${tweetId} cannot be found.`);
    error.title = "Tweet not found.";
    error.status = 404;
    return error;
}

router.get("/", asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll();
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

    const tweet = Tweet.build({
        message
    });

    await tweet.save();
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
