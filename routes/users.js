const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "tmp/csv/" });

const { getUserCount, getUsers } = require("../handlers/getUsers");
const { postUser } = require("../handlers/postUser");

router.get("/", getUsers);
router.get("/count", getUserCount);
router.post("/upload", upload.single("file"), postUser);

module.exports = router;
