import { createStore } from 'redux'

import transys from '../transys'

describe('buildReducer', () => {
  describe('input parameters', () => {
    it('checks that `states` is an array', () => {
      expect(() => transys.buildReducer({
        initialState: {
          systemState: 'OK'
        },
        states: 'this should not be a string',
        transitionMatrix: []
      })).toThrow('`states` must be an array of states.')
    })

    it('checks that `states` is not an empty array', () => {
      expect(() => transys.buildReducer({
        initialState: {
          systemState: 'BLUB'
        },
        states: [],
        transitionMatrix: []
      })).toThrow('At least one `state` must be provided.')
    })

    it('checks that `systemState` is set', () => {
      expect(() => transys.buildReducer({
        initialState: {},
        states: ['OK'],
        transitionMatrix: []
      })).toThrow('`systemState` must be set.')
    })

    it('checks that `systemState` is contained in the list of states', () => {
      expect(() => transys.buildReducer({
        initialState: {
          systemState: 'OK'
        },
        states: ['NOT OK'],
        transitionMatrix: []
      })).toThrow('`states` must contain `systemState`.')
    })

    it('check that each transitions\'s do prop is either missing or a function', () => {
      const OK = Symbol('OK')
      expect(() => transys.buildReducer({
        initialState: {
          systemState: OK
        },
        states: [OK],
        transitionMatrix: [{
          do: 'this should be'
        }]
      })).toThrow('transition.do must either be of type function or undefined')
    })
  })

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
    expect(store.getState()).toEqual({
      systemState: OFF,
      text: offText
    })

    store.dispatch({ type: ON })
    expect(store.getState()).toEqual({
      systemState: ON,
      text: onText
    })
  })

  it('uses a default reducer that does nothing if no do prop is set', () => {
    const ON = Symbol('ON')
    const OFF = Symbol('OFF')
    const reducer = transys.buildReducer({
      initialState: {
        systemState: ON,
        onCounter: 0
      },
      states: [ON, OFF],
      transitionMatrix: [
        {
          to: ON,
          do: (state = {}, action) => ({
            ...state,
            onCounter: state.onCounter + 1
          })
        },
        {
          to: OFF
        }
      ]
    })

    const store = createStore(reducer)
    expect(store.getState()).toEqual({
      systemState: ON,
      onCounter: 0
    })

    store.dispatch({ type: OFF })
    expect(store.getState()).toEqual({
      systemState: OFF,
      onCounter: 0
    })

    store.dispatch({ type: ON })
    expect(store.getState()).toEqual({
      systemState: ON,
      onCounter: 1
    })

    store.dispatch({ type: ON })
    expect(store.getState()).toEqual({
      systemState: ON,
      onCounter: 2
    })

    store.dispatch({ type: OFF })
    expect(store.getState()).toEqual({
      systemState: OFF,
      onCounter: 2
    })

    store.dispatch({ type: ON })
    expect(store.getState()).toEqual({
      systemState: ON,
      onCounter: 3
    })
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
