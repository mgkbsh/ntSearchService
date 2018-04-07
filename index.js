const express = require('express');
const app = express();
const port = process.env.PORT || 6000;

/* ===========BODY_PARSER=========== */
const bodyParser = require('body-parser');
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());
// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

/* =============ROUTES============= */
const search = require('./controllers/search')
const parse = require('./controllers/parse')
const router = express.Router();

router.get('/search', search.search);
router.post('/parse', parse.parse);

app.use('/', router);

app.listen(port);
