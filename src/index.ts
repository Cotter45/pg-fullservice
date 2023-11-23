#!/usr/bin/node

import { generator } from './command';

import * as GeneratorTypes from './types';

generator();

export { GeneratorTypes };

export default generator;
