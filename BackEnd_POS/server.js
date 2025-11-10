import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import ordersRouter from './routes/orders.js';
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(ordersRouter);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('POS Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})