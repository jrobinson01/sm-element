import {stateNames, eventNames} from '../const.js';
import {html} from '../../../../sm-element';

export default {
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
