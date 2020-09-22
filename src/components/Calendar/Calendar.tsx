import React, { useEffect } from 'react';
import './Calendar.css';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../redux/store';
import { selectUserEventsArray, loadUserEvents, UserEvent } from '../../redux/user-events';
import { addZero } from '../../lib/utils';

const mapState = (state: RootState) => ({
  events: selectUserEventsArray(state)
});

const mapDispatch = {
  loadUserEvents
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends PropsFromRedux {}

const createDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  return `${year}-${addZero(month)}-${addZero(day)}`;
}

const addToGroup = (dateKey: string, event: UserEvent) => {
  if (groups[dateKey] === undefined) {
    groups[dateKey] = [];
  }

  groups[dateKey].push(event);
};

const groupEventsByDay = (events: UserEvent[]) => {
  const groups: Record<string, UserEvent[]> = {};

  events.forEach(event => {
    const dateStartKey = createDateKey(new Date(event.startDate));
    const dateEndKey = createDateKey(new Date(event.dateEnd));

    addToGroup(dateStartKey, event);

    if (dateEndKey !== dateStartKey) {
      addToGroup(dateEndKey, event);
    }
  });

  return groups;
};

const Calendar: React.FC<Props> = ({ events, loadUserEvents }) => {

  useEffect(() => {
    loadUserEvents();
  }, []);

  let groupedEvents: ReturnType<typeof groupEventsByDay> | undefined;
  let sortedGroupKeys: string[] | undefined;

  if(events.length) {
    groupedEvents = groupEventsByDay(events);
    sortedGroupKeys = Object.keys(groupedEvents).sort(
      (date1, date2) => +new Date(date1) - +new Date(date2)
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-day">
        <div className="calendar-day-label">
          <span>1 March</span>
        </div>
        <div className="calendar-events">
          <div className="calendar-event">
            <div className="calendar-event-info">
              <div className="calendar-event-time">10:00 - 12:00</div>
              <div className="calendar-event-title">Having brunch</div>
            </div>
            <button className="calendar-event-delete-button">&times;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connector(Calendar);
