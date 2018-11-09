import SMElement from './lib/sm-element.js';
import {html, render} from '../node_modules/lit-html/lit-html.js';

class MyComponent extends SMElement {

  static get machine() {
    return {
      initial: 'red',
      states: {
        green: {
          name: 'green',
          onEntry: function() {
            setTimeout(() => {
              this.send('change');
            }, this.greenDelay);
          },
          transitions: [
            {
              event: 'change',
              target: 'yellow',
              effect: function(detail) {
                return {color: 'yellow'};
              }
            }
          ]
        },
        yellow: {
          name: 'yellow',
          onEntry: function() {
            setTimeout(() => {
              this.send('change');
            }, this.yellowDelay);
          },
          transitions: [
            {
              event: 'change',
              target: 'red',
              effect: function(detail) {
                return {color: 'red'};
              }
            }
          ]
        },
        red: {
          name: 'red',
          onEntry: function() {
            setTimeout(() => {
              this.send('change');
            }, this.redDelay);
          },
          transitions: [
            {
              event: 'change',
              target: 'green',
              effect: function(detail) {
                return {color: 'green'};
              }
            }
          ]
        },
      },
    };
  }

  static get properties() {
    return {
      color: {
        value: 'red',// TODO: setting the initial state does not set properties so this needs to be synced up
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
    }
  }

  render({color}) {
    return html`
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
      <div id="light" class="${color}"></div>
      <div>
        ${this.isState(this.currentState, this.states.green) ? `don't walk` :
        this.isState(this.currentState, this.states.yellow) ? `run` :
        this.isState(this.currentState, this.states.red) ? html`walk` : '' }
      </div>
    `;
  }

};

customElements.define('my-component', MyComponent);
