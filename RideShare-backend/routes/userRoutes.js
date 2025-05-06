const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/:userId/stats", userController.getUserStats);
router.post(
  "/debug-set-confirmed-passenger",
  userController.debugSetConfirmedPassenger
);
router.get("/:userId", userController.getUserById);

module.exports = router;
