import {stateNames, eventNames} from '../const.js';
import {html} from '../../../../sm-element';

/** @type import('../../../../sm-element').State */
const state = {
  name: stateNames.YELLOW,
  onEntry() {
    this.color = 'yellow';
    setTimeout(() => {
      this.send(eventNames.CHANGE);
    }, this.yellowDelay);
  },
  transitions: [
    {
      event: eventNames.CHANGE,
      target: stateNames.RED,
      effect() {
        return {pedestrianCount: Math.round(Math.random() * 10)};
      },
    }
  ],
  render() {
    return html`don't walk`;
  }
};

export default state;
