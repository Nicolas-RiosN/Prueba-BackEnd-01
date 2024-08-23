import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true,
        default: function() {
            // Generar un código único, puedes personalizar esta función.
            return 'TICKET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
    },
    purchase_datetime: {
        type: Date,
        default: Date.now // La fecha y hora en que se crea el ticket
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    }
});

export default mongoose.model('Ticket', ticketSchema);
