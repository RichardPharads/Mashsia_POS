import express from 'express';
import orderControll from '../orderControll.js'; 

const router = express.Router();
router.post('/api/receipts' , async (req, res) => {
    try {
        const { orderId, customer, items, subtotal, tax, total, paymentMethod, timestamp } = req.body;

        if(!items || items.length === 0 ) {
            return res.status(404).json({message: "No items to print receipt"})
        }

        console.log("Receipt Data: " , req.body)
        await orderControll.printReceipt(req.body);
        res.status(200).json({message: "Receipt printed successfully"})


    } catch (error) {
        console.error("Error printing receipt: ", error);
        res.status(500).json({message: "Internal Server Error"})
    }
})

router.get('/api/receipts/test', (req, res) => {    
    res.send('Test endpoint is working');
}); 


export default router