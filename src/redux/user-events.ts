import { AnyAction, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState } from './store';

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventsState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const LOAD_REQUEST = 'userEvents/load_request';

interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}

const LOAD_SUCCESS = 'userEvents/load_success';

interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  }
}

const LOAD_FAILURE = 'userEvents/load_failure';

interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

export const loadUserEvents = (): ThunkAction<
  void,
  RootState,
  undefined,
  LoadRequestAction | LoadSuccessAction | LoadFailureAction
  > => async (dispatch, getState) => {
  dispatch({
    type: LOAD_REQUEST
  });

  try {
    const response = await fetch('http://localhost:3001/events');
    const events: UserEvent[] = await response.json();

    dispatch({
      type: LOAD_SUCCESS,
      payload: { events }
    })
  } catch(e) {
      dispatch({
        type: LOAD_FAILURE,
        error: "Failed to load the events."
      })
  }
};

export const selectUserEventsArray = (rootState: RootState) => {
  const state = rootState.userEvents;
  return state.allIds.map(id => state.byIds[id]);
};

const initialState: UserEventsState = {
  byIds: {},
  allIds: []
};

const userEventsReducer = (
  state: UserEventsState = initialState,
  action: LoadSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      const allIds = events.map(({ id }) => id);
      const byIds = events.reduce<UserEventsState['byIds']>((byIds, event) => {
        byIds[event.id] = event; return byIds; },  {})
      return {...state, allIds: allIds, byIds: byIds };
    default:
      return state;
  }
};

export default userEventsReducer;
