/* eslint no-unused-vars: off */

/**
 * This file show example usage of the transys store enhancer.
 */

import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import transys from './transys'

/*
 * STATES
 */
const OFF = Symbol('OFF')
const ON = Symbol('ON')

/**
 * This transitionMatrix shows the default implementations for everything.
 */
const transitionMatrix = [
  {
    from: OFF,
    to: ON,
    thunk: async ({ payload, dispatch, getState }) => {
      return dispatch()
    },
    do: (state, action) => { // action.type is guaranteed to be ON
      return state
    }
  },
  {
    from: ON,
    to: OFF,
    thunk: async ({ payload, dispatch, getState }) => {
      return dispatch()
    },
    do: (state, action) => { // action.type is guaranteed to be OFF
      return state
    }
  }
]

// this is the same as:
const alternativeTransitionMatrix = [
  { from: OFF, to: ON },
  { from: ON, to: OFF }
]

const store = createStore(
  transys.buildReducer({
    states: [OFF, ON],
    transitionMatrix,
    initialSystemState: OFF
  }),
  compose(
    transys.enhancer,
    applyMiddleware(thunk)
  )
)

store.subscribeToTransition({
  from: ON,
  to: OFF,
  // Will be called when the state changes from ON to OFF.
  callback: console.log
})

store.subscribeToTransition({
  to: ON,
  // Will be called when a transition from anywhere to ON occurs.
  callback: console.log
})

store.transitionTo(ON)
  .then(() => {
    // Transition complete.
    // Is also called, if there was no state change (i.e. the state before call
    // was already ON).
  })
  .catch(() => {
    // there is no transition available from the current state to the
    // requested state.
  })

// changes state to ON, but only if the current state is OFF. Resolven on
// state change, otherwise rejects.
store.transitionFromTo(OFF, ON)
  .then(() => {
    // state change from OFF to ON happened!
  })
  .catch(() => {
    // No state change happened. This might be because the state before the call
    // was not OFF or because no transition from OFF to ON exists.
  })

console.log(store.getState())
store.dispatch()
