const Router = require('express').Router;
const userController = require('../controllers/user.controller');
const { upload } = require('../middlewares/multer.middleware');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router
  .route('/register')
  .post(
    upload.fields([
      {
        name: "avatar",
        maxCount: 1
      },
      {
        name: "coverImage",
        maxCount: 1
      }
    ]),
    userController.registerUser
  );

router.route('/login').post(userController.loginUser);

// Secured Routes
router.route('/logout').post(verifyJWT, userController.logoutUser);

module.exports = router;