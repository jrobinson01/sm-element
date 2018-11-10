# SMElement

SMElement is an *experimental* base class for writing web components backed by a state machine.

# State machines

State machines have been around for a long time. They are incredibly powerful for UI programming and help prevent some nasty, hard to find bugs, as well as keeping your code quite simple and maintainable. For a good overview on state machines (statecharts) check out [statecharts.github.io](https://statecharts.github.io)

# Inspiration

SMElement is heavily inspired by [Polymer](https://www.polymer-project.org) and [LitElement](https://github.com/Polymer/lit-element), and uses [lit-html](https://github.com/Polymer/lit-html) for rendering.

# How it works

To use SMElement, you extend the SMElement class just like you would Polymer.Element or LitElement. You also define a static properties getter and a render function.

# Defining a machine

To define your machine, you define a static `machine` getter that returns your state machine object. The `machine` getter might look like so:
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
This is typically how you interact with your machine. You can call `send` at anytime, and if the machine's current state doesn't define a transition for the sent event, nothing horrible will happen and the event is simply ignored. This helps prevent hard to predict bugs like double-clicked buttons.

The event can also carry a payload if needed. This is useful for passing data between states.


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
By adding another state and a few actions and effects, we can start to make the machine more useful. We added the "initial" state. Picture this as the starting point of your component. This could comprise of a simple search form. When the form is submitted, an event is sent to the machine via `this.send('submit_search')`. This triggers the transition to the "loading" state. This new state has an `onEntry` action which kicks off an asynchronous "doSearch" operation. When that operation resolves or rejects, we call send again with the appropriate event. The machine then transitions to the appropriate state (success or error). States can also define an `onExit` action but that is not demonstrated here.

Notice that the transitions have a function labeled "effect". These effects should return any updates we want to make to the components data. Updates to the components data trigger a render call automatically. In this case, we return the results of the search operation on success, and any error messages if the request fails.

Now, suppose the search operation takes a long time, and during the "loading" state, there's a cancel button that when clicked, sends a "cancel_search" event. The loading state honors this event and transitions to the "initial" state. But what happens when that doSearch promise eventually resolves?

Nothing! The "initial" state doesn't care about the "load_success" or "load_error" events. The result is that the component's data is NOT changed, and no odd errors are shown to the user for an operation they bailed out of a long time ago.

...
TODO: more examples, explain isState usage inside render, etc.

_This readme is not complete, but you can check out at a complete [example element](https://github.com/jrobinson01/sm-element/blob/master/index.js)_

If you want to fiddle around with this project, check out the project, `npm install`, and then serve it with your web server of choice. I use [http-server](https://www.npmjs.com/package/http-server)

## API

- `render(data)` called with the current data, returns a TemplateResult
- `isState(currentState, desiredState)` returns true if the currentState matches the desiredState
- `send(eventName, detailObject)` send an event to the machine with an option detail object
