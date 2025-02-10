import { EventEmitter } from 'events';

import logger from '../../../../shared/helpers/logger.helper';

class EventService {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  emit<T>(eventName: string, payload: T): boolean {
    try {
      return this.emitter.emit(String(eventName), payload);
    } catch (error) {
      logger.error(`Error emitting event ${eventName}:`, error);
      return false;
    }
  }

  listen<T>(eventName: string, listener: (payload: T) => void): void {
    try {
      this.emitter.on(String(eventName), listener);
    } catch (error) {
      logger.error(`Error registering listener for ${eventName}:`, error);
    }
  }
}

export default new EventService();
