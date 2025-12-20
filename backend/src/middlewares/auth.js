import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, token faltante' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            lup: decoded.lup,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};
