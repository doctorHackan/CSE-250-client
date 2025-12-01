const express = require('express');
const { addToCart, removeFromCart } = require('../controllers/CartController');
const router = express.Router();
const AuthMiddleware = require('../middlewares/AuthMiddleware');

router.route('/').post(AuthMiddleware, addToCart).delete(AuthMiddleware, removeFromCart);

module.exports = router;