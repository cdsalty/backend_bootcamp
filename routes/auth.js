const express = require("express");
const {register, login} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register); // path followed by the method to call
router.post("/login", login);

module.exports = router;
