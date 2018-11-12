import SMElement from '../lib/sm-element.js';
import {html, render} from 'lit-html/lit-html.js';

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

const eventNames = {
  CHANGE: 'change',
};

const stateNames = {
  RED: 'red',
  YELLOW: 'yellow',
  GREEN: 'green',
}

class TrafficLight extends SMElement {

  static get machine() {
    return {
      initial: stateNames.RED,
      states: {
        green: {
          name: stateNames.GREEN,
          onEntry() {
            // wait greenDelay ms before sending the change event
            setTimeout(() => {
              this.send(eventNames.CHANGE);
            }, this.greenDelay);
          },
          transitions: [
            {
              event: eventNames.CHANGE,
              target: stateNames.YELLOW,
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
          name: stateNames.YELLOW,
          onEntry() {
            setTimeout(() => {
              this.send(eventNames.CHANGE);
            }, this.yellowDelay);
          },
          transitions: [
            {
              event: eventNames.CHANGE,
              target: stateNames.RED,
              effect(detail) {
                return {color: 'red', pedestrianCount: Math.round(Math.random() * 10)};
              },
            }
          ],
          render() {
            return `don't walk`;
          }
        },
        red: {
          name: stateNames.RED,
          onEntry() {
            this.color = 'red';
            this.pedestrianRemover = setInterval(() =>{
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
              effect(detail) {
                return {color: 'green'};
              },
              condition(detail) {
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
                  @click="${(event) => this.pedestrianCount += 1}"
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
  // the component's `data` property is passed to render
  render({color, pedestrianCount}) {
    return html`
      ${style}
      <div>
        <div id="light" class="${color}"></div>
          <div>
            <!-- use the currentStateRender -->
            ${this.currentStateRender()}
          </div>
      </div>
    `;
  }

};

customElements.define('traffic-light', TrafficLight);
