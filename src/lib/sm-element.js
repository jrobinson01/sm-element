/*
 * TODO:
 * reflectToAttribute - convert property names (camelCase most likely) to dash-case
 * observed attributes (does lit handle this for us?)
 */

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
    this.currentState = null;
    this.initialState = null;
    this.state;
    this.states = this.constructor.machine.states;
    // initialze the machine
    this.initializeState_(this.getStateByName_(this.constructor.machine.initial));
    // setup property getter/setters
    this.initializeProps_(this.constructor.properties);
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
  // Should there be a separation between properties and data?
  // properties = things set from the outside
  // data = internal data passed to render
  // examples??
  // ...
  static get properties() {
    // returns the data structure (like polymer properties)
    return {};
  }

  static get observedAttributes() {
    // for now, everything is observed!
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

  get data() {
    return this.__data;
  }

  // setter for *all* data
  set data(newData) {
    // TODO: does not currently deal with nested objects/arrays!
    // ...
    // reflect any attributes that need to be reflected (reflect === true)
    // and dispatch any events (notify === true)
    // update internal state
    this.__data = Object.assign({}, this.__data, newData);
    for(let key in newData) {
      if (this.constructor.properties[key].reflect) {
        const attribute = serializeAttribute(newData[key]);
        if (attribute === null) {
          this.removeAttribute(key);
        } else {
          this.setAttribute(key, attribute);//TODO: currently triggering an additional render call due to attribute being observed!
        }
      }
      if (this.constructor.properties[key].notify) {
        this.dispatchEvent(new CustomEvent(`${key}-changed`, {
          composed: true,
          bubbles: false,
          detail: {
            value: newData[key]
          }
        }));
      }
    }

    // render! (this (or the whole of this setter?)*could/should* be debounced for performance reasons)
    // don't attempt to render unless we have a shadowRoot
    if (this.shadowRoot) {
      render(this.render(this.__data), this.shadowRoot);
    }

  }

  attributeChangedCallback(name, oldVal, newVal) {
    const propName = this.constructor.__propNamesAndAttributeNames.get(name);
    // only update property if it's different!
    const value = this.constructor.properties[propName]['type'](newVal);
    if (propName && value !== this[propName]) {
      this[propName] = value;
    }
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.initializeData_(this.constructor.properties);
  }

  initializeData_(properties) {
    // flatten properties and assign

    this.data = Object.keys(properties).reduce((acc, k) => {
      // this happens AFTER props may have been set by attributes so use local prop if exists
      acc[k] = this[k] === undefined ? properties[k].value : this[k];
      return acc;
    }, {});
  }

  initializeState_(initial) {
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

  isState(current={}, desired={}) {
    return current.name === desired.name;
  }

  // override in sub classes
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
          // run the first passing transition
          // before running, run the transition's effect
          if (t.effect) {
            // update data with return from effect
            this.data = t.effect.call(this, detail);
          }
          this.transitionTo_(this.getStateByName_(t.target));
        }
        return passed;// break out of loop if true, before testing more conditions
      });
    } else {
      // only one transition, check for condition first
      const transition = transitions[0];
      const targetState = this.getStateByName_(transition.target);

      // go for it if no condition
      if (!transition.condition) {
        if (transition.effect) {
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
    // "state" property is readonly, use special polymer method to set
    this.state = newState.name;
    // call onEntry if it exists
    if (newState.onEntry) {
      newState.onEntry.call(this);
    }
  }

  getStateByName_(name) {
    return Object.values(this.constructor.machine.states).find(s => s.name === name) || null;
  }

};