// Middleware para verificar el rol de administrador
export const isAdmin = (req, res, next) => {
    try {
        const user = req.user;
        console.log('User in isAdmin middleware:', user); // Verifica el contenido del usuario
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
