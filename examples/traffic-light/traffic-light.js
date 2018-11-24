import SMElement, {Machine, html} from '../../src/sm-element';
import style from './style.js';

import {eventNames, stateNames} from './const.js';

/**
 * @extends {SMElement}
 */
class TrafficLight extends SMElement {

  /** @return {!Machine} */
  static get machine() {
    return {
      initial: stateNames.RED,
      states: {
        green: {
          name: stateNames.GREEN,
          /** @this {TrafficLight} */
          onEntry() {
            setTimeout(() => {
              this.send(eventNames.CHANGE);
            }, this.greenDelay);
          },
          transitions: [
            {
              event: eventNames.CHANGE,
              target: stateNames.YELLOW,
              /** @this {TrafficLight} */
              effect() {
                return {color: 'yellow'};
              }
            }
          ],
          /** @this {TrafficLight} */
          render() {
            return html`don't walk`;
          }
        },
        yellow: {
          name: stateNames.YELLOW,
          /** @this {TrafficLight} */
          onEntry() {
            setTimeout(() => {
              this.send(eventNames.CHANGE);
            }, this.yellowDelay);
          },
          transitions: [
            {
              event: eventNames.CHANGE,
              target: stateNames.RED,
              /** @this TrafficLight */
              effect() {
                return {color: 'red', pedestrianCount: Math.round(Math.random() * 10)};
              },
            }
          ],
          /** @this {TrafficLight} */
          render() {
            return html`don't walk`;
          }
        },
        red: {
          name: stateNames.RED,
          /** @this {TrafficLight} */
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
              /** @this {TrafficLight} */
              effect() {
                return {color: 'green'};
              },
              /** @this {TrafficLight} */
              condition() {
                // only transition to green if there are no more pedestrians
                return this.pedestrianCount === 0;
              },
            },
          ],
          /** @this {TrafficLight} */
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
        },
      },
    };
  }

  static get properties() {
    return {
      color: {
        reflect: true,
        notify: true,
        type: String
      },
      yellowDelay: {
        value: 1000,
        type: Number,
      },
      redDelay: {
        value: 2000,
        type: Number,
      },
      greenDelay: {
        value: 2000,
        type: Number
      },
      pedestrianCount: {
        type: Number,
        value: 4,
      }
    }
  }
  // the component's `data` property is passed to render
  render({color}) {
    return html`
      ${style}
      <div>
        <div id="light" class="${color}"></div>
          <div>
            <!-- use the currentStateRender -->
            ${this.currentStateRender(this.data)}
          </div>
      </div>
    `;
  }

};

customElements.define('traffic-light', TrafficLight);

export default TrafficLight;
