import convict from 'convict';

const config = convict({
  env: {
    default: 'development',
    env: 'NODE_ENV',
    doc: 'The application environment',
    format: ['production', 'development', 'test'],
  },
  name: {
    default: 'Broilerplate',
    doc: 'App name',
    env: 'APP_NAME',
    nullable: true,
    format: String,
  },
  port: {
    arg: 'port',
    default: '3000',
    doc: 'The port to bind',
    env: 'PORT',
    format: 'port',
  },
  email: {
    sender: {
      name: {
        default: 'Bootstrap',
        doc: 'Default app email sender name',
        env: 'EMAIL_SENDER_NAME',
        nullable: true,
        format: String,
      },
      email: {
        default: 'bootstrap@gmail.com',
        doc: 'Default app email sender email',
        env: 'EMAIL_SENDER_EMAIL_ADDRESS',
        nullable: true,
        format: String,
      },
    },
    provider: {
      default: 'nodemailer',
      env: 'EMAIL_PROVIDER',
      doc: 'The application active email provider',
      format: ['nodemailer'],
    },
  },
  jwt: {
    accessTokenExpiry: {
      default: 3600,
      doc: 'JWT access token expiry in seconds',
      env: 'ACCESS_TOKEN_EXPIRE',
      nullable: true,
      format: Number,
    },
    refreshTokenExpiry: {
      default: 3600,
      doc: 'JWT refresh token expiry in seconds',
      env: 'REFRESH_TOKEN_EXPIRE',
      nullable: true,
      format: Number,
    },
    refreshTokenSecret: {
      default: '',
      doc: 'JWT refresh token secret',
      env: 'REFRESH_TOKEN_SECRET',
      nullable: false,
      format: String,
    },
    accessTokenSecret: {
      default: '',
      doc: 'JWT access token secret',
      env: 'ACCESS_TOKEN_SECRET',
      nullable: false,
      format: String,
    },
  },

  resetPasswordTokenExpiry: {
    default: 5400000,
    doc: 'Expiry period for reset password expiry',
    env: 'RESET_PASSWORD_EXPIRE',
    nullable: true,
    format: Number,
  },

  verifyAccountLinkExpiry: {
    default: 5400000,
    doc: 'Expiry period for account verification link',
    env: 'ACCOUNT_VERIFICATION_EXPIRE',
    nullable: true,
    format: Number,
  },
});

config.validate({ allowed: 'strict' });

export default config;
