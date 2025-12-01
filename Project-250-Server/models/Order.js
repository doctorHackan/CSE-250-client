const mongoose = require('mongoose');
const {Schema} = mongoose;

const orderSchema = new Schema({
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
    ],
    cost:{
        type: Number,
        required: true
    },
    delivered:{
        type:Boolean,
        default:false
    }
});

const Order = mongoose.model('Order',orderSchema);

module.exports = Order;
