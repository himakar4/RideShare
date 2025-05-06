const Vehicle = require('../models/Vehicle');

exports.getVehicles = async (req, res) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
};

exports.addVehicle = async (req, res) => {
  const vehicle = new Vehicle(req.body);
  await vehicle.save();
  res.status(201).json(vehicle);
};

exports.updateVehicle = async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(vehicle);
};

exports.deleteVehicle = async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Vehicle deleted' });
};