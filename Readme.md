TranSys - simple transition system middleware + enhancer for redux
==========

Usage:

```javascript
import { createStore } from 'redux'
import transys from 'transys'

/**
 *  States
 */
const INVALIDATED = 'INVALIDATED'
const FETCHING = 'FETCHING'
const OK = 'OK'
const states = [INVALIDATED, FETCHING, OK]

const initialState = {
    systemState: INVALIDATED,
    data: null
}

const transitionMatrix = [
    {
        from: INVALIDATED,
        to: FETCHING
    },
    {
        from: FETCHING,
        to: OK,
        do: (state = {}, { data }) => ({
            ...state,
            data
        })
    },
    {
        from: OK,
        to: INVALIDATED
    }
]

const store = createStore(
    transys.buildReducer({
        initialState,
        states,
        transitionMatrix
    })
)

console.log(store.getState().systemState)
// => 'INVALIDATED'

// When dispatching a FETCHING action while in INVALIDATED, the transition is
// applied:
store.dispatch({ type: FETCHING })
console.log(store.getState().systemState)
// => 'FETCHING'

// There is no transition from FETCHING to INVALIDATED:
store.dispatch({ type: INVALIDATED })
console.log(store.getState().systemState)
// => 'FETCHING'

store.dispatch({ type: OK })
console.log(store.getState().systemState)
// => 'OK'
```

You can combine the constructed reducer with your own reducer by using [[reduce-reducers][https://github.com/redux-utilities/reduce-reducers]]:

```javascript
import reduceReducers from 'reduce-reducers'

const store = createStore(
    reduceReducers(
        anotherReducer,
        yourReducer,
        transys.buildReducer({ ... }),
        initialState
    )
)
```

Why use this?
-----------

TranSys abstracts the inner workings of a transition system away.
It allows you to specify a number of possible states and transitions between
them, but takes over the responsibility to manage which state is currently
active.

Currently this is in no shape to be actually used.

Goals
-----

Implement already foreshadowed utility methods and action generators.

The action generators will provide (optionally async) basics for dispatching
state changes to the store using [[redux-thunk][https://github.com/reduxjs/redux-thunk]].

The utility methods will allow to subscribe to state changes based on some criteria.
