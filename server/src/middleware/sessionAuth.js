export function requireSession(req, res, next) {
    if (req.session.userId) {
      return next();
    }
    res.status(401).json({ message: 'Login required.' });
  }
  