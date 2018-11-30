import * as R from 'ramda'
import reduceReducers from 'reduce-reducers'

const buildReducer = ({
  states,
  transitionMatrix,
  initialState: {
    systemState,
    ...restState
  }
}) => {
  if (!Array.isArray(states)) {
    throw new Error('`states` must be an array of states.')
  }

  if (states === []) {
    throw new Error('At least one `state` must be provided.')
  }

  if (systemState === undefined) {
    throw new Error('`systemState` must be set.')
  }

  if (!states.includes(systemState)) {
    throw new Error('`states` must contain `systemState`.')
  }

  return reduceReducers(
    ...R.map(transition => (state, action) => {
      if ('do' in transition && typeof transition.do !== 'function') {
        throw new Error('transition.do must either be of type function or undefined')
      }

      /*
         * If a from/to is set, it must match the context for the reducer to be
         * applied.
         * If a from/to is not set, it is regarded as a wildcard.
         */
      if (
        (!states.includes(action.type)) ||
          ('from' in transition && transition.from !== state.systemState) ||
          ('to' in transition && transition.to !== action.type)
      ) {
        return state
      }

      const transitionedState = {
        ...state,
        systemState: action.type
      }

      if (!('do' in transition)) {
        return transitionedState
      }
      return transition.do(transitionedState, action)
    })(transitionMatrix),
    { systemState, ...restState }
  )
}

const enhancer = createStore => (...args) => {
  const store = createStore(...args)

  const transitionTo = () => {}
  const transitionFromTo = () => {}
  const subscribeToTransition = () => {}

  return {
    ...store,
    transitionTo,
    transitionFromTo,
    subscribeToTransition
  }
}

export default {
  buildReducer,
  enhancer
}

export {
  buildReducer,
  enhancer
}
