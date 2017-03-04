/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BreakPoint} from '../break-point';

export const RESPONSIVE_ALIASES = [
  'xs', 'gt-xs', 'sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg', 'xl'
];

export const DEFAULT_BREAKPOINTS: BreakPoint[] = [
  {
    alias: 'xs',
    mediaQuery: 'screen and (max-width: 599px)'
  },
  {
    alias: 'gt-xs',
    overlapping: true,
    mediaQuery: 'screen and (min-width: 600px)'
  },
  {
    alias: 'sm',
    mediaQuery: 'screen and (min-width: 600px) and (max-width: 959px)'
  },
  {
    alias: 'gt-sm',
    overlapping: true,
    mediaQuery: 'screen and (min-width: 960px)'
  },
  {
    alias: 'md',
    mediaQuery: 'screen and (min-width: 960px) and (max-width: 1279px)'
  },
  {
    alias: 'gt-md',
    overlapping: true,
    mediaQuery: 'screen and (min-width: 1280px)'
  },
  {
    alias: 'lg',
    mediaQuery: 'screen and (min-width: 1280px) and (max-width: 1919px)'
  },
  {
    alias: 'gt-lg',
    overlapping: true,
    mediaQuery: 'screen and (min-width: 1920px)'
  },
  {
    alias: 'xl',
    mediaQuery: 'screen and (min-width: 1920px) and (max-width: 5000px)'
  }
];

