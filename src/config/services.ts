import convict from 'convict';

const config = convict({
  websocket: {
    port: {
      arg: 'socket-port',
      default: 3500,
      doc: 'The port to bind to socket',
      env: 'SOCKET_PORT',
      format: 'port',
    },
  },
  redis: {
    url: {
      default: '',
      doc: 'Redis database url',
      env: 'REDIS_URL',
      format: String,
      nullable: true,
    },
    host: {
      default: '127.0.0.1',
      doc: 'Redis database host name/IP',
      env: 'REDIS_HOST',
      format: '*',
    },
    port: {
      default: '6379',
      doc: 'Redis database port',
      env: 'REDIS_PORT',
      format: 'port',
    },
    password: {
      doc: 'Redis database password',
      env: 'REDIS_PASSWORD',
      format: String,
      nullable: true,
      default: '',
      sensitive: true,
    },
    username: {
      default: '',
      doc: 'Redis database username',
      env: 'REDIS_USERNAME',
      nullable: false,
      format: String,
    },
    database: {
      default: 0,
      doc: 'Redis database name',
      env: 'REDIS_DATABASE',
      nullable: false,
      format: Number,
    },
  },
  smtp: {
    host: {
      default: '',
      doc: 'SMTP host',
      env: 'SMTP_HOST',
      nullable: true,
      format: String,
    },
    port: {
      default: '',
      doc: 'SMTP port',
      env: 'SMTP_PORT',
      nullable: true,
      format: String,
    },
    service: {
      default: '',
      doc: 'SMTP service',
      env: 'SMTP_SERVICE',
      nullable: true,
      format: String,
    },
    mail: {
      user: {
        default: '',
        doc: 'SMTP mail user',
        env: 'SMTP_MAIL_USER',
        nullable: true,
        format: String,
      },
      password: {
        default: '',
        doc: 'SMTP mail password',
        env: 'SMTP_MAIL_PASSWORD',
        nullable: true,
        format: String,
      },
    },
  },
  frontendClient: {
    baseUrl: {
      default: '',
      doc: 'Frontend client base url',
      env: 'FRONTEND_CLIENT_BASE_URL',
      nullable: true,
      format: String,
    },
    passwordResetUrl: {
      default: '/auth/reset-password',
      doc: 'Frontend client password reset link',
      env: 'FRONTEND_CLIENT_PASSWORD_RESET_URL',
      nullable: true,
      format: String,
    },
    verifyAccountUrl: {
      default: '/auth/verify-account',
      doc: 'Frontend client verify account link',
      env: 'FRONTEND_CLIENT_VERIFY_ACCOUNT_URL',
      nullable: true,
      format: String,
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
