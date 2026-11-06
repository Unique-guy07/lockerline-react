import { screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { openApp } from './app.jsx';
import { doorsFrom, drop, person } from './given.js';
import { reading } from './look.js';

describe('F-01 · The front door', () => {
  test('the home page names the parcel room and says what LockerLine is', async () => {
    await openApp('/');
    expect(screen.getByText('Sunrise Heights · Tower A parcel room')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(within(heading).getByText('Forty-eight lockers.')).toBeInTheDocument();
    expect(within(heading).getByText('No notebook.')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Couriers get a locker in seconds, residents open it with a code that runs out, and the caretaker can see every locker, and every parcel's story, at a glance.",
      ),
    ).toBeInTheDocument();
  });

  test('on an empty wall the counts read 48 lockers, 48 free right now and 0 holding parcels', async () => {
    await openApp('/');
    expect(await screen.findByText(reading('48', 'free right now'))).toBeInTheDocument();
    expect(screen.getByText(reading('48', 'lockers'))).toBeInTheDocument();
    expect(screen.getByText(reading('0', 'holding parcels'))).toBeInTheDocument();
  });

  test('with parcels in D01 and D21 the counts read 48 lockers, 46 free right now and 2 holding parcels', async () => {
    await openApp('/', {
      before: async (api) => {
        await drop(api, 'S', '302');
        await drop(api, 'M', '304');
      },
    });
    expect(await screen.findByText(reading('46', 'free right now'))).toBeInTheDocument();
    expect(screen.getByText(reading('48', 'lockers'))).toBeInTheDocument();
    expect(screen.getByText(reading('2', 'holding parcels'))).toBeInTheDocument();
  });

  test('the picture shows the small doors D01 to D09 and the large doors D41 to D44, and nothing else', async () => {
    await openApp('/');
    await screen.findByText('D01');
    for (const no of [...doorsFrom('D01', 'D09'), ...doorsFrom('D41', 'D44')]) {
      expect(screen.getByText(no)).toBeInTheDocument();
    }
    expect(screen.getAllByText(/^D\d\d$/)).toHaveLength(13);
    expect(screen.queryByText('D21')).not.toBeInTheDocument();
  });

  test('the picture is only a picture: clicking a door does nothing', async () => {
    const { address } = await openApp('/');
    const user = person();
    await user.click(await screen.findByText('D01'));
    await user.click(screen.getByText('D41'));
    expect(address()).toBe('/');
    expect(screen.getByText('Who are you today?')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('before the wall answers the counts show 0 and the picture has no doors, then both fill in', async () => {
    await openApp('/');
    expect(screen.getByText(reading('0', 'lockers'))).toBeInTheDocument();
    expect(screen.getByText(reading('0', 'free right now'))).toBeInTheDocument();
    expect(screen.queryByText('D01')).not.toBeInTheDocument();
    expect(await screen.findByText(reading('48', 'lockers'))).toBeInTheDocument();
    expect(screen.getByText(reading('48', 'free right now'))).toBeInTheDocument();
    expect(screen.getByText('D01')).toBeInTheDocument();
  });

  test('under "Who are you today?" there is one card each for Farida, Imran and Mrs Rao', async () => {
    await openApp('/');
    expect(screen.getByText('Who are you today?')).toBeInTheDocument();
    expect(screen.getByText('Each person sees their own screens. Everything they do changes the same wall.')).toBeInTheDocument();
    const cards = [
      ['Farida', 'Caretaker', 'Runs the parcel room. Sees every locker, every parcel and the rules the wall follows.'],
      ['Imran', 'Courier', 'Arrives with a bag of parcels. Asks for a locker by size and flat, and gets one.'],
      ['Mrs Rao', 'Resident', 'Gets a code when a parcel arrives. Keys it in at the lobby and the locker opens.'],
    ];
    for (const [name, role, line] of cards) {
      const card = screen.getByRole('link', { name: new RegExp(`Continue as ${name}`) });
      expect(within(card).getByText(name)).toBeInTheDocument();
      expect(within(card).getByText(role)).toBeInTheDocument();
      expect(within(card).getByText(line)).toBeInTheDocument();
      expect(within(card).getByText(`Continue as ${name}`)).toBeInTheDocument();
    }
  });

  test("clicking Farida's card goes to /caretaker/wall", async () => {
    const { address } = await openApp('/');
    await person().click(screen.getByRole('link', { name: /Continue as Farida/ }));
    expect(address()).toBe('/caretaker/wall');
  });

  test("clicking Imran's card goes to /courier", async () => {
    const { address } = await openApp('/');
    await person().click(screen.getByRole('link', { name: /Continue as Imran/ }));
    expect(address()).toBe('/courier');
  });

  test("clicking Mrs Rao's card goes to /resident", async () => {
    const { address } = await openApp('/');
    await person().click(screen.getByRole('link', { name: /Continue as Mrs Rao/ }));
    expect(address()).toBe('/resident');
  });
});
