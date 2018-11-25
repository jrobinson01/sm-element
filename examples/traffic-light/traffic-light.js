import SMElement, {html} from '../../sm-element';
import style from './style.js';
import machine from './machine/machine.js';

class TrafficLight extends SMElement {

  static get machine() {
    return machine;
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
