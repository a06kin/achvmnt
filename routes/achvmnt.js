var express = require('express');
var router = express.Router();

router.post('/new', function (req, res) {
    res.send(req.body.name + ' ' + req.body.circumscribing + ' ' + req.body.image);
});

module.exports = router;