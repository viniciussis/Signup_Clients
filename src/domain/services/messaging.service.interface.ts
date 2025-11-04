import { Observable } from 'rxjs';

export interface IMessagingService {
  publish(topic: string, message: any): Observable<void>;
}

export const IMessagingService = Symbol('IMessagingService');
