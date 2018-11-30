import { createStore } from 'redux'

import transys from '../transys'

describe('buildReducer', () => {
  it('returns a reducer that does nothing when one state and an empty matrix is supplied', () => {
    const OK = Symbol('OK')
    const reducer = transys.buildReducer({
      states: [OK],
      transitionMatrix: [],
      initialState: {
        systemState: OK
      }
    })
    const store = createStore(reducer)
    expect(store.getState()).toEqual({
      systemState: OK
    })
  })

  it('builds the correct reducer for a simple ON/OFF system', () => {
    const onText = 'ON NOW WHOO'
    const offText = 'SWITCHED FROM ON TO OFF'
    const ON = Symbol('ON')
    const OFF = Symbol('OFF')
    const reducer = transys.buildReducer({
      initialState: {
        systemState: ON,
        text: onText
      },
      states: [ON, OFF],
      transitionMatrix: [
        {
          to: ON,
          do: (state = {}, action) => ({
            ...state,
            text: onText
          })
        },
        {
          from: ON,
          to: OFF,
          do: (state = {}, action) => ({
            ...state,
            text: offText
          })
        }
      ]
    })

    const store = createStore(reducer)
    expect(store.getState()).toEqual({
      systemState: ON,
      text: onText
    })

    store.dispatch({ type: OFF })
  })
})

describe('enhancer', () => {
  it('returns a store creator that appends all needed methods to the store', () => {
    const store = createStore(
      (state, action) => state,
      transys.enhancer
    )

    expect(typeof store.dispatch).toEqual('function')
    expect(typeof store.transitionTo).toEqual('function')
    expect(typeof store.transitionFromTo).toEqual('function')
    expect(typeof store.subscribeToTransition).toEqual('function')
  })
})
