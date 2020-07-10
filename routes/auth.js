const express = require("express");
const {register} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register); // path followed by the method

module.exports = router;
