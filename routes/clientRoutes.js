const express = require('express');
const router = express.Router();
const clientController = require('../controller/clientAuth');

router.post('/clients', clientController.createClient);

router.get('/clients', clientController.getAllClients);

router.get('/clients/:id', clientController.getClientById);

router.put('/clients/:id', clientController.updateClientById);

router.delete('/clients/:id', clientController.deleteClientById);

router.get('/totalClients', clientController.getTotalClients);

module.exports = router;
