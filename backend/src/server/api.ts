import express from 'express';

const api = express.Router();

// Anchor handler for general 404 cases.
api.use('/', (req, res) => res.status(404).end());

export default api;
