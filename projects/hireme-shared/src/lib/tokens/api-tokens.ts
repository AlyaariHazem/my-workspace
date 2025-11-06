import { InjectionToken } from '@angular/core';

/** Exact same signature as environment.getUrl(method, module_entity?) */
export type GetUrlFn = (method: string, module_entity?: string) => string;

export const GET_URL = new InjectionToken<GetUrlFn>('GET_URL');
