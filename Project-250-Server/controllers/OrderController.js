const Order = require('../models/Order');
const Cart = require('../models/Cart');

const placeOrder = async (req,res)=>{
    try{
        const userId = req.user.id;
        const cart = await Cart.findOneAndDelete({user:userId});
        const foods = cart.foods;
        let totalCost = foodsArray.reduce((total, food) => total + food.price, 0);
        const order = await Order.create({
            user:userId,
            foods:foods,
            cost:totalCost
        });
        res.status(201).json({orderId:order._id,Message: "Order Placed Successfully"});
    }
    catch(err){
        res.status(500).json({Message : err.message});
    }
}

const removeOrder = async (req,res)=>{
    try{
        const { orderId } = req.body;
        const order = await Order.findByIdAndDelete(orderId);
        if(order){
            res.status(200).json({Message : "Deleted Successfully"});
        }
        else{
            res.status(404).json({Message : "Order Not Found"});
        }
    }
    catch(err){
        res.status(500).json({Message: err.message});
    }
}

const myOrders = async (req,res)=>{
    try{
        const orders = await Order.find({});
        res.status(200).json(orders);
    }
    catch(err){
        res.status(500).json({Message: err.message});
    }
}

module.exports = { placeOrder, removeOrder, myOrders };