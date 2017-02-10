/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '@angular/core';

import {Subscription} from 'rxjs/Subscription';
import {Observable, Subscribable} from "rxjs/Observable";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import {BreakPointRegistry} from './breakpoints/break-point-registry';

import {MediaChange} from './media-change';
import {MatchMedia} from './match-media';
import {mergeAlias} from './../utils/add-alias';
import {BreakPoint} from './breakpoints/break-point';
import {ChangeQueue} from './change-queue';

/**
 * Base class for MediaService and pseudo-token for
 */
export abstract class ObservableMedia implements Subscribable<MediaChange> {
  abstract isActive(query: string): boolean;
  abstract asObservable(): Observable<MediaChange>;
  abstract subscribe(next?: (value: MediaChange) => void,
              error?: (error: any) => void,
              complete?: () => void): Subscription;
}

/**
 * Class internalizes a MatchMedia service and exposes an Subscribable and Observable interface.

 * This an Observable with that exposes a feature to subscribe to mediaQuery
 * changes and a validator method (`isActive(<alias>)`) to test if a mediaQuery (or alias) is
 * currently active.
 *
 * !! Only mediaChange activations (not de-activations) are announced by the ObservableMedia
 *
 * This class uses the BreakPoint Registry to inject alias information into the raw MediaChange
 * notification. For custom mediaQuery notifications, alias information will not be injected and
 * those fields will be ''.
 *
 * !! This is not an actual Observable. It is a wrapper of an Observable used to publish additional
 * methods like `isActive(<alias>). To access the Observable and use RxJS operators, use
 * `.asObservable()` with syntax like media.asObservable().map(....).
 *
 *  @usage
 *
 *  // RxJS
 *  import 'rxjs/add/operator/filter';
 *  import { ObservableMedia } from '@angular/flex-layout';
 *
 *  @Component({ ... })
 *  export class AppComponent {
 *    status : string = '';
 *
 *    constructor(  media:ObservableMedia ) {
 *      let onChange = (change:MediaChange) => {
 *        this.status = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : "";
 *      };
 *
 *      // Subscribe directly or access observable to use filter/map operators
 *      // e.g.
 *      //      media.subscribe(onChange);
 *
 *      media.asObservable()
 *        .filter((change:MediaChange) => true)   // silly noop filter
 *        .subscribe(onChange);
 *    }
 *  }
 */
@Injectable()
export class MediaService implements ObservableMedia {
  protected observable$: Observable<MediaChange>;
  protected source: BehaviorSubject<MediaChange>;

  constructor(private mediaWatcher: MatchMedia,
              private breakpoints: BreakPointRegistry) {

    this._asyncQueue = new ChangeQueue(this._next.bind(this), breakpoints.items);
    this.source = new BehaviorSubject<MediaChange>(new MediaChange(true));
    this.observable$ = this._buildObservable();

    this._registerBreakPoints();
  }

  /**
   * Test if specified query/alias is active.
   */
  isActive(alias): boolean {
    let query = this._toMediaQuery(alias);
    return this.mediaWatcher.isActive(query);
  };

  /**
   * Proxy to the Observable subscribe method
   */
  subscribe(next?: (value: MediaChange) => void,
            error?: (error: any) => void,
            complete?: () => void): Subscription {
    return this.observable$.subscribe(next, error, complete);
  };

  /**
   * Access to observable for use with operators like
   * .filter(), .map(), etc.
   */
  asObservable(): Observable<MediaChange> {
    return this.observable$;
  }

  // ************************************************
  // Internal Methods
  // ************************************************

  private _next(change:MediaChange) {
    if ( change ) {
      this.source.next(change);
    }
  }

  /**
   * Register all the mediaQueries registered in the BreakPointRegistry
   * This is needed so subscribers can be auto-notified of all standard, registered
   * mediaQuery activations
   */
  private _registerBreakPoints() {
    const onChange = this._asyncQueue.onMediaChange.bind(this._asyncQueue);

    this.breakpoints.items.forEach((bp: BreakPoint) => {
      this.mediaWatcher.registerQuery(bp.mediaQuery, onChange);
      return bp;
    });
  }

  /**
   * Prepare internal observable
   * NOTE: the raw MediaChange events [from MatchMedia] do not contain important alias information
   * these must be injected into the MediaChange
   */
  private _buildObservable() {
    let addAliasInfo = change => mergeAlias(change, this._findByQuery(change.mediaQuery));

    // Only pass/announce activations (not de-activations)
    // Inject associated (if any) alias information into the MediaChange event

    return this.source
        .asObservable()
        .filter(change => change.matches === true )
        .map(addAliasInfo);
  }

  /**
   * Breakpoint locator by alias
   */
  private _findByAlias(alias) {
    return this.breakpoints.findByAlias(alias);
  };

  /**
   * Breakpoint locator by mediaQuery
   */
  private _findByQuery(query) {
    return this.breakpoints.findByQuery(query);
  };

  /**
   * Find associated breakpoint (if any)
   */
  private _toMediaQuery(query) {
    let bp: BreakPoint = this._findByAlias(query) || this._findByQuery(query);
    return bp ? bp.mediaQuery : query;
  };

  /**
   * Prioritized async queue that manages mediaQuery activations
   * in proper order.
   */
  private _asyncQueue : ChangeQueue;
}

/**
 *  Provider to return observable to ALL MediaQuery events
 *  Developers should build custom providers to override this default MediaQuery Observable
 */
export const ObservableMediaProvider = { // tslint:disable-line:variable-name
  provide: ObservableMedia,
  useClass: MediaService,
  deps: [MatchMedia, BreakPointRegistry]
};
