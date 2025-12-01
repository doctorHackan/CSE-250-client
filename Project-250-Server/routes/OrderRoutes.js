const express = require('express');
const { placeOrder, myOrders, removeOrder } = require('../controllers/OrderController');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const router = express.Router();

router.route('/place').post(AuthMiddleware, placeOrder);
router.route('/myorders').ger(myOrders);
router.route('/removeOrder').delete(removeOrder);

module.exports = router;