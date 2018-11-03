var express = require('express');
var router = express.Router();

const { Servers, Users, Rewards, Blacklisted } = require('../dbObjects');

/* GET listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', async function(req, res, next) {
    let foundServer = await Servers.find({
        where:
        {
            server_id: req.params.id,
        }
    }).catch((err) => {
        console.error(err)}
    );
    if (!foundServer) { 
        res.status(404).send('There isn\'t a server with that id in our database').end();
        return; 
    }
    allUsers = await Users.findAll({
        where: { server_id: foundServer.server_id},
        order: [['experience', 'DESC']],
    });
    allRewards = await Rewards.findAll({
        where: {server_id: foundServer.server_id},
        order: [['level_gained', 'DESC']],
    });
    allBlacklist = await Blacklisted.findAll({
        where: {server_id: foundServer.server_id},
    });
    if (!allUsers) { res.status(500).send('Couldn\'t find users or rewards')};
    res.status(200).send(JSON.stringify({
        'id': foundServer.server_id,
        'name': foundServer.server_name,
        'rewards': allRewards,
        'blacklisted': allBlacklist,
        'users': allUsers
    }));
});

router.get('/:id/user/:userId', async function(req, res, next) {
    let foundServer = await Servers.find({
        where: {
            server_id: req.params.id,
        }
    }).catch((err) => {
        console.error(err)}
    );
    if (!foundServer) { 
        res.status(404).send('There isn\'t a server with that id in our database').end();
        return; 
    }
    let foundUser = await Users.find({
        where: { server_id: foundServer.server_id, id: req.params.userId }
    });
    if (!foundUser) { return res.status(404).send('Couldn\'t find user on server')}
    let responseObj = {};
    responseObj['server'] = foundServer;
    responseObj['server']['dataValues']['rewards'] = await Rewards.findAll({
        where: {server_id: foundServer.server_id},
        order: [['level_gained', 'DESC']],
    });
    responseObj['server']['dataValues']['blacklist'] = await Blacklisted.findAll({
        where: {server_id: foundServer.server_id},
    });
    responseObj['user'] = foundUser;
    return res.status(200).send(responseObj).end();
});
module.exports = router;
