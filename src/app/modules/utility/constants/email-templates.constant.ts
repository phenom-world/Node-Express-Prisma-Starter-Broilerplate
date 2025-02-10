type EmailTemplate = {
  subject: string;
  template: {
    nodemailer: string;
  };
  expectedDynamicVariables: string[];
};

type EmailTemplates = {
  RESET_PASSWORD: EmailTemplate;
  VERIFY_ACCOUNT: EmailTemplate;
};

const EMAIL_TEMPLATES: EmailTemplates = {
  VERIFY_ACCOUNT: {
    subject: 'Verify your account',
    template: {
      nodemailer: '1',
    },
    expectedDynamicVariables: ['firstName', 'email', 'verificationUrl'],
  },
  RESET_PASSWORD: {
    subject: 'Reset your password',
    template: {
      nodemailer: '2',
    },
    expectedDynamicVariables: ['firstName', 'email', 'resetPasswordUrl'],
  },
};

export default EMAIL_TEMPLATES;
