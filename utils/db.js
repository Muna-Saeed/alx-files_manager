import mongodb from 'mongodb';

/* eslint-disable */
class DBClient {
  constructor () {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || '27017';
    this.live = false;

    const db = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${this.host}:${this.port}/${db}`;

    this.client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });

    this.client.connect((err) => {
      if (err) {
        console.error('Error connecting to MongoDB:', err);
      } else {
        this.live = true;
        this.userCollection = this.client.db().collection('users');
        this.fileCollection = this.client.db().collection('files');
      }
    });
  }

  isAlive () {
    return this.live;
  }

  async nbUsers () {
    return await this.userCollection.countDocuments();
  }

  async nbFiles () {
    return await this.fileCollection.countDocuments();
  }

  async getUser (email) {
    if (this.isAlive()) {
    const result = await this.userCollection.findOne({ email });
    return result !== null;
    }
    return false;
  }

  async addUser (user) {
    if (this.isAlive()) {
    const nuser = await this.userCollection.insertOne(user);
    return nuser.insertedId;
    }
    return false;
  }
}

export const dbClient = new DBClient();
export default dbClient;
