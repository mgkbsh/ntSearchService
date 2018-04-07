var models = require('../models')
var sequelize = require('sequelize')

// Example return JSON:
// [
//     {
//         "content": "hi",
//         "createdAt": "2018-04-06T21:08:53.014Z",
//         "user": {
//             "fullName": "undefined undefined",
//             "username": "yoyo"
//         }
//     },
//     {
//         "content": "hi man",
//         "createdAt": "2018-04-06T20:52:33.166Z",
//         "user": {
//             "fullName": "undefined undefined",
//             "username": "yoyo"
//         }
//     }
// ]
module.exports.search = async (req, res) => {
  try {
    var term = req.body.term;

    if (!term) {
      throw new Error('Invalid search term');
    }
    var tweets;

    if (term.startsWith('#')) {

      tweets = await searchHashtag(term.substring(1));
      tweets = tweets.map(x => flattenHashtagJson(x));

    } else if (term.startsWith('@')) {

      tweets = await searchMention(term.substring(1));
      tweets = tweets.map(x => flattenMentionJson(x));

    } else {

      tweets = await searchWord(term);

    };

    res.json(JSON.parse(JSON.stringify(tweets)))

  } catch (err) {
    res.status(404).send(err);
  }

};


// JSONify a single row in the joined table from searchHashtag().
function flattenHashtagJson(x) {
  return {
    createdAt: x.tweet.createdAt,
    content: x.tweet.content,
    user: x.user
  };
}

// JSONify a single row in the joined table from searchMention().
function flattenMentionJson(x) {
  return {
    createdAt: x.tweet.createdAt,
    content: x.tweet.content,
    user: x.tweet.user
  };
}

// Return promise to search for term through Hashtag table.
// TODO: NOT WORKING since we don't insert into the
// Hashtag table just yet. Do something about this crazy four-table join.
function searchHashtag(term) {
   return models.HashtagTweet.findAll({
    include: [
      {
        model: models.Hashtag,
        as: 'hashtag',
        attributes: ['content'],
        where: { 'content': term }
      },
      {
        model: models.Tweet,
        as: 'tweet',
        attributes: ['content', 'createdAt'],
        include: [{
          model: models.User,
          as: 'user',
          attributes: ['username']
        }]
      }
    ],
    attributes: ['createdAt']
  });

};

// Return promise to search for term through Mention table.
// TODO: NOT WORKING since we don't insert into the
// Hashtag table just yet.
function searchMention(term) {
  return models.Mention.findAll({
    include: [
      {
        model: models.User,
        as: 'user',
        where: { 'username': term },
        attributes: ['createdAt']
      },
      {
        model: models.Tweet,
        as: 'tweet',
        attributes: ['content', 'createdAt'],
        include: [{
          model: models.User,
          as: 'user',
          attributes: ['username']
        }]
      }
    ],
    attributes: ['createdAt']
  })
};

// Return promise to search for term through Tweet table.
function searchWord(term) {
  return models.Tweet.findAll({
    where: {
      content: {
        $like: '%' + term + '%'
      }
    },
    include: [{
      model: models.User,
      as: 'user',
      attributes: ['username']
    }],
    attributes: ['content', 'createdAt']
  });
};
