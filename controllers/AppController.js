import { redisClient } from '../utils/redis';
import { dbClient } from '../utils/db';

/* eslint-disable */
class AppController {
  static getHome (req, res) {
    res.status(200).send('wellcome to home page');
  }

  static async getStatus (req, res) {
    res.status(200).send({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  static async getStats (req, res) {
    if (dbClient.isAlive()) {
      res.status(200).send({ users: await dbClient.nbUsers(), files: await dbClient.nbFiles() });
    } else {
      res.status(500).end(' unable to connect mongodb ');
    }
  }
}

module.exports = AppController;
