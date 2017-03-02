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

import {BreakPoint} from '../break-point';
import {DEFAULT_BREAKPOINTS} from './break-points';
import {CUSTOM_BREAKPOINTS} from './custom-breakpoints';
import {BREAKPOINTS} from '../break-points-provider';
import {
  ExtendedBreakPointsProvider,
  provideCustomBreakPoints
} from '../custom-breakpoints-provider';

describe('break-point-provider', () => {
  let breakPoints: BreakPoint[ ];

  describe('with default configuration', () => {
    beforeEach(() => {
      // Configure testbed to prepare services
      TestBed.configureTestingModule({
        providers: [ExtendedBreakPointsProvider]
      });
    });
    beforeEach(async(inject([BREAKPOINTS], (_breakPoints_) => {
      breakPoints = _breakPoints_;
    })));

    it('has the both standard default breakpoints + internal custom breakpoints', () => {
      const total = CUSTOM_BREAKPOINTS.length + DEFAULT_BREAKPOINTS.length;
      expect(breakPoints.length).toEqual(total);
      expect(breakPoints[0].alias).toEqual('xs');
      expect(breakPoints[breakPoints.length - 1].alias).toEqual('web.portrait');
    });
  });

  describe('with custom configuration', () => {
    let bpList;
    const EXTRAS: BreakPoint[] = [
      {alias: 'lt-ab', mediaQuery: '(max-width: 297px)'},
      {alias: 'cd', mediaQuery: '(min-width: 298px) and (max-width:414px)'}
    ];

    beforeEach(() => {
      // Configure testbed to prepare services
      TestBed.configureTestingModule({
        providers: [provideCustomBreakPoints(EXTRAS)]
      });
    });
    // tslint:disable-next-line:no-shadowed-variable
    beforeEach(async(inject([BREAKPOINTS], (breakPoints) => {
      bpList = breakPoints;
    })));

    it('has the custom breakpoints', () => {
      const total = CUSTOM_BREAKPOINTS.length + DEFAULT_BREAKPOINTS.length + EXTRAS.length;

      expect(bpList.length).toEqual(total);
      expect(bpList[total - 1].alias).toEqual('cd');
      expect(bpList[total - 1].suffix).toEqual('Cd');
      expect(bpList[total - 2].alias).toEqual('lt-ab');
      expect(bpList[total - 2].suffix).toEqual('LtAb');
    });
  });


});
