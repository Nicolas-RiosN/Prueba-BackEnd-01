import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

export const addProductToCart = async (req, res) => {
    // Verifica el nombre de los campos en req.body
    const { product, quantity } = req.body; // Usa 'product' en lugar de 'productId'
    const userId = req.user.id;

    if (!product || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    try {
        // Asegúrate de que 'product' sea un ObjectId válido
        const productObject = await Product.findById(product);
        if (!productObject) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (productObject.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Actualiza el stock del producto
        productObject.stock -= quantity;
        await productObject.save();

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        // Encuentra el índice del producto en el carrito
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
    const userId = req.user.id;
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        const item = cart.items[itemIndex];
        const product = await Product.findById(item.product);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Restore the stock of the product
        product.stock += item.quantity;
        await product.save();

        // Remove the product from the cart
        cart.items.splice(itemIndex, 1);
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
