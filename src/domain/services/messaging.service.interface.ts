export interface IMessagingService {
  publish(topic: string, message: any): Promise<void>;
}

export const IMessagingService = Symbol('IMessagingService');
