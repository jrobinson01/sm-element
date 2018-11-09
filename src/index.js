import VComponent from './lib/vcomponent.js';
import {html, render} from '../node_modules/lit-html/lit-html.js';

class MyComponent extends VComponent {

  static get machine() {
    return {
      initial: 'red',
      states: {
        green: {
          name: 'green',
          onEntry: function() {
            setTimeout(() => {
              this.send('change');
            }, 3000);
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
            }, 1000);
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
            }, 3000);
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
        value: 'red',
      },
    }
  }

  render({color}) {
    return html`
    <style>
      div {
        width: 100px;
        height: 100px;
        border: 2px solid black;
        background-color: black;
        border-radius: 50%;
      }
      .green {
        background-color: green;
      }
      .red {
        background-color: red;
      }
      .yellow {
        background-color: yellow;
      }
    </style>
    <div class="${color}"></div>
    `;
  }

};

customElements.define('my-component', MyComponent);
