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

router.get('/:targetdb/:guildid/:targetcol/:oldval/:newval', async (req, res) => {
  try {
    const ver = auth.verify(req, res);
    if (!ver) {
      return;
    }
  } catch (err) {
    console.log('Error:' + err);
    return;
  }  if (!ver) {
    return;
  }
  console.log(JSON.stringify(req.headers));
  console.log(req.params);

});

module.exports = router;
