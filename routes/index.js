const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
// catchErrors: will apply try-catch to our async controller functions
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores));

router.get('/stores', catchErrors(storeController.getStores));

router.get('/add', authController.isLoggedIn, storeController.addStore);

router.post(
  '/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore),
);

router.post(
  '/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore),
);

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));

router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/register', userController.registerForm);

router.post(
  '/register',
  userController.validateRegister,
  userController.register,
  authController.login,
);

router.get('/login', userController.loginForm);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.get(
  '/account',
  authController.isLoggedIn,
  userController.account
);

router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgotPassword));

router.get('/account/reset/:token', catchErrors(authController.resetPassword));

router.post(
  '/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.updatePassword)
);

/**
 * API
 */

router.get('/api/search', catchErrors(storeController.searchStores));

module.exports = router;