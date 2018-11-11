import SMElement from '../lib/sm-element.js';
import {html, render} from '../../node_modules/lit-html/lit-html.js';

const style = html `
  <style>
    div {
      margin: 10px;
      width: 100px;
      text-align: center;
    }
    #light {
      width: 100px;
      height: 100px;
      border: 4px solid black;
      background-color: black;
      border-radius: 50%;
    }
    #light.green {
      background-color: green;
    }
    #light.red {
      background-color: red;
    }
    #light.yellow {
      background-color: yellow;
    }
  </style>
`;

class TrafficLight extends SMElement {

  static get machine() {
    return {
      initial: 'red',
      states: {
        green: {
          name: 'green',
          onEntry() {
            // wait greenDelay ms before sending the change event
            setTimeout(() => {
              this.send('change');
            }, this.greenDelay);
          },
          transitions: [
            {
              event: 'change',
              target: 'yellow',
              effect(detail) {
                return {color: 'yellow'};
              }
            }
          ],
          render() {
            return `don't walk`;
          }
        },
        yellow: {
          name: 'yellow',
          onEntry() {
            setTimeout(() => {
              this.send('change');
            }, this.yellowDelay);
          },
          transitions: [
            {
              event: 'change',
              target: 'red',
              effect(detail) {
                // for the sake of a simplified demo, set pedestrian count immediately.
                // for a more realistic demo, pedestrian count could be controlled by
                // outside forces. (a button (that is only enabled during red state) could increment)
                return {color: 'red', pedestrianCount: Math.round(Math.random() * 10)};
              },
            }
          ],
          render() {
            return `don't walk`;
          }
        },
        red: {
          name: 'red',
          onEntry() {
            this.color = 'red';
            this.pedestrianRemover = setInterval(() =>{
              if (this.pedestrianCount >= 1) {
                // for simplicity, decrease pedestrian count here,
                // but in the real world, this would be
                // outside our control.
                this.pedestrianCount -= 1;
              } else {
                // need to clear interval now, since it may run again,
                // and trigger another change (all states respond to change event)
                clearInterval(this.pedestrianRemover);
                setTimeout(() => {
                  this.send('change');
                }, this.redDelay);
              }
            }, 500);
          },
          transitions: [
            {
              event: 'change',
              target: 'green',
              effect(detail) {
                return {color: 'green'};
              },
              condition(detail) {
                // only transition to green, if there are no more pedestrians
                return this.pedestrianCount === 0;
              },
            },
          ],
          render() {
            return 'walk';
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
        value: 3000,
        type: Number,
      },
      greenDelay: {
        value: 4000,
        type: Number
      },
      pedestrianCount: {
        type: Number,
        value: 4,
      }
    }
  }

  render({color, pedestrianCount}) {
    return html`
      ${style}
      <div>
        <div id="light" class="${color}"></div>
          <div>
            <!-- use the currentStateRender -->
            ${this.currentStateRender()}
          </div>
        <div>
          pedestrians: ${pedestrianCount}
        </div>
        <div>
          <button
            @click="${(event) => this.pedestrianCount += 1 }"
            .disabled="${this.disableButton()}">
          add pedestrians
          </button>
        </div>
      </div>
    `;
  }

  disableButton() {
    return this.pedestrianCount <= 0 ||
      !this.isState(this.currentState, this.states.red);
  }

};

customElements.define('traffic-light', TrafficLight);
