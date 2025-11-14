import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    orderId : { type: String, required: true, unique: true},
    customer: {
        name: {type: String},
        contact: {type: String}
    },
    items: [
        {
            name: {type: String , required: true},
            quantity: {type: Number, required: true},
            price: {type: Number, required: true},
            addOns: [{type: String}],
            totalPrice: {type: Number}
        }
    ],

    subtotal: {type: Number , required: true},
    tax: {type: Number , required : true},
    total: {type: Number, required: true},
    
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Gcash', 'Card'],
        required: true
    },
}, {timestamps:true});

export default mongoose.model('Order', orderSchema);