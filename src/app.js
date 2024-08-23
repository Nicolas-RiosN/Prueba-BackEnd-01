import express from 'express'
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './passport/passport.js';

import  authRoutes  from './routes/auth.routes.js';
import router from './routes/auth.routes.js';
import { authRequired } from './middleware/validateToken.js';
import { profile } from './controllers/auth.controller.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api',authRoutes);
router.get('/api/profile', authRequired, profile);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.use('/api', productRoutes);
app.use('/api', cartRoutes);


export default app;