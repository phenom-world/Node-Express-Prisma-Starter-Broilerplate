import EventHandler from './handler/event.handler';

export class EventHandlers {
  static handlers = {
    ['email']: new EventHandler(),
  } as const;
}
