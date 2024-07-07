import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import UsersController from '../controllers/UsersController';

/* eslint-disable */
const router = (route) => {
  route.get('/', AppController.getHome);
  route.get('/status', AppController.getStatus);
  route.get('/stats', AppController.getStats);
  route.post('/users', UsersController.postNew);
  route.get('/connect', AuthController.getConnect);
  route.get('/disconnect', AuthController.getDisconnect);
  route.get('/users/me', UsersController.getMe);
  route.post('/files', FilesController.postUpload);
  route.get('/files/:id', FilesController.getShow);
   route.get('/files', FilesController.getIndex);
};

export default router;
module.exports = router;
