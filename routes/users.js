const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "tmp/csv/" });

const getUser = require("../src/utils/getUsers");
const getUserCount = require("../src/utils/getUsersCount");
const postUsers = require("../src/utils/postUsers");
const crudUser = require("../src/utils/crudUser");

router.get("/", getUser);
router.get("/count", getUserCount);
router.post("/upload", upload.single("file"), postUsers);

// router.get("/fakedata", crudUser.fakedata);

router.post("/:id", crudUser.postUser);
router.patch("/:id", crudUser.patchUser);
router.get("/:id", crudUser.getUser);
router.delete("/:id", crudUser.deleteUser);

module.exports = router;
