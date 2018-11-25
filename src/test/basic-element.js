import SMElement from '../../sm-element.js';
import {html} from 'lit-html/lit-html';

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
          ],
        },
        other: {
          name: 'other',
          transitions: [
            {
              event: 'reset',
              target: 'on'
            },
          ],
        },
      },
    };
  }

  static get properties() {
    return {
      foo:{
        type: String,
        reflect: true,
        notify: true,
      },
      bar: {
        type: String,
      },
      baz: {
        type: Boolean,
        reflect: true,
      },
      fooBar: {
        type: String,
        reflect: true,
      }
    };
  }

  render() {
    return html`hello basic!`;
  }
}

customElements.define('basic-element', BasicElement);
