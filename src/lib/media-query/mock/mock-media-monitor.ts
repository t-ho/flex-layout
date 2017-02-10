/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '@angular/core';

import {MediaMonitor} from '../media-monitor';
import {BreakPointRegistry} from '../breakpoints/break-point-registry';
import {MatchMedia} from '../match-media';

@Injectable()
export class MockMediaMonitor extends MediaMonitor {

  /**
   * Delegate to superclass
   */
  constructor(breakpoints: BreakPointRegistry,
              matchMedia: MatchMedia) {
    super(breakpoints, matchMedia);

    // Disable Async processing while testing...
    this._asyncQueue.enableAsync = false;
  }
}
