import {stateNames, eventNames} from '../const.js';
import {html} from '../../../../sm-element';

export default {
  name: stateNames.GREEN,
  onEntry() {
    this.color = 'green';
    setTimeout(() => {
      this.send(eventNames.CHANGE);
    }, this.greenDelay);
  },
  transitions: [
    {
      event: eventNames.CHANGE,
      target: stateNames.YELLOW,
    }
  ],
  render() {
    return html`don't walk`;
  }
};
