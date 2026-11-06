import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Locker from '../components/Locker.jsx';
import { BUILDING } from '../data/building.js';
import { PERSONAS } from '../data/personas.js';
import { useGet } from '../hooks/useLoad.js';

function Avatar({ persona, size = 34 }) {
  return (
    <span
      className="avatar"
      style={{
        '--avatar': persona.color,
        width: size,
        height: size,
        fontSize: size * 0.42
      }}
    >
      {persona.name.replace('Mrs ', '')[0]}
    </span>
  );
}

/** The first screen: what LockerLine is, a slice of the real wall, and who you want to be. */

export default function Welcome() {
  const answer = useGet('/towers/A/doors');
  const doors = answer?.status === 200 ? answer.body.doors : [];
  const free = doors.filter((d) => d.state === 'free').length;

  // A slice of the real wall for the hero.
  const preview = [...doors.slice(0, 9), ...doors.slice(40, 44)];

  return (
    <div className="welcome">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            {BUILDING.name} · Tower {BUILDING.tower} parcel room
          </p>

          <h1 className="hero-title">
            Forty-eight lockers.<br />
            <span>No notebook.</span>
          </h1>

          <p className="hero-lede">
            Couriers get a locker in seconds, residents open it with a code that runs out, and the
            caretaker can see every locker, and every parcel's story, at a glance.
          </p>

          <div className="hero-facts">
            <div>
              <strong>{doors.length}</strong>
              <span>lockers</span>
            </div>
            <div>
              <strong className="is-free">{free}</strong>
              <span>free right now</span>
            </div>
            <div>
              <strong>{doors.length - free}</strong>
              <span>holding parcels</span>
            </div>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-bank">
            <div className="hero-bank-small">
              {preview.slice(0, 9).map((d, i) => (
                <Locker key={d.no} door={d} style={{ '--i': i }} />
              ))}
            </div>

            <div className="hero-bank-large">
              {preview.slice(9).map((d, i) => (
                <Locker key={d.no} door={d} style={{ '--i': i + 9 }} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="pick" aria-labelledby="pick-title">
        <div className="pick-head">

          <h2 id="pick-title" className="section-title">
            Who are you today?
          </h2>

          <p className="section-sub">
            Each person sees their own screens. Everything they do changes the same wall.
          </p>
        </div>
        <div className="pick-grid">
          {PERSONAS.map((p, i) => (
            <Link
              key={p.id}
              to={p.nav[0].to}
              className="pick-card"
              style={{ '--persona': p.color, '--i': i }}
            >
              <Avatar persona={p} size={44} />

              <span className="pick-name">{p.name}</span>

              <span className="pick-role">{p.role}</span>

              <span className="pick-blurb">{p.blurb}</span>

              <span className="pick-go">
                Continue as {p.name} <Icon name="arrow" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
