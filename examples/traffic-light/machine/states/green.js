import {stateNames, eventNames} from '../const.js';
import {html} from '../../../../sm-element';

export default  {
  name: stateNames.GREEN,
  onEntry() {
    setTimeout(() => {
      this.send(eventNames.CHANGE);
    }, this.greenDelay);
  },
  transitions: [
    {
      event: eventNames.CHANGE,
      target: stateNames.YELLOW,
      effect() {
        return {color: 'yellow'};
      }
    }
  ],
  render() {
    return html`don't walk`;
  }
};
