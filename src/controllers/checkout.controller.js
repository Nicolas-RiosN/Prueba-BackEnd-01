import Cart from '../models/cart.model.js';
import Ticket from '../models/ticket.model.js';
import User from '../models/user.model.js'; // Asegúrate de importar el modelo de Usuario

export const checkout = async (req, res) => {
    const userId = req.user.id; // ID del usuario desde el token

    try {
        // Encuentra el carrito del usuario
        const cart = await Cart.findOne({ user: userId }).populate('items.product'); // Asegúrate de hacer populate para obtener los precios de los productos

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Encuentra el usuario para obtener el correo electrónico
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calcula el monto total del carrito
        let amount = 0;
        cart.items.forEach(item => {
            if (item.product && item.product.price) {
                amount += item.quantity * item.product.price;
            } else {
                console.error('Product price is missing or invalid:', item);
            }
        });

        // Verifica que amount sea un número válido
        if (isNaN(amount) || amount < 0) {
            return res.status(500).json({ message: 'Invalid total amount' });
        }

        // Crea el ticket
        const ticket = new Ticket({
            code: generateUniqueCode(), // Implementa esta función para generar un código único
            purchase_datetime: new Date(),
            amount,
            purchaser: user.email,
        });

        // Guarda el ticket
        await ticket.save();

        // Opcional: Vacía el carrito después de la compra
        await Cart.deleteOne({ user: userId });

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: error.message });
    }
};

// Función para generar un código único para el ticket
const generateUniqueCode = () => {
    // Implementa la lógica para generar un código único, por ejemplo, usando una biblioteca de UUID
    return 'TICKET-' + Math.random().toString(36).substring(2, 15).toUpperCase();
};
