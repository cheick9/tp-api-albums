import express from 'express';
import pkg from 'better-validator';
const { Validator } = pkg;
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import verifyToken from './middlewares/verifyToken.mjs';
import errorHandler from './middlewares/errorHandler.mjs';
import https from 'https';
import fs from 'fs';

// Core
import config from './config.mjs';
import routes from './controllers/routes.mjs';
import photoRoutes from './routes/photoRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import authRoutes from './routes/authRoutes.js';

const Server = class Server {
  constructor() {
    this.app = express();
    this.config = config[process.argv[2]] || config.development;
  }

  async dbConnect() {
    try {
      const host = this.config.mongodb;

      await mongoose.connect(host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      console.log('✅ MongoDB connecté');

      this.connect = mongoose.connection;

      // Sécurité fermeture
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('[API END PROCESS] Connexion MongoDB fermée');
        process.exit(0);
      });

    } catch (err) {
      console.error(`[ERROR] dbConnect -> ${err.message}`);
    }
  }

  middleware() {
    this.app.use(compression());
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  routes() {
    new routes.Users(this.app, this.connect);

    // this.app.use('/api/routes', albumRoutes);
    this.app.use('/api/routes/albums', verifyToken, albumRoutes);
    this.app.use('/api/routes', verifyToken, photoRoutes);
    this.app.use('/api/auth', authRoutes);
    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: 'Not Found'
      });
    });
    this.app.use(errorHandler); // à la fin de routes()
  }

  security() {
    this.app.use(helmet());
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 5, // Limite à 5 requêtes
      message: { message: 'Trop de tentatives, réessaie dans une minute.' }
    });
    this.app.use('/api/auth/login', limiter);
    this.app.disable('x-powered-by');
  }

  async run() {
    try {
      await this.dbConnect();
      this.security();
      this.middleware();
      this.routes();
      const sslOptions = {
        key: fs.readFileSync('./ssl/key.pem'),
        cert: fs.readFileSync('./ssl/cert.pem')
      };

      https.createServer(sslOptions, this.app).listen(this.config.port, () => {
        console.log(`✅ Serveur HTTPS lancé sur https://localhost:${this.config.port}`);
      });
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`);
    }
  }
};

export default Server;
