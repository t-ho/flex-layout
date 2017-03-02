/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {OpaqueToken} from '@angular/core';
import {BreakPoint} from './break-point';
import {DEFAULT_BREAKPOINTS} from './data/break-points';
import {validateSuffixes} from '../../utils/breakpoint-tools';

/**
 *  Opaque Token unique to the flex-layout library.
 *  Use this token when build a custom provider (see below).
 */
export const BREAKPOINTS: OpaqueToken = new OpaqueToken('fxRawBreakpoints');


/**
 * Build a validated list of raw defaults
 */
export function buildValidatedList(): BreakPoint[] {
  return validateSuffixes(DEFAULT_BREAKPOINTS);
}

/**
 *  Provider to return observable to ALL known BreakPoint(s)
 *  Developers should build custom providers to override
 *  this default BreakPointRegistry dataset provider
 *  NOTE: !! custom breakpoints lists MUST contain the following aliases & suffixes:
 *        [xs, gt-xs, sm, gt-sm, md, gt-md, lg, gt-lg, xl]
 */
export const BreakPointsProvider = { // tslint:disable-line:variable-name
  provide: BREAKPOINTS,
  useFactory: buildValidatedList
};
