const mongoose = require('mongoose');
const {Schema} = mongoose;

const cartSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    foods:[
        {
            id:{
                type:String,
                required: true
            },
            name:{
                type: String,
                required: true
            },
            price:{
                type: Number,
                required: true
            }
        }
    ]
});

const Cart = mongoose.model('Cart',cartSchema);

module.exports = Cart;
