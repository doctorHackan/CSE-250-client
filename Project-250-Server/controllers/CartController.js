const Cart = require('../models/Cart');

const addToCart = async (req,res) => {
    try{
        const {id,food,price} = req.body;
        const userId = req.user.id;
        const cart = await Cart.findOne({user:userId});
        if(!cart){
            await Cart.create({
                user:userId,
                foods:[
                    {
                        id:id,
                        name:food,
                        price: price
                    }
                ]
            })
        }
        else{
            cart.foods.push({name:food,price:price});
            await cart.save();
        }
        res.status(200).json({Message: "Added to Cart"});
    }
    catch(err){
        res.status(500).json({Message: err.message});
    }
    
}

const removeFromCart = async (req,res)=>{
    try{
        const {id} = req.body;
        const userId = req.user.id;
        const cart = await Cart.findOne({user:userId});
        if(!cart){
            res.status(404).json({Message: "Cart Not Found"});
        }
        cart.foods.pull({id});
        await cart.save();
        res.status(200).json({Message : "Removed From Cart"});
    }
    catch(err){
        res.status(500).json({Message: err.message});
    }
}

module.exports = {addToCart, removeFromCart};