# danbo [![Build Status](https://travis-ci.com/Danbo-bot/danbo.svg?branch=master)](https://travis-ci.com/Danbo-bot/danbo)
Dead simple discord experience bot

## Build Setup
First edit the config files `config.json` with the appropriate values for your bot and folder setup.

``` bash
# install dependencies
npm install

# create a postgresql db
mkdir danboDB
cd danboDB
initdb -D ./
createdb -p 5432 name_of_db

# spin up db and initialize
postgres -D ./ -p 5432
npm run db

# serve
npm run start

# run all tests with mocha
npm run test
```
