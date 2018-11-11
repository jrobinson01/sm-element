import {html, render} from '../../node_modules/lit-html/lit-html.js';

function serializeAttribute(prop) {
  if (typeof prop === 'boolean') {
    return prop ? '' : null;
  } else if (typeof prop === 'object') {
    // what to do with object props?
    const value = null;
    try {
      value = JSON.stringify(prop);
    } catch(e) {}
    return value;
  }
  return String(prop);
}


export default class SMElement extends HTMLElement {

  constructor() {
    super();
    this.__data = {};
    this.currentState;
    this.state__;
    this.root;
    this.renderRequest__;
    this.states = this.constructor.machine.states;
    // setup render target
    this.createRenderRoot();
    // setup property getter/setters
    this.initializeProps_(this.constructor.properties);
    // initialze data
    this.initializeData_(this.constructor.properties);
    // initialze the machine
    this.initializeMachine_(this.getStateByName_(this.constructor.machine.initial));
  }

  static get machine() {
    // return a basic state machine
    return {
      initial:'initial',
      states: {
        initial: {
          name: 'initial'
        }
      }
    };
  }

  static get properties() {
    // returns the data structure (a lot like polymer/lit-element properties)
    return {};
  }

  static get observedAttributes() {
    // for now, every property is observed
    const attributes = [];
    if (!this.__propNamesAndAttributeNames) {
      this.__propNamesAndAttributeNames = new Map();
    }
    for(let key in this.properties) {
      const aName = key.toLowerCase();
      this.__propNamesAndAttributeNames.set(aName, key);
      attributes.push(aName);
    }
    return attributes;
  }

  get state() {
    return this.__state;
  }

  set state(state) {
    this.__state = state;
    this.setAttribute('state', this.__state);
  }

  get data() {
    return this.__data;
  }

  // setter for data
  set data(newData) {
    // reflect any attributes that need to be reflected (reflect === true)
    // and dispatch any events (notify === true)
    // update internal state
    // TODO: does not currently deal with nested objects/arrays!
    // ...
    this.__data = Object.assign({}, this.__data, newData);
    for(let key in newData) {
      const cprop = this.constructor.properties[key];
      if (cprop.reflect) {
        const attribute = serializeAttribute(newData[key]);
        if (attribute === null) {
          this.removeAttribute(key);
        } else {
          this.setAttribute(key, attribute);
        }
      }
      if (cprop.notify) {
        this.dispatchEvent(new CustomEvent(`${key}-changed`, {
          composed: true,
          bubbles: false,
          detail: {
            value: newData[key]
          }
        }));
      }
    }
    this.requestRender__();
  }

  /**
   * creates a shadowRoot by default. override to use a different render target
   */
  createRenderRoot() {
    this.root = this.attachShadow({mode:'open'});
  }

  attributeChangedCallback(name, oldVal, newVal) {
    const propName = this.constructor.__propNamesAndAttributeNames.get(name);
    // only update property if it's changed to prevent infinite loop
    const value = this.constructor.properties[propName]['type'](newVal);
    if (propName && value !== this[propName]) {
      this[propName] = value;
    }
  }

  initializeData_(properties) {
    // flatten properties and assign
    this.data = Object.keys(properties).reduce((acc, k) => {
      // this happens AFTER props may have been set so use local prop if exists
      acc[k] = this[k] !== undefined ? this[k]: properties[k].value;
      return acc;
    }, {});
  }

  initializeMachine_(initial) {
    this.transitionTo_(initial);
  }

  initializeProps_(properties) {
    // create getter/setter pairs for properties
    const init = (key) => {
      Object.defineProperty(this, key, {
        get: function() {
          return this.data[key];
        },
        set: function(newVal) {
          const update = {};
          update[key] = newVal;
          this.data = update;
        }
      })
    }
    for(let key in properties) {
      init(key);
    }
  }

  // request a render on the next animation frame
  requestRender__() {
    cancelAnimationFrame(this.renderRequest__);
    this.renderRequest__ = requestAnimationFrame(() => {
      if (this.root) {
        render(this.render(this.__data), this.root);
      }
    });
  }

  isState(current, desired) {
    return Boolean(current && desired && current.name === desired.name);
  }

  // override in sub classes!
  render(data) {
    return html``;
  }

  send(eventName, detail = {}) {
    if (!eventName) {
      throw new Error('an event name is required to send!');
    }
    if (!this.currentState) {
      throw new Error(`cannot send with no state: ${eventName}`);
    }
    // find the appropriate transitions in the current state
    const transitions = this.currentState.transitions.filter(t => t.event === eventName);
    // no matching transitions in this state
    if (transitions.length === 0) {
      console.warn(`no transitions found in current state: "${this.state}" for event: "${eventName}"`);
      return;
    }
    // with multiple transitions handling the same event,
    // check each transition for conditions and throw an error,
    // for now, if any transition does not have a condition.
    if (transitions.length > 1 && transitions.filter(t => !t.condition).length > 0) {
      throw new Error(
        `multiple transitions found without a condition for event: ${eventName} in state: ${this.state}`);
    }
    // if multiple transitions, run the first one that has a condition that returns true.
    if (transitions.length > 1) {
      transitions.some(t => {
        const passed = t.condition.call(this, detail);
        if (passed) {
          // before running the transition, run it's effect
          if (t.effect) {
            // update data with return from effect
            this.data = t.effect.call(this, detail);
          }
          // run the first passing transition
          this.transitionTo_(this.getStateByName_(t.target));
        }
        return passed;// break out of loop if true, before testing more conditions
      });
    } else {
      // only one transition, check for condition first
      const transition = transitions[0];
      const targetState = this.getStateByName_(transition.target);

      // go for it, no condition
      if (!transition.condition) {
        if (transition.effect) {
          // update data with return from effect
          this.data = transition.effect.call(this, detail);
        }
        this.transitionTo_(targetState);
      } else if (transition.condition.call(this, detail)) {
        // if the transition does have a condition,
        // transitionTo_ if it returns true
        if (transition.effect) {
          this.data = transition.effect.call(this, detail);
        }
        this.transitionTo_(targetState);
      }
    }
  }

  transitionTo_(newState) {
    if (!newState) {
      console.error(`transitionTo_ called with no State`);
      return;
    }
    // call onExit if exists
    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit.call(this);
    }
    this.currentState = newState;
    // udpate state property
    this.state = newState.name;
    // call onEntry if it exists
    if (newState.onEntry) {
      newState.onEntry.call(this);
    }
    this.requestRender__();
  }

  getStateByName_(name) {
    return Object.values(this.constructor.machine.states).find(s => s.name === name) || null;
  }

};
