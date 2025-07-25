import express from 'express'
import Loginrouter from './login.js';
import Signuprouter from './sign.js';
// import Timerouter from './timetable.js';
import adminrouter from './admin.js';

const mainRouter = express.Router();
mainRouter.use('/login', Loginrouter);
mainRouter.use('/register', Signuprouter);
// mainRouter.use('/timetable', Timerouter);
mainRouter.use('/admin', adminrouter);

export default mainRouter;