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

import {TestBed, inject, async} from '@angular/core/testing';

import {MediaChange} from '../media-change';
import {BreakPoint} from '../breakpoints/break-point';
import {MockMatchMedia} from './mock-match-media';
import {BreakPointsProvider} from '../breakpoints/break-points';
import {BreakPointRegistry} from '../breakpoints/break-point-registry';

describe('mock-match-media', () => {
  let breakPoints: BreakPointRegistry;
  let matchMedia: MockMatchMedia;
  let current: MediaChange;

  beforeEach(() => {
    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      providers: [
        MockMatchMedia,
        BreakPointRegistry,   // Registry of known/used BreakPoint(s)
        BreakPointsProvider,  // Supports developer overrides of list of known breakpoints
      ]
    });
  });
  beforeEach(async(inject([MockMatchMedia, BreakPointRegistry], (_matchMedia_, _breakPoints_) => {
    // Single async inject to save references; which are used in all tests below
    matchMedia = _matchMedia_;
    breakPoints = _breakPoints_;

    breakPoints.items.forEach((bp: BreakPoint) => {
      matchMedia.registerQuery(bp.mediaQuery, change => current = change);
    });
  })));
  afterEach(() => {
    matchMedia.clearAll();
    current = undefined;
  });

  it('can observe custom mediaQuery ranges', () => {
    let customQuery = "screen and (min-width: 610px) and (max-width: 620px";

    matchMedia.registerQuery(customQuery, change => current = change);

    let activated = matchMedia.activate(customQuery);
    expect(activated).toEqual(true);
    expect(current.mediaQuery).toEqual(customQuery);
  });


  it('can observe a media query change for each breakpoint', () => {
    breakPoints.items.forEach((bp: BreakPoint) => {
      try {
        matchMedia.activate(bp.mediaQuery);
        expect(current).not.toBeFalsy();
        expect(current.mediaQuery).toEqual(bp.mediaQuery);
      } finally {
        current = null;
      }
    });
  });

  it('can observe ALL media query changes', () => {
    let mqcGtSM: MediaChange,
        bpGtSM = breakPoints.findByAlias('gt-sm'),
        bpLg = breakPoints.findByAlias('lg');

    matchMedia.activate(bpGtSM.mediaQuery);

    expect(current).not.toBeFalsy();
    expect(current.mediaQuery).toEqual(bpGtSM.mediaQuery);
    expect(matchMedia.isActive(bpGtSM.mediaQuery)).toBeTruthy();

    mqcGtSM = current;

    matchMedia.activate(bpLg.mediaQuery);
    expect(current.mediaQuery).not.toEqual(mqcGtSM.mediaQuery);
    expect(matchMedia.isActive(bpLg.mediaQuery)).toBeTruthy();
    expect(matchMedia.isActive(bpGtSM.mediaQuery)).toBeFalsy();
  });

  it('can observe only a specific media query changes', () => {
    let last: MediaChange,
        bpGtSM = breakPoints.findByAlias('gt-sm'),
        bpLg = breakPoints.findByAlias('lg');

    matchMedia.registerQuery(bpLg.mediaQuery,(change: MediaChange) => {
      last = change;
    });

    matchMedia.activate(bpGtSM.mediaQuery);
    expect(last).toBeFalsy();

    matchMedia.activate(bpLg.mediaQuery);
    expect(last).toBeTruthy();
    expect(last.mediaQuery).toEqual(bpLg.mediaQuery);
    expect(matchMedia.isActive(bpLg.mediaQuery)).toBeTruthy();
  });

  it('can observe both activation and deactivation changes', () => {
    let activates = 0, deactivates = 0;
    let bpGtSM = breakPoints.findByAlias('gt-sm'),
        bpLg = breakPoints.findByAlias('lg');
    let onChange = change => (change.matches && ++activates) || ++deactivates;

    // By default the "all" is initially active.

    matchMedia.registerQuery(bpGtSM.mediaQuery, onChange);
    matchMedia.registerQuery(bpLg.mediaQuery, onChange);

    expect(activates).toEqual(0);

    matchMedia.activate(bpGtSM.mediaQuery);
    expect(activates).toEqual(1);
    expect(deactivates).toEqual(0);

    matchMedia.activate(bpLg.mediaQuery);
    expect(activates).toEqual(2);
    expect(deactivates).toEqual(1);

    matchMedia.activate(bpGtSM.mediaQuery);
    expect(activates).toEqual(3);
    expect(deactivates).toEqual(2);

  });

  it('can observe both activated & deactivated changes for specific mediaQueries', () => {
    let activates = 0, deactivates = 0;
    let bpGtSM = breakPoints.findByAlias('gt-sm'),
        bpLg = breakPoints.findByAlias('lg');
    let onChange = change => (change.matches && ++activates) || ++deactivates;

    matchMedia.registerQuery(bpGtSM.mediaQuery, onChange);
    matchMedia.registerQuery(bpLg.mediaQuery, onChange);

    matchMedia.activate(bpGtSM.mediaQuery);
    expect(activates).toEqual(1);
    expect(deactivates).toEqual(0);

    matchMedia.activate(bpLg.mediaQuery);
    expect(activates).toEqual(2);
    expect(deactivates).toEqual(1);

    matchMedia.activate(bpGtSM.mediaQuery);
    expect(activates).toEqual(3);
    expect(deactivates).toEqual(2);
  });

  it('can activate with either a mediaQuery or an alias', () => {
    let activates = 0;
    let bpGtSM = breakPoints.findByAlias('gt-sm'),
        bpLg = breakPoints.findByAlias('lg');
    let onChange = change => change.matches ? ++activates : 0;

    matchMedia.registerQuery(bpGtSM.mediaQuery, onChange);
    matchMedia.registerQuery(bpLg.mediaQuery, onChange);

    matchMedia.activate(bpGtSM.mediaQuery);
    expect(activates).toEqual(1);

    matchMedia.activate(bpLg.mediaQuery);
    expect(activates).toEqual(2);

    matchMedia.activate(bpGtSM.mediaQuery);
    expect(activates).toEqual(3);

    matchMedia.activate(bpLg.mediaQuery);
    expect(activates).toEqual(4);
  });

  it('can check if a range is active', () => {
    let bpXs = breakPoints.findByAlias('xs'),
        bpGtXs = breakPoints.findByAlias('gt-xs'),
        bpSm = breakPoints.findByAlias('sm'),
        bpGtSm = breakPoints.findByAlias('gt-sm'),
        bpMd = breakPoints.findByAlias('md'),
        bpGtMd = breakPoints.findByAlias('gt-md'),
        bpLg = breakPoints.findByAlias('lg');

    matchMedia.activate(bpGtSm.mediaQuery);
    expect(matchMedia.isActive(bpGtSm.mediaQuery)).toBeTruthy();
    expect(matchMedia.isActive(bpLg.mediaQuery)).toBeFalsy();

    matchMedia.activate(bpLg.mediaQuery);
    expect(matchMedia.isActive(bpGtSm.mediaQuery)).toBeFalsy();
    expect(matchMedia.isActive(bpLg.mediaQuery)).toBeTruthy();

    matchMedia.activate(bpGtSm.mediaQuery);
    expect(matchMedia.isActive(bpXs.mediaQuery)).toBeFalsy();
    expect(matchMedia.isActive(bpGtXs.mediaQuery)).toBeFalsy();
    expect(matchMedia.isActive(bpSm.mediaQuery)).toBeFalsy();
    expect(matchMedia.isActive(bpGtSm.mediaQuery)).toBeTruthy();
    expect(matchMedia.isActive(bpMd.mediaQuery)).toBeFalsy();
    expect(matchMedia.isActive(bpGtMd.mediaQuery)).toBeFalsy();
    expect(matchMedia.isActive(bpLg.mediaQuery)).toBeFalsy();
  });
});
