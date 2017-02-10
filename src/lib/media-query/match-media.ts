/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '@angular/core';
import {MediaChange} from './media-change';

/**
 * EventHandler callback with the mediaQuery [range] activates or deactivates
 */
export interface MediaQueryListListener {
  // Function with Window's MediaQueryList argument
  (mql: MediaQueryList): void;
}

/**
 * EventDispatcher for a specific mediaQuery [range]
 */
export interface MediaQueryList {
  readonly matches: boolean;
  readonly media: string;
  addListener(listener: MediaQueryListListener): void;
  removeListener(listener: MediaQueryListListener): void;
}

/**
 * Callback mechanism used in both the MatchMedia and
 * the MediaMonitor processes
 */
export interface OnMediaChange {
  (change: MediaChange): void;
}


/**
 * MediaMonitor configures listeners to mediaQuery changes and publishes an Observable facade to
 * convert mediaQuery change callbacks to subscriber notifications. These notifications will be
 * performed within the ng Zone to trigger change detections and component updates.
 *
 *  - both mediaQuery activations and de-activations are announced in notifications
 *  - no clearAll/destroy method is implemented since mediaQueries are considered persistent
 */
@Injectable()
export class MatchMedia {

  /**
   * For the specified mediaQuery?
   */
  isActive(mediaQuery: string): boolean {
    if (this._registry.has(mediaQuery)) {
      let mql = this._registry.get(mediaQuery);
      return mql.matches;
    }
    return false;
  }

  /**
   * Based on the BreakPointRegistry provider, register internal listeners for each unique
   * mediaQuery. Each listener emits specific MediaChange data to observers
   */
  registerQuery(mediaQuery: string, callback: OnMediaChange) {
    let onMQLEvent = (e: MediaQueryList) => callback(new MediaChange(e.matches, mediaQuery));

    if (mediaQuery) {
      let mql = this._registry.get(mediaQuery);
      if (!mql) {
        mql = this._buildMQL(mediaQuery);
        this._registry.set(mediaQuery, mql);
      }

      mql.addListener(onMQLEvent);
      if (mql.matches) {
        onMQLEvent(mql);  // Announce activate range for initial subscribers
      }
    }
  }

  /**
   * Call window.matchMedia() to build a MediaQueryList; which
   * supports 0..n listeners for activation/deactivation
   */
  protected  _buildMQL(query: string): MediaQueryList {
    prepareQueryCSS(query);

    let canListen = !!(<any>window).matchMedia('all').addListener;
    return canListen ? (<any>window).matchMedia(query) : <MediaQueryList>{
          matches: query === 'all' || query === '',
          media: query,
          addListener: () => {
          },
          removeListener: () => {
          }
        };
  }

  protected _registry = new Map<string, MediaQueryList>();
}

/**
 * Private global registry for all dynamically-created, injected style tags
 * @see prepare(query)
 */
const ALL_STYLES = {};

/**
 * For Webkit engines that only trigger the MediaQueryListListener
 * when there is at least one CSS selector for the respective media query.
 *
 * @param query string The mediaQuery used to create a faux CSS selector
 *
 */
function prepareQueryCSS(query) {
  if (!ALL_STYLES[query]) {
    try {
      let style = document.createElement('style');

      style.setAttribute('type', 'text/css');
      if (!style['styleSheet']) {
        let cssText = `@media ${query} {.fx-query-test{ }}`;
        style.appendChild(document.createTextNode(cssText));
      }

      document.getElementsByTagName('head')[0].appendChild(style);

      // Store in private global registry
      ALL_STYLES[query] = style;

    } catch (e) {
      console.error(e);
    }
  }
}

