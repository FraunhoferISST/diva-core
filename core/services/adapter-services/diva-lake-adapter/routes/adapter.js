const express = require("express");
const divaLakeResourceService = require("../services/DivaLakeService");

const router = express.Router();

router.post("/import", async (req, res, next) => {
  try {
    const result = await divaLakeResourceService.import(
      req.files[0],
      req.headers.diva.actorId
    );
    res.status(201).send(result);
  } catch (e) {
    return next(e);
  }
});

router.get("/download/:fileName", async (req, res, next) => {
  try {
    const downloadStream = await divaLakeResourceService.download(
      req.params.fileName
    );
    downloadStream.pipe(res);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
