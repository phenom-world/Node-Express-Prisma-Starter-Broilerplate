import { z } from 'zod';

import config from '../../../../../config';
import logger from '../../../../../shared/helpers/logger.helper';
import { MailService } from '../../../../../shared/utils/email.util';
import { BadRequestError } from '../../../../../shared/utils/error.util';
import { ObjectData } from '../../../../../types';
import EMAIL_TEMPLATES from '../../constants/email-templates.constant';

type Payload = {
  subject?: string;
  dynamicData: ObjectData;
  action: keyof typeof EMAIL_TEMPLATES;
  recipients: { email: string; name?: string }[];
};

const validatePayload = (content: unknown): Payload => {
  const schema = z.object({
    subject: z.string().optional(),
    dynamicData: z.record(z.any()),
    action: z.enum(Object.keys(EMAIL_TEMPLATES) as [string, ...string[]]),
    recipients: z.array(z.object({ email: z.string().email().trim(), name: z.string().nullable().optional() })).min(1),
  });
  return schema.parse(content) as Payload;
};

export default class EventHandler {
  async handle(data: Payload): Promise<void> {
    try {
      const payload = validatePayload(data);
      const templateData = EMAIL_TEMPLATES[payload.action];
      const emailConfig = config.application.get('email');

      const provider = emailConfig.provider as keyof typeof templateData.template;

      logger.info('[event.email] => initiating to recipient email(s)');

      const result = await MailService.sendMail({
        to: payload.recipients,
        data: {
          dynamicTemplateData: {
            ...payload.dynamicData,
            product: {
              name: 'Broilerplate',
              currentYear: new Date().getFullYear(),
            },
          },
          templateId: templateData.template[provider],
        },
        sender: {
          name: emailConfig.sender.name,
          email: emailConfig.sender.email,
        },
        subject: payload.subject || templateData.subject,
      });

      logger.info('[event.email] => email initiated', result);
    } catch (err) {
      throw new BadRequestError(err.message ?? 'Failed to send email');
    }
  }
}
