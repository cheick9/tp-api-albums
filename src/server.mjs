// Dependencies
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';

// Core
import config from './config.mjs';
import routes from './controllers/routes.mjs';
import photoRoutes from './routes/photoRoutes.js';
import albumRoutes from './routes/albumRoutes.js';

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
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  routes() {
    new routes.Users(this.app, this.connect);

    this.app.use('/api/routes', albumRoutes);
    this.app.use('/api/routes', photoRoutes);

    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: 'Not Found'
      });
    });
  }

  security() {
    this.app.use(helmet());
    this.app.disable('x-powered-by');
  }

  async run() {
    try {
      await this.dbConnect();
      this.security();
      this.middleware();
      this.routes();
      this.app.listen(this.config.port);
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`);
    }
  }
};

export default Server;
