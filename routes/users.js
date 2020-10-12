const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "tmp/csv/" });

const getUser = require("../src/utils/getUsers");
const getUserCount = require("../src/utils/getUsersCount");
const postUsers = require("../src/utils/postUsers");

router.get("/", getUser);
router.get("/count", getUserCount);
router.post("/upload", upload.single("file"), postUsers);

module.exports = router;
