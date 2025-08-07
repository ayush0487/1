// import express from 'express'
// import Loginrouter from './login.js';
// import Signuprouter from './sign.js';
// // import Timerouter from './timetable.js';
// import adminrouter from './admin.js';
// import teacherrouter from './teacherrouter.js';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const mainRouter = express.Router();

// // Root route redirect to login
// mainRouter.get('/', (req, res) => {
//   res.redirect('/login.html');
// });

// mainRouter.use('/login', Loginrouter);
// mainRouter.use('/register', Signuprouter);
// // mainRouter.use('/timetable', Timerouter);
// mainRouter.use('/admin', adminrouter);
// mainRouter.use('/teacher', teacherrouter);

// // Add route to serve teacher.html directly
// mainRouter.get('/teacher.html', (req, res) => {
//   if (!req.session.user || req.session.user.role !== 'user') {
//     return res.redirect('/login.html');
//   }
//   res.sendFile(path.resolve(__dirname, '../public/teacher.html'));
// });

// // Add route to serve form.html directly
// mainRouter.get('/form.html', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../public/form.html'));
// });

// // Add route to serve addLecture.html directly
// mainRouter.get('/addLecture.html', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../public/addLecture.html'));
// });

// // Add route to serve assignLecture.html directly
// mainRouter.get('/assignLecture.html', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../public/assignLecture.html'));
// });

// export { mainRouter as default };
