/**
 * One locker door, drawn as a real panel: a dark recess behind a brushed-aluminium door with a
 * number plate, a handle and a status light. A holding door carries an orange parcel tag.
 */
export default function Locker({ door, style }) {
  const holding = door.state === 'holding';
  return (
    <div style={style} className={`locker size-${door.size} is-${door.state}`}>
      {/* the inside of the locker: what is drawn here sits behind the door and is cut to the opening*/}
      <span className="locker-recess" aria-hidden="true">
        {holding && <span className="locker-parcel" />}
      </span>
      <span className="locker-door" aria-hidden="true">
        <span className="locker-plate" >{door.no}</span>
        <span className="locker-handle" />
        <span className="locker-light" />
      </span>
    </div>
  );
}