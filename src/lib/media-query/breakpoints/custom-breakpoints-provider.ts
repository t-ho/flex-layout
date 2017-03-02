/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {OpaqueToken} from '@angular/core';  // tslint:disable-line:no-unused-variable
import {mergeByAlias, validateSuffixes} from '../../utils/breakpoint-tools';

import {BreakPoint} from './break-point';
import {DEFAULT_BREAKPOINTS} from './data/break-points';
import {CUSTOM_BREAKPOINTS} from './data/custom-breakpoints';
import {BREAKPOINTS} from './break-points-provider';


/**
 * Add new custom items to the default list or override existing default with custom overrides
 */
export function _mergedBreakPointFactory(_custom?: BreakPoint[]) {
  return () => {
    // Order so the defaults are loaded last; so ObservableMedia will report these last!
    let defaults = CUSTOM_BREAKPOINTS.concat(DEFAULT_BREAKPOINTS);
    return mergeByAlias(defaults, _custom || []);
  };
}

/**
 * Build and validate all default breakpoints
 */
export function _mergedDefaults() {
  let defaults = DEFAULT_BREAKPOINTS.concat(CUSTOM_BREAKPOINTS);
  return validateSuffixes(defaults);
}

/**
 * Default Provider that does not support external customization
 */
export const ExtendedBreakPointsProvider = { // tslint:disable-line:variable-name
  provide: BREAKPOINTS,
  useFactory: _mergedDefaults
};
/**
 * Use with FlexLayoutModule.provideCustomBreakPoints!
 */
export function provideCustomBreakPoints(_custom?: BreakPoint[]) {
  return {
    provide: BREAKPOINTS,
    useFactory: _mergedBreakPointFactory(_custom)
  };
}
