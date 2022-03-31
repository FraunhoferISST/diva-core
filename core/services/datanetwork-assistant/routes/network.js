const express = require("express");
const DatanetworkController = require("../controllers/DatanetworkController");

const router = express.Router();

router.get("/edges", DatanetworkController.getEdges);
router.get("/edges/:id", DatanetworkController.getEdgeById);
router.post("/edges", DatanetworkController.postEdge);
router.patch("/edges/:id", DatanetworkController.patchEdge);
router.post("/edges/:id", DatanetworkController.patchEdge);
router.delete("/edges/:id", DatanetworkController.deleteEdgeById);

router.get("/nodes/:id", DatanetworkController.getNodeById);
router.put("/nodes", DatanetworkController.putNode);
router.delete("/nodes/:id", DatanetworkController.deleteNodeById);

module.exports = router;