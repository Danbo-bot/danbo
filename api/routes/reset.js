const express = require('express');
const router = express.Router();

const {
  Servers, Users,
} = require('../../dbObjects');

async function ResetLeaderboards(serverId) {
  return Users.destroy({
    where: { server_id: serverId },
  });
}

/* GET listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.get('/:id', async (req, res) => {
  console.log(req.params);
  const foundServer = await Servers.findOne({
    where:
        {
          server_id: req.params.id,
        },
  }).catch((err) => {
    console.error(err);
  });
  if (!foundServer) {
    res.sendStatus(404);
  } else {
    ResetLeaderboards(foundServer.server_id).then((deleted) => {
      console.log(deleted);
      res.sendStatus(200);
    }).catch((err) => {
      res.sendStatus(500);
      console.log(err);
    });
  }
});

module.exports = router;
