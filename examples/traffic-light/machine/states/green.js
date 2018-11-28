import {stateNames, eventNames} from '../const.js';
import {html} from '../../../../sm-element';
/** @type import('../../../../sm-element').State */
const state = {
  name: stateNames.GREEN,
  /** @this {{color:string, greendDelay:number}} */
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
export default state;
