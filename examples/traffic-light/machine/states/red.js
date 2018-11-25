import {stateNames, eventNames} from '../const.js';
import {html} from '../../../../sm-element';

export default {
  name: stateNames.RED,
  onEntry() {
    this.color = 'red';
    this.pedestrianRemover = setInterval(() => {
      if (this.pedestrianCount >= 1) {
        // for simplicity, decrease pedestrian count here,
        // but in the real world, this could be
        // outside our control.
        this.pedestrianCount -= 1;
      } else {
        // need to clear interval now, since it may run again,
        // and trigger another 'change' before we run out of pedestrians
        // (since all states respond to the 'change' event)
        clearInterval(this.pedestrianRemover);
        setTimeout(() => {
          this.send(eventNames.CHANGE);
        }, this.redDelay);
      }
    }, 500);
  },
  transitions: [
    {
      event: eventNames.CHANGE,
      target: stateNames.GREEN,
      effect() {
        return {color: 'green'};
      },
      condition() {
        // only transition to green if there are no more pedestrians
        return this.pedestrianCount === 0;
      },
    },
  ],
  render() {
    return html`
      walk
      <div>
        pedestrians: ${this.pedestrianCount}
      </div>
      <div>
        <button
          @click="${() => this.pedestrianCount += 1}"
          .disabled="${this.pedestrianCount <= 0}">
        add pedestrians
        </button>
      </div>
    `;
  }
};
