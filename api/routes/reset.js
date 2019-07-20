const express = require('express');
const auth = require('../services/auth.js');

const router = express.Router();

const {
  Servers, Users,
} = require('../../dbObjects');

async function ResetLeaderboards(serverId) {
  return Users.destroy({
    where: { server_id: serverId },
  });
}

router.get('/:id', async (req, res) => {
  try {
    const ver = auth.verify(req, res);
    if (!ver) {
      return;
    }
  } catch (err) {
    console.log('Error:' + err);
    return;
  }
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
      console.log('Removed ' + deleted + ' users.');
      res.sendStatus(200);
    }).catch((err) => {
      res.status(500).send('No users removed.');
      console.error(err);
    });
  }
});

module.exports = router;
