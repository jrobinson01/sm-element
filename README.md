# SMElement

SMElement is an *experimental* base class for writing web components backed by a state machine.

# State machines

State machines have been around for a long time. They are incredibly powerful for UI programming and help prevent some nasty, hard to find bugs, as well as keeping your code quite simple and maintainable. For a good overview on state machines (statecharts) check out [statecharts.github.io](https://statecharts.github.io)

# Inspiration

SMElement is heavily inspired by [Polymer](https://www.polymer-project.org) and [LitElement](https://github.com/Polymer/lit-element), and uses [lit-html](https://github.com/Polymer/lit-html) for rendering.

# How it works

You extend the SMElement class just like you would Polymer.Element or LitElement.

# Defining a machine

You also need to define a static `machine` getter that returns your state machine object. The `machine` getter might look like so:
```js
static get machine() {
  return {
    initial: 'loading',
    states: {
      loading: {
        name: 'loading',
        transitions: [
          {
            event: 'load_success',
            target: 'results'
          },
          {
            event: 'load_error',
            target: 'error'
          }
        ]
      },
      results: {
        name: 'results',
        transitions: [
          {
            event: 'start_over',
            target: 'loading'
          }
        ]
      },
      error: {
        name: 'error',
        transitions: [
          {
            event: 'try_again',
            target: 'loading'
          }
        ]
      },
    }
  };
}
```
This particular machine starts in the "loading", state. When the machine receives the event "load_success", it transitions to the "results" state immediately. If it had received the "load_error" event instead, it would have transitioned to the "error" state.

## Events
Events in SMElement are NOT tranditional DOM events. They're simply strings sent to the machine. You can trigger events by calling the `send` instance method. An example:

```js
this.send('load_results');
```
This is typically how you interact with your machine. You can call `send` at anytime, and if the machine's current state doesn't define a transition for the sent event, nothing horrible will happen and the event is simply ignored. This helps prevent hard to predict bugs like double-clicked buttons, or error messages shown on the wrong screen.

The event can also carry a payload if needed. This is useful for passing data between states. TODO: The next example shows this. explain yo'self

## Actions and effects
Each state can define some hooks that run when the state is entered or exited. Since the above machine is pretty boring on it's own, Let's add a new state and then some hooks to the existing states to make it more interesting.

```js
static get machine() {
  return {
    initial: 'initial',
    states: {
      initial: {
        name: 'initial',
        transitions: [
          {
            event: 'submit_search',
            target: 'loading',
          }
        ]
      },
      loading: {
        name: 'loading',
        onEntry: function() {
          this.doSearch(this.searchInput)
          .then(result => {
            this.send('load_success', {result});
          })
          .catch(error => {
            this.send('load_error', {error});
          })
        },
        transitions: [
          {
            event: 'load_success',
            target: 'results',
            effect: function(detail) {
              return detail;
            }
          },
          {
            event: 'load_error',
            target: 'error',
            effect: function(error) {
              return {errorMessage: error.message};
            }
          },
          {
            event: 'cancel_search',
            target: 'initial'
          },
        ]
      },
      results: {
        name: 'results',
        transitions: [
          {
            event: 'start_over',
            target: 'initial'
          }
        ]
      },
      error: {
        name: 'error',
        transitions: [
          {
            event: 'try_again',
            target: 'loading'
          }
        ]
      },
    }
  };
}
```
By adding another state and a few actions and effects, we can start to make the machine more useful. We added the "initial" state. Picture this as the starting point of your component. This could comprise of a simple search form. When the form is submitted, an event is sent to the machine via `this.send('submit_search')`. This triggers the transition to the "loading" state.

This new state has an `onEntry` action which kicks off an asynchronous "doSearch" operation when the state is entered (onEntry is called in the scope of your component instance, so cannot be an arrow function). When that operation resolves or rejects, we call send again with the appropriate event. The machine then transitions to the appropriate state (success or error). Notice the event is sent with the results of the operation (search results, or an error) which is simply returned by the effect function for the transition, causing an update to the components data.

States can also define an `onExit` action but that is not demonstrated here.

Notice that the transitions have a function labeled "effect". These effects should return any updates we want to make to the components data. Updating the component's data triggers a render call automatically. In this case, we return the results of the search operation on success, and any error messages if the request fails.

Now, suppose the search operation takes a long time, and during the "loading" state, there's a cancel button that when clicked, sends a "cancel_search" event. The loading state honors this event and transitions to the "initial" state. But what happens when that doSearch promise eventually resolves?

Nothing! The "initial" state doesn't care about the "load_success" or "load_error" events. The result is that the component's data is NOT changed, and no odd errors are shown to the user for an operation they bailed out of a long time ago.

## Conditions
Transitions can also provide a condition function. If provided, this function will be run when the machine receives an event is handles. The transition will only continue if this function returns true. This is useful when you want to handle the same event different ways. For example, in the fictitious search component above, if the search results came back empty, you might want to move to an "empty_list" state instead of the "results" state. If multiple transitions are defined with the same event, they must all provide a condition (this may change in future versions). The first transition who's condition returns true will be taken.


## Rendering
Your render function will be called any time the component's data changes. This is quite similar to how Polymer.Element and LitElement components work. Your render function will also be called any time there's a state transition, but will only be called once if both happen in the same frame. Each individual state can also optionally provide it's own `render` function. The component's `currentStateRender` function will point to the current state's render function for use in your main render function. This is essentially a short-hand alternative to use `isState(...)` and a conditional inside your main render function. In fact, the default render function in the super class will render your state's ui automatically if you don't provide a render function in your subclass.



## Getting started
If you want to get started using SMElement in your own project, install the module `npm install --save sm-element` and import it `import SMElement from 'sm-element/sm-element'`

If you want to fiddle around with THIS project, fork it, `npm install`, and then serve it with `polymer serve`.

## API

- `render(data)` called with the current `data`, returns a lit-html `TemplateResult`
- `isState(currentState, desiredState)` returns true if `currentState` matches `desiredState`
- `oneOfState(currentState, ...desiredStates)` returns true if the `currentState` matches one of the `desiredStates`
- `send(eventName, detailObject)` send an event to the machine with an optional `detail` object
- `currentStateRender(data)` a reference to the current state's `render` function. This can be used to render specific UI for the current state.
- `createRenderRoot()` override to set a customer render target. Defaults to creating a shadowRoot
- `renderNow(data)` forces an immediate render

### Examples
[traffic light](https://github.com/jrobinson01/sm-element/blob/master/examples/traffic-light/traffic-light.js)
[blog application](https://github.com/jrobinson01/sm-element-example)
