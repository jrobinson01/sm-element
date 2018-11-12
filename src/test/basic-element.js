import {SMElement} from '../sm-element.js';
import {html, render} from '../../node_modules/lit-html/lit-html.js';

export default class BasicElement extends SMElement {
  static get machine() {
    return {
      initial:'on',
      states: {
        on: {
          name:'on',
          transitions: [
            {
              event: 'toggle',
              target: 'off'
            }
          ]
        },
        off: {
          name: 'off',
          transitions: [
            {
              event: 'toggle',
              target: 'on'
            },
          ]l
        },
      },
    };
  }

  static get properties() {
    return {};
  }

  render(data) {
    return html `hello!`;
  }
}

customElements.define('basic-element', BasicElement);
