const express = require('express');
const router = express.Router();
const Client = require('../model/clientModel');
const { uploadClient } = require('../utils/multerConfig');

// Total Clients
router.get('/totalClients', async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    res.json({ totalClients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Create a new client
// router.post('/clients', uploadClient.single("clientImage"), async (req, res) => {
//   try {
//     const path = req.file?.path;
//     // let newPath = path?.replace('uploads\\', "");
//     if (path === undefined || path === null) {
//       path = "./uploads/default.jpeg";
//     }
//     req.body.clientImage = path;
//     const client = new Client(req.body);
//     await client.save();
//     res.status(201).send(client);
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       res.status(400).send({ errors });
//     } else {
//       res.status(500).send(error);
//     }
//   }
// });

router.post('/clients', uploadClient.single("clientImage"), async (req, res) => {
  try {
    const path = req.file?.path;
    let newPath = path?.replace('uploads\\', "");
    if (newPath === undefined || newPath === null) {
      newPath = "default.jpeg";
    }
    req.body.clientImage = newPath;
    const client = new Client(req.body);
    await client.save();
    res.status(201).send(client);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).send({ errors });
    } else {
      res.status(500).send(error);
    }
  }
});


// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find({});
    res.status(200).send(clients);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a client by ID
router.get('/clients/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const client = await Client.findById(_id);

    if (!client) {
      return res.status(404).send({ error: 'Client not found' });
    }

    res.status(200).send(client);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Search clients by name
router.get("/search", async (req, res) => {
  const query = req.query.name;

  if (!query) {
    return res.status(400).json({ message: "Name query parameter is required for search" });
  }

  try {
    const regex = new RegExp(query, 'i');
    const clients = await Client.find({ clientName: { $regex: regex } });

    if (clients.length === 0) {
      return res.status(404).json({ message: 'No clients found with the provided name' });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a client by ID
router.put('/clients/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['clientName', 'businessName', 'clientImage', 'clientEmail', 'clientPassword', 'clientPhone', 'clientAddress', 'clientGst'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).send({ error: 'Client not found' });
    }

    updates.forEach((update) => client[update] = req.body[update]);

    await client.save();
    res.status(200).send(client);
  } catch (error) {
    console.error('Error during client update:', error); // Logging error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).send({ errors });
    } else {
      res.status(500).send({ error: 'Internal server error' });
    }
  }
});

// Delete a client by ID
router.delete('/clients/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).send({ error: 'Client not found' });
    }

    res.status(200).send({ message: 'Client deleted successfully', client });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
