/*
 * TODO:
 * reflectToAttribute
 * get props from attributes
 */

import {html, render} from '../../node_modules/lit-html/lit-html.js';

export default class VComponent extends HTMLElement {

  constructor() {
    super();
    this.__data = {};
    this.currentState = null;
    this.initialState = null;
    this.state;
    // TODO:
    // deal with attributes (reflected and observed)
    // ...
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

  get data() {
    return this.__data;
  }

  // simple setter for all data
  set data(newData) {
    // TODO: does not currently deal with nested objects/arrays!
    // ...
    this.__data = Object.assign({}, newData);
    render(this.render(this.__data), this.shadowRoot)
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.initializeData_(this.constructor.properties);
  }

  initializeData_(properties) {
    // flatten properties
    this.data = Object.keys(properties).reduce((acc, k) => {
      acc[k] = properties[k].value;
      return acc;
    }, {});
  }

  initializeState_(initial) {
    this.transitionTo_(initial);
  }

  initializeProps_(properties) {
    // create getter/setter pairs for properties
    for(let key in properties) {
      Object.defineProperty(this, key, {
        // value: properties[key].value,
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
  }

  // override in sub classes
  render(data) {
    return html``;
  }

  send(eventName, detail = {}) {
    // TODO: first error can probably go away with Closure Compiler in play.
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
    // if (newState === this.currentState) {
    //   this._setState('');// trigger 'change' in polymer
    // }
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
