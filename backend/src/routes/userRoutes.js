const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getAllUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
