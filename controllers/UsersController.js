import sha1 from 'sha1';
import { dbClient } from '../utils/db';
import { redisClient } from '../utils/redis';

const { ObjectId } = require('mongodb');

/* eslint-disable */
class UsersController {
  static async postNew (req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    if (await dbClient.getUser(email)) {
      return res.status(400).send({ error: 'Already exist' });
    }

    const SHA1P = sha1(password);
    const user = {
      email,
      password: SHA1P
    };
    let userId;

    try {
      const inserted = await dbClient.client.db().collection('users').insertOne(user);
      userId = inserted.insertedId;
	
    } catch (error) {
      return res.status(500).send({ error: 'Internal server error' });
    }

      return res.status(201).send({ id: userId.toString(), email });
  }

  static async getMe (req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    try {
      const userId = await redisClient.get(key);

      const users = await dbClient.client.db().collection('users');
      const user = await users.findOne({ _id: new ObjectId(userId) });
      if (user) {
        return res.status(200).send({ id: userId, email: user.email });
      }
      return res.status(401).send({ error: 'Unauthorized' });
    } catch (error) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = UsersController;
