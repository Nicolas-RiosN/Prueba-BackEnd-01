import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

export const addProductToCart = async (req, res) => {
    const { product, quantity } = req.body;
    const userId = req.user.id; // ID del usuario extraído del token

    if (!product || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    try {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        // Asegúrate de que cart.items esté definido
        if (!cart.items) {
            cart.items = [];
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === product);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product, quantity });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: error.message });
    }
};

export const removeProductFromCart = async (req, res) => {
    const userId = req.user.id; // ID del usuario desde el token
    const { productId } = req.params; // ID del producto a eliminar

    try {
        console.log('User ID:', userId);
        console.log('Product ID:', productId);

        // Encuentra el carrito del usuario
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            console.log('Cart not found');
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Encuentra el índice del producto en el carrito
        const productIndex = cart.items.findIndex(item => item.product.toString() === productId);
        console.log('Product Index:', productIndex);

        if (productIndex === -1) {
            console.log('Product not found in cart');
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Elimina el producto del carrito
        cart.items.splice(productIndex, 1);
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: error.message });
    }
};


export const getCart = async (req, res) => {
    const userId = req.user.id; // ID del usuario desde el token

    try {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            // Crear un carrito vacío si no existe
            cart = new Cart({ user: userId, items: [] });
            await cart.save();
        }
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({ message: error.message });
    }
};
