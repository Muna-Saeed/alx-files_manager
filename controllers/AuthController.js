import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import { redisClient } from '../utils/redis';
import { dbClient } from '../utils/db';

const getCredentials = (req) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');
    return [email, password];
  } catch (error) {
    return [null, null];
  }
};

/* eslint-disable */
class AuthController {
  static async getConnect (req, res) {
    const [email, password] = getCredentials(req);
    if (!email || !password) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const users = await dbClient.client.db().collection('users');
    const user = await users.findOne({ email });
    if (user && user.password === sha1(password)) {
      const token = uuidv4();
      const key = `auth_${token}`;
      const hoursForExpiration = 24;
      await redisClient.set(key, user._id.toString(), hoursForExpiration * 3600);
      return res.status(200).send({ token });
    }

    return res.status(401).send({ error: 'Unauthorized' });
  }

  static async getDisconnect (req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    try {
      const found = await redisClient.get(key);
      if (found) {
        await redisClient.del(key);
        res.status(204).end();
      }
    } catch (error) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    return res.status(401).send({ error: 'Unauthorized' });
  } 
}

module.exports = AuthController;
