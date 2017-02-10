/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// RxJS Operators used by the classes...

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';

import {TestBed, inject, async} from '@angular/core/testing';

import {MediaChange} from './media-change';
import {BreakPoint} from './breakpoints/break-point';
import {ChangeQueue} from './change-queue';
import {MockMatchMedia} from './mock/mock-match-media';
import {BreakPointsProvider} from './breakpoints/break-points';
import {BreakPointRegistry} from './breakpoints/break-point-registry';
import {MatchMedia, OnMediaChange} from './match-media';
import {ObservableMedia, ObservableMediaProvider} from './observable-media-service';


describe('match-media', () => {
  let matchMedia: MockMatchMedia;
  let current : MediaChange;

  beforeEach(() => {
    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      providers: [
        BreakPointRegistry,           // Registry of known/used BreakPoint(s)
        BreakPointsProvider,          // Supports developer overrides of list of known breakpoints
        {
          provide: MatchMedia,
          useClass: MockMatchMedia
        }
      ]
    });
  });

  // Single async inject to save references; which are used in all tests below
  beforeEach(async(inject([MatchMedia], (service) => {
    matchMedia = service;      // inject only to manually activate mediaQuery ranges
    matchMedia.onChange = (change:MediaChange) => current = change;
  })));
  afterEach(() => {
    matchMedia.clearAll();
  });


  it('can observe all mediaQuery activations', () => {
    let query1 = "screen and (min-width: 610px) and (max-width: 620px)";
    let query2 = "(min-width: 730px) and (max-width: 950px)";

    expect(current).not.toBeDefined();

    let activated = matchMedia.activate(query1);    // simulate mediaQuery change to Query1
    expect(activated).toEqual(true);
    expect(current.mediaQuery).toEqual(query1);
    expect(matchMedia.isActive(query1)).toBeTruthy();

    activated = matchMedia.activate(query2);        // simulate mediaQuery change to Query2

    expect(activated).toEqual(true);
    expect(current.mediaQuery).toEqual(query2);   // confirm no notification
    expect(matchMedia.isActive(query2)).toBeTruthy();
  });

  it('can observe custom mediaQuery ranges', () => {
    let activated;
    let query1 = "screen and (min-width: 610px) and (max-width: 620px)";
    let query2 = "(min-width: 730px) and (max-width: 950px)";

    activated = matchMedia.activate(query1);   // simulate mediaQuery change

    expect(activated).toEqual(true);
    expect(current.mediaQuery).toEqual(query1);
    expect(matchMedia.isActive(query1)).toBeTruthy();

    activated = matchMedia.activate(query2);   // simulate mediaQuery change

    expect(activated).toEqual(true);
    expect(matchMedia.isActive(query2)).toBeTruthy();
  });

});


describe('match-media-observable', () => {
  let breakPoints: BreakPointRegistry;
  let matchMedia: MockMatchMedia;
  let mediaQuery$: Observable<MediaChange>;
  let current: MediaChange;

  beforeEach(() => {
    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      providers: [
        BreakPointsProvider,  // Supports developer overrides of list of known breakpoints
        BreakPointRegistry,   // Registry of known/used BreakPoint(s)
        ObservableMediaProvider,  // injectable `media$` matchMedia observable
        {
          provide: MatchMedia,
          useClass: MockMatchMedia
        }
      ]
    });
  });

  // Single async inject to save references; which are used in all tests below
  beforeEach(inject(
      [ObservableMedia, MatchMedia, BreakPointRegistry],
      (_media$_, _matchMedia_, _breakPoints_) => {
        matchMedia = _matchMedia_;      // inject only to manually activate mediaQuery ranges
        matchMedia.onChange = (change:MediaChange) => current = change;

        breakPoints = _breakPoints_;
        mediaQuery$ = _media$_;

        // Quick register all breakpoint mediaQueries
        breakPoints.items.forEach((bp: BreakPoint) => {
          matchMedia.registerQuery(bp.mediaQuery, matchMedia.onChange );
        });
      }));
  afterEach(() => {
    matchMedia.clearAll();
  });

  it('can observe an existing activation', () => {
    let bp = breakPoints.findByAlias('md');
    matchMedia.activate(bp.mediaQuery);
    expect(current.mediaQuery).toEqual(bp.mediaQuery);
  });

  it('can observe custom mediaQuery ranges', () => {
    let customQuery = "screen and (min-width: 617px) and (max-width: 633px)";
    let activated = matchMedia.activate(customQuery);
    expect(activated).toEqual(true);
    expect(current.mediaQuery).toEqual(customQuery);
  });

  it('can observe registered breakpoint activations', () => {
    let bp = breakPoints.findByAlias('md');
    let activated = matchMedia.activate(bp.mediaQuery);
    expect(activated).toEqual(true);
    expect(current.mediaQuery).toEqual(bp.mediaQuery);
  });

  /**
   * Only the ObservableMedia ignores de-activations;
   * MediaMonitor and MatchMedia report both activations and de-activations!
   */
  it('observes mediaQuery de-activations', () => {
    let activationCount = 0, deactivationCount = 0;
    let mdQuery = breakPoints.findByAlias('md').mediaQuery;
    let gtMdQuery = breakPoints.findByAlias('gt-md').mediaQuery;
    let onChange : OnMediaChange = (change:MediaChange) => {
          if (change.matches) {
            ++activationCount;
          } else {
            ++deactivationCount;
          }
        };

    matchMedia.registerQuery(mdQuery,  onChange);
    matchMedia.registerQuery(gtMdQuery, onChange);

    matchMedia.activate(mdQuery);
    matchMedia.activate(gtMdQuery);

    expect(activationCount).toEqual(2);
    expect(deactivationCount).toEqual(1);
  });

});
