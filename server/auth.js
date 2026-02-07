function authenticateAPI(req, res, next) {
    const apiKey = req.headers['api-admin-key'];
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }
    
    if (apiKey !== process.env.API_ADMIN_KEY) {
        return res.status(403).json({ error: 'Incorrect API key'});
    }
    
    next();
}

module.exports = authenticateAPI;