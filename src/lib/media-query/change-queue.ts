/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BreakPoint} from './breakpoints/break-point';
import {OnMediaChange} from './match-media';
import {MediaChange} from './media-change';


/**
 * Queue class to prioritize order of deactivation messages
 * and identify single, best activation message to emit
 */
export class ChangeQueue {
  public enableAsync = false;

  constructor(private _notify: OnMediaChange, private _breakpoints: BreakPoint[]) {
  }

  /**
   * Notification from MatchMedia when a mediaQuery breakpoint activates or deactivates
   */
  public onMediaChange(change: MediaChange) {
    this._queueChanges(change);

    if (!this._debouncing) {
      let processQueue = () => {   // Implicitly runs in the ngZone
        this._announceDeactivations();
        this._announceActivation();
        this._debouncing = false;
      };

      this._debouncing = true;
      if (this.enableAsync) {
        setTimeout(processQueue, 0);
      } else {
        processQueue();
      }
    }
  }

  /**
   * Queue up specific set of deactivated or deactivated items.
   */
  private _queueChanges(change: MediaChange) {
    let buffer = change.matches ? this._activated : this._deactivated;
    buffer.push(change);
  }

  /**
   * Priority lookup finds the smallest `active` range.
   * Only one (1) activation is messaged per activation queue
   * NOTE: the breakpoint registry should be pre-sorted from smallest to largest
   *       e.g. xs > gt-xs > sm > gt-sm > md > gt-md > lg > gt-lg > xl
   */
  private _announceActivation() {
    let findFirstActivation = (change: MediaChange, bp: BreakPoint) => {
      return change || this._findActivationFor(bp);
    };
    this._notify(this._breakpoints.reduce(findFirstActivation, null));
    this._activated.length = 0;
  }

  /**
   * Prioritized queue: 1st announce all deactivations.
   */
  private _announceDeactivations() {
    this._deactivated.forEach((change: MediaChange) => {
      this._notify(change);
    });
    this._deactivated.length = 0;
  }

  /**
   * Find (if avaiable) the activation change for the specified breakpoint
   */
  private _findActivationFor(bp: BreakPoint): MediaChange {
    return this._activated.reduce((result, change) => {
      return result || ((change.mediaQuery === bp.mediaQuery) ? change : null);
    }, null);
  }

  protected _deactivated: Array<MediaChange> = new Array<MediaChange>();
  protected _activated: Array<MediaChange> = new Array<MediaChange>();
  protected _debouncing = false;
}
