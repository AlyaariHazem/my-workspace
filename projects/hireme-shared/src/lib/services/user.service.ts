import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs';

import { GET_URL, GetUrlFn } from './../tokens/api-tokens';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  // ...whatever your API returns
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly getUrl: GetUrlFn = inject(GET_URL);

  /** caches the latest value; late subscribers get the last emission */
  readonly user$ = this.http
    .get<UserProfile>(this.getUrl('profile', 'accounts'))
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
