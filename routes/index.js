const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
// catchErrors: will apply try-catch to our async controller functions
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));

module.exports = router;