import { DEMO_USER_ID } from './users';

/**
 * Seed conversations for the demo account. `hoursAgo` on each message is
 * converted into real timestamps when seeded. `unreadFor` marks which
 * participant has not read the latest message yet.
 */
export const SEED_CONVERSATIONS = [
  {
    id: 'c-sofa',
    listingId: 'l-cognac-sofa',
    buyerId: DEMO_USER_ID,
    sellerId: 'u-olena',
    unreadFor: DEMO_USER_ID,
    messages: [
      { from: DEMO_USER_ID, hoursAgo: 26, text: 'Hi Olena! Is the leather sofa still available?' },
      { from: 'u-olena', hoursAgo: 25.5, text: 'Hi Taras! Yes, it is. Would you like to come and see it?' },
      { from: DEMO_USER_ID, hoursAgo: 25, text: 'Yes please. Could I come on Saturday around noon? And is the delivery price fixed?' },
      { from: 'u-olena', hoursAgo: 3, text: 'Saturday at 12:00 works. Delivery within Lviv is 600 ₴, including carrying it upstairs.' },
      { from: 'u-olena', hoursAgo: 2.9, text: 'The address is Kniazia Romana 14 — call me when you arrive 🙂' },
    ],
  },
  {
    id: 'c-bmw',
    listingId: 'l-bmw-m4',
    buyerId: DEMO_USER_ID,
    sellerId: 'u-andrii',
    messages: [
      { from: DEMO_USER_ID, hoursAgo: 50, text: 'Good afternoon! Was the car ever repainted? Any paint thickness readings?' },
      { from: 'u-andrii', hoursAgo: 48, text: 'Hello! Original paint everywhere except the front bumper (stone chips). I can send the readings.' },
      { from: DEMO_USER_ID, hoursAgo: 47, text: 'That would be great, thank you. Is a check at the official service possible?' },
      { from: 'u-andrii', hoursAgo: 46, text: 'Of course, any day this week. Just tell me what suits you.' },
    ],
  },
  {
    id: 'c-macbook',
    listingId: 'l-macbook-pro-m1',
    buyerId: 'u-dmytro',
    sellerId: DEMO_USER_ID,
    unreadFor: DEMO_USER_ID,
    messages: [
      { from: 'u-dmytro', hoursAgo: 8, text: 'Hi! Would you take 30,000 for the MacBook?' },
      { from: DEMO_USER_ID, hoursAgo: 7.5, text: 'Hi Dmytro. I can do 31,000 if you pick it up this week.' },
      { from: 'u-dmytro', hoursAgo: 1.2, text: 'Deal. Can I come tomorrow evening? I will message when I am on the way.' },
    ],
  },
  {
    id: 'c-fixie',
    listingId: 'l-fixie',
    buyerId: 'u-kateryna',
    sellerId: DEMO_USER_ID,
    unreadFor: DEMO_USER_ID,
    messages: [{ from: 'u-kateryna', hoursAgo: 0.6, text: 'Hello! What is the frame size of the bike? I am 168 cm tall.' }],
  },
];
