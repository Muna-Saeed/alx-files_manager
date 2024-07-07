import { promisify } from 'util';
import { createClient } from 'redis';

/* eslint-disable */
class RedisClient {
  constructor () {
    this.live = false;
    this.client = createClient();
    this.client.on('error', (err) => {
      this.live = false;
      console.error('The error message is ', err.message);
    });
    this.client.on('connect', () => { this.live = true; });
    this.setex = promisify(this.client.SETEX).bind(this.client);
    this.clientGet = promisify(this.client.GET).bind(this.client);
    this.delClient = promisify(this.client.DEL).bind(this.client);
  }

  isAlive () {
    return this.live;
  }

  async get (key) {
    return await this.clientGet(key);
  }

  async del (key) {
    return await this.delClient(key);
  }

  async set (key, value, duration) {
    await this.setex(key, duration, value);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
