import 'dotenv/config';

import ejs from 'ejs';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';

import { HTML_TEMPLATES } from '../../app/modules/utility/constants/html-templates.constant';
import config from '../../config';
import { ObjectData } from '../../types';

enum EmailProvider {
  Nodemailer = 'nodemailer',
}

interface EmailData {
  templateId?: string;
  dynamicTemplateData?: object;
  html?: string;
  attachments?: Array<ObjectData>;
}

interface EmailOptions {
  sender?: { name?: string; email?: string };
  to: { name?: string; email: string }[];
  subject: string;
  data?: EmailData;
  cc?: string[];
}

export class MailService {
  static async sendWithNodemailer(data: EmailOptions): Promise<{ messageId: string }> {
    const transporter: Transporter = nodemailer.createTransport({
      host: config.services.get('smtp.host'),
      port: parseInt(config.services.get('smtp.port')!),
      service: config.services.get('smtp.service'),
      auth: {
        user: config.services.get('smtp.mail.user'),
        pass: config.services.get('smtp.mail.password'),
      },
    });

    const { sender, to, subject, data: emailData } = data;
    const templatePath = path.join(__dirname, '../../templates', HTML_TEMPLATES[emailData?.templateId as keyof typeof HTML_TEMPLATES]);

    // Render the email template with EJS
    const html: string = await ejs.renderFile(templatePath, emailData?.dynamicTemplateData);

    const mailOptions = {
      from: sender?.email,
      to: to.map((to) => to.email),
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return { messageId: result.messageId };
  }

  static async sendMail({
    provider = EmailProvider.Nodemailer,
    ...data
  }: {
    sender: { name: string; email: string };
    to: { name?: string; email: string }[];
    subject: string;
    data?: EmailData;
    cc?: string[];
    provider?: EmailProvider;
  }): Promise<{ messageId?: string }> {
    let result;
    if (provider === EmailProvider.Nodemailer) {
      result = await this.sendWithNodemailer(data);
    } else {
      throw new Error('Invalid email provider');
    }

    return result;
  }
}
