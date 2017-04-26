import {State} from '../reducers';

export function getInitialState(): State {
  return <State> {
    jobs: {},
    clusters: {},
    policies: {},
    pairings: {}
  };
}

export function changeState(state: State, part = {}): State {
  return Object.assign({}, state, part);
}
