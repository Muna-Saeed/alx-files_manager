import fs from 'fs';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../utils/db';
import { redisClient } from '../utils/redis';

const path = require('path');
/* eslint-disable */
async function writeFileExample (localPath, buffer) {
  try {
    await fs.promises.writeFile(localPath, buffer);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Error: Directory does not exist. Create it first.');
      throw new Error('Directory not found');
    } else {
      throw error;
    }
  }
}

/* eslint-disable */
const getUser = async (key) => {
  try {
    const userId = await redisClient.get(key);
    if (!userId) {
      return null;
    }

    const db = dbClient.client.db();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    return user;
  } catch (error) {
    return null;
  }
};

/* eslint-disable */
class FileController {

  static async postUpload (req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;

    try {
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const users = dbClient.client.db().collection('users');
      const user = await users.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const { name, type, parentId, isPublic, data } = req.body;

      if (!name) {
        return res.status(400).send({ error: 'Missing name' });
      }
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).send({ error: 'Missing type or invalid type' });
      }
      if (type !== 'folder' && !data) {
        return res.status(400).send({ error: 'Missing data' });
      }

      if (parentId) {
        const parentFile = await dbClient.client.db().collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).send({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).send({ error: 'Parent is not a folder' });
        }
      }

      const storageFolderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      fs.mkdir(storageFolderPath, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating directory:', err);
  } else {
    console.log('Directory created successfully');
  }
});

      if (type === 'folder') {
        const newFolder = {
            userId:user._id,
          name,
          type,
          isPublic: isPublic || false,
          parentId: parentId || '0'
        };

        const result = await dbClient.client.db().collection('files').insertOne(newFolder);
        const createdFolder = result.ops[0];
        return res.status(201).json({
          id: createdFolder._id.toString(),
          userId: createdFolder.userId.toString(),
          name: createdFolder.name,
          type: createdFolder.type,
          isPublic: createdFolder.isPublic,
          parentId: createdFolder.parentId === '0' ? 0 : createdFolder.parentId
        });
      } else {
        const filename = uuidv4();
        const buffer = Buffer.from(data, 'base64');
          const localPath = path.join(storageFolderPath, filename);
          await writeFileExample(localPath, buffer);

        const newFile = {
            userId:user._id,
          name,
          type,
          isPublic: isPublic || false,
          parentId: parentId || '0',
          localPath
        };

        const result = await dbClient.client.db().collection('files').insertOne(newFile);
        const createdFile = result.ops[0];
        return res.status(201).json({
          id: createdFile._id.toString(),
          userId: createdFile.userId.toString(),
          name: createdFile.name,
          type: createdFile.type,
          isPublic: createdFile.isPublic,
          parentId: createdFile.parentId === '0' ? 0 : createdFile.parentId
        });
      }
    } catch (error) {
	console.log(error);
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  static async getShow (req, res) {
    const token = req.header('X-Token');
    const fileId = req.params.id;  
    const key = `auth_${token}`;
    const user = await getUser(key);  
    if (user) {
      const collection = dbClient.client.db().collection('files');
      const file = await collection.findOne({ _id: new ObjectId(user._id)
					      , _id: new ObjectId(fileId) });
	if (!file){
	    return res.status(404).json({error:'Not found'})
	}
      return res.status(200).send(file);
    }
      return res.status(401).send({ error: 'Unauthorized' });
  }


  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const user = await getUser(key);
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    let page = parseInt(req.query.page) || 0;
    if (page < 0) {
      page = 0;
    }

    const parentId = req.query.parentId || '0';
    const pageSize = 20;
    const skip = page * pageSize;
    try {
      const collection = dbClient.client.db().collection('files');

      const pipeline = [
        { $match: { parentId: parentId, userId: user._id } },
        { $skip: skip },
        { $limit: pageSize }
        ];

      const result = await collection.aggregate(pipeline).toArray();
    if (result)
	{
          return res.status(200).json(result);
	}

	return res.status(404).json({error:'Not found'})
    } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
  }
}

module.exports = FileController;
