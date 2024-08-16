const Router = require('express').Router;
const userController = require('../controllers/user.controller');

const router = Router();

router.route('/register').post(userController.registerUser);

module.exports = router;