var models  = require('../models');
var sequelize = require('sequelize');

// Get the tweets from the user, excluding retweets.
// Example return JSON:
// [
//     {
//         "content": "hi",
//         "createdAt": "2018-04-06T03:09:38.593Z"
//     },
//     {
//         "content": "yo",
//         "createdAt": "2018-04-05T19:44:10.242Z"
//     }
// ]
module.exports.getOriginalTimeline =  async (req, res) => {
  try {
    var id = req.body.id;

    var tweets = await models.Tweet.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
      where: { userId: id, originalId: null },
      attributes: ['content', 'createdAt']
    });

    res.json(JSON.parse(JSON.stringify(tweets)));

  } catch (err) {
    res.status(404).send(err);
  }
};

// Get the tweets from the user, including retweets.
// Example return JSON:
// [
//     {
//         "id": 18,
//         "content": "hi",
//         "createdAt": "2018-04-06T03:10:04.011Z",
//         "user": {
//             "fullName": "yoyo yoyo",
//             "id": 1,
//             "username": "yoyo"
//         }
//     }
// ]
module.exports.getUserTimeline = async (req, res) => {
  try {
    var id = req.body.id;

    var tweets = await models.Tweet.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
      where: { userId: id },
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'username']
      }],
      attributes: ['id','content', 'createdAt']
    });

    res.json(JSON.parse(JSON.stringify(tweets)));

  } catch (err) {
    res.status(404).send(err);
  }
}

// Get the most recent 50 tweets from the people that the user follows.
// Example return JSON:
// [
//     {
//         "content": "",
//         "createdAt": "2018-04-06T03:10:04.011Z",
//         "user": {
//             "fullName": "yoyo yoyo",
//             "id": 1,
//             "username": "yoyo",
//             "fname": "yoyo",
//             "lname": "yoyo"
//         }
//     }
// ]
// TODO: Check Redis for home timeline of the user. If cache miss, use this query.
module.exports.getFolloweeTimeline = async (req, res) => {
  try {
    var id = req.body.id;

    var tweets = await models.Tweet.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'username', 'fname', 'lname'],
        where: {
          id: {
            $in: sequelize.literal(
              `(SELECT  "followeeId" FROM "Relationships" WHERE "followerId"=${id})`)
          }
        }
      }],
      required: true,
      attributes: ['content', 'createdAt']
    });

    res.json(JSON.parse(JSON.stringify(tweets)));

  } catch (err) {
    res.status(404).send(err);
  }
};

// Get the most recent 50 tweets from all users.
// Example return JSON:
// [
//     {
//         "content": "hello",
//         "createdAt": "2018-04-06T03:10:04.011Z",
//         "user": {
//             "fullName": "yoyo yoyo",
//             "id": 1,
//             "username": "yoyo",
//             "fname": "yoyo",
//             "lname": "yoyo"
//         }
//     }
//   ]
// TODO: Retrieve global timeline from Redis.
module.exports.getGlobalTimeline = async (req, res) => {
  try {
    var tweets = await models.Tweet.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'username', 'fname', 'lname']
      }],
      attributes: ['content', 'createdAt']
    });

    res.json(JSON.parse(JSON.stringify(tweets)));

  } catch (err) {
    res.status(404).send(err);
  }
};