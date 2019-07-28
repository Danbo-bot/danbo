const express = require('express');

const auth = require('../services/auth.js');

const router = express.Router();

const {
  Users, Rewards, Blacklisted, Servers,
} = require('../../dbObjects');

async function ResetLeaderboards(serverId) {
  return Users.destroy({
    where: { server_id: serverId },
  });
}

router.get('/:targetdb/:serverId/:targetcol/:oldval/:newval', async (req, res) => {
  try {
    const ver = auth.verify(req, res);
    if (!ver) {
      return;
    }
  } catch (err) {
    console.error('Error:' + err);
    return;
  }

  // handle arbitrary data
  let request = {};
  let query = {};
  request[req.params.targetcol] = req.params.newval;
  query['server_id'] = req.params.serverId;
  query[req.params.targetcol] = req.params.oldval;

  if (req.params.targetdb === 'rewards') {
    if (!['role_id', 'role_name'].includes(req.params.targetcol)) {
      res.status(500).send('Improper target db column');
      return;
    }
    Rewards.findOne(
      {request},
      { 
        where: {query},
        returning: true, // needed for affectedRows to be populated
        plain: true // makes sure that the returned instances are just plain objects
    }).then(function (record) {
      const result = record.update(request)
        .then(function (result) {
          if (Object.entries(result._changed).length === 0 && result._changed.constructor === Object) {
            res.status(500).send('No Values Changed.');
            return;
          } else {
            res.sendStatus(200);
          }
        });
    });
  }

});

module.exports = router;
