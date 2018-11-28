import {stateNames} from './const.js';
import green from './states/green.js';
import yellow from './states/yellow.js';
import red from './states/red.js';

/** @type import('../../../sm-element').Machine */
const machine = {
  initial: stateNames.RED,
  states: {
    green: green,
    yellow: yellow,
    red: red,
  },
};

export default machine;
