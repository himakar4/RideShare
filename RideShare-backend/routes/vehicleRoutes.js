const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getVehicles, addVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');

router.get('/', getVehicles);
router.post('/', auth, addVehicle);
router.put('/:id', auth, updateVehicle);
router.delete('/:id', auth, deleteVehicle);

module.exports = router;