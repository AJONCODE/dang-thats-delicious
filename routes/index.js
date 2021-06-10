const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');

// Do work here
// router.get('/', (req, res) => {
//   // res.send('Hey! It works!');
//   res.render('hello', {
//     title: 'I Love Food! ',
//     name: 'AJ',
//     dog: req.query.dog || 'MAX',
//   });
// });

router.get('/', storeController.myMiddleware, storeController.homePage);

module.exports = router;
