const route = require("express").Router();
const {
  getUserById,
  getAllUsers,
  updateUserById,
  deleteUserById,
  getUserStats,
} = require("../controllers/user");
const {
  verifyJWTAuthToken,
  restrictTo,
  restrictToUser,
} = require("../middleware/auth");

route.get("/", verifyJWTAuthToken, restrictTo("Creator"), getAllUsers);
route.get("/:id", verifyJWTAuthToken, getUserById);
route.get("/:userId/stats", verifyJWTAuthToken, getUserStats);
route.patch("/", verifyJWTAuthToken, updateUserById);
route.delete("/:id", verifyJWTAuthToken, restrictToUser, deleteUserById);

module.exports = route;
