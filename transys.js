import * as R from 'ramda'
import reduceReducers from 'reduce-reducers'

/**
 * Construct a transition system reducer from a list of states, a transition
 * matrix and initial state.
 *
 * @param {Array<Symbol>} states The list of states between which the system
 *   should transition.
 *
 * @param {from?: Symbol, to?: Symbol, do?: Function} transitionMatrix The ele-
 *   ments in this matrix are used to construct the reducer rules. Each element
 *   can have
 *     - a `from` criterium, which is compared to the current state
 *     - a `to` criterium, which is compared with the type of the reduced action
 *     - a `do` function, which is executed, if the transition applies
 *   The state is changed if the action type is a valid state in the system and
 *   if a matching transition exists in the matrix.
 *
 * @param {Symbol} systemState The transition system's initial state.
 *
 * @return {Function} A reducer for use in a redux store.
 */
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

  if (states.length === 0) {
    throw new Error('At least one `state` must be provided.')
  }

  if (systemState === undefined) {
    throw new Error('`systemState` must be set.')
  }

  if (!states.includes(systemState)) {
    throw new Error('`states` must contain `systemState`.')
  }

  transitionMatrix.forEach(transition => {
    if ('do' in transition && typeof transition.do !== 'function') {
      throw new Error('transition.do must either be of type function or undefined')
    }
  })

  return reduceReducers(
    ...R.map(transition => (state, action) => {
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

/**
 * Provides a number of utility methods on the redux store.
 *
 * @param {Function} createStore Redux' store creator.
 */
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
