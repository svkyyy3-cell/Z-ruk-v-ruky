/**
 * Content for the static information pages linked from the footer.
 * Each page: title, lead, sections[{ heading, body[] }], optional faq[].
 */
export const INFO_PAGES = {
  about: {
    title: 'About Zruky',
    lead: 'Zruky means “from hands” — we help good things move from one pair of hands to the next.',
    sections: [
      {
        heading: 'Why we exist',
        body: [
          'Every home is full of things that someone else is looking for right now. Zruky makes it effortless to find each other — whether it is a phone, a flat, a puppy or a plumber.',
          'We believe a marketplace should feel calm and trustworthy: clear listings, honest prices, real people and no commissions.',
        ],
      },
      {
        heading: 'What makes us different',
        body: [
          'Posting is free and unlimited. Chat is built in, so you never have to share your number until you are ready. Sellers are rated by real buyers, and verified badges show who has confirmed their identity.',
        ],
      },
      {
        heading: 'Contact',
        body: ['Questions, ideas or press requests: help@zruky.app. We answer within one working day.'],
      },
    ],
  },
  help: {
    title: 'Help centre',
    lead: 'Answers to the questions people ask us most often.',
    faq: [
      {
        q: 'How do I post an ad?',
        a: 'Tap “Post an ad”, add a clear title, choose a category, upload photos, set a price and pick your city. Your listing goes live as soon as you publish it.',
      },
      {
        q: 'Is it really free?',
        a: 'Yes. Posting, browsing and messaging are free. We never take a commission from your sale.',
      },
      {
        q: 'How do I edit or remove my listing?',
        a: 'Open My listings in your account. Every listing has Edit, Mark as sold and Delete actions. You can also manage it from the listing page itself.',
      },
      {
        q: 'What happens when I mark something as sold?',
        a: 'It stays visible with a “Sold” label so buyers in the middle of a conversation know what happened, but it no longer appears in search. You can relist it at any time.',
      },
      {
        q: 'Why do I need an account to message sellers?',
        a: 'Accounts keep conversations in one place and protect both sides from spam. Browsing and saving favorites work without an account.',
      },
      {
        q: 'Where is my data stored?',
        a: 'In this version, your account, listings, favorites and messages are stored securely in your browser on this device.',
      },
    ],
    sections: [
      {
        heading: 'Still need help?',
        body: ['Write to help@zruky.app or call +380 44 000 12 34 on weekdays, 9:00–19:00.'],
      },
    ],
  },
  safety: {
    title: 'Safety tips',
    lead: 'Most deals go smoothly. These habits keep it that way.',
    sections: [
      {
        heading: 'For buyers',
        body: [
          'Never pay in advance for something you have not seen, and never share card details, CVV codes or SMS codes — no legitimate seller needs them.',
          'Meet in a busy public place during the day. For expensive items, bring a friend and check everything works before you pay.',
          'Be careful with prices that are far below market value and with sellers who push you to decide quickly.',
        ],
      },
      {
        heading: 'For sellers',
        body: [
          'Do not follow links sent by “buyers” to receive money — these are a common phishing trick.',
          'Hand over the item only after you have received the full payment.',
          'Keep the conversation in Zruky chat so there is a record if something goes wrong.',
        ],
      },
      {
        heading: 'Report a problem',
        body: ['If something feels wrong, stop the conversation and email help@zruky.app with a link to the listing.'],
      },
    ],
  },
  rules: {
    title: 'Posting rules',
    lead: 'Simple rules that keep the marketplace useful for everyone.',
    sections: [
      {
        heading: 'Listings must be real',
        body: [
          'Post only items and services you can actually provide, at the price you will actually accept. One item per listing, posted in the right category.',
          'Use your own photos. Stock images and photos with watermarks from other websites are removed.',
        ],
      },
      {
        heading: 'Not allowed',
        body: [
          'Weapons, drugs, counterfeit goods, stolen items, documents, personal data, and anything illegal in Ukraine.',
          'Listings that mislead buyers, contain offensive language or advertise other marketplaces.',
        ],
      },
    ],
  },
  business: {
    title: 'Zruky for business',
    lead: 'Shops, agencies and service providers reach thousands of local customers every day.',
    sections: [
      {
        heading: 'Business profile',
        body: [
          'Show your brand, response time and ratings on every listing. Verified businesses get a badge and appear more prominently in their categories.',
        ],
      },
      {
        heading: 'Hiring on Zruky',
        body: ['Post vacancies in Jobs and receive applications straight into your chat inbox — no separate tools required.'],
      },
      {
        heading: 'Get in touch',
        body: ['Email business@zruky.app and tell us about your company. We will reply within one working day.'],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    lead: 'The short version: be honest, be kind, and follow the law.',
    sections: [
      {
        heading: '1. Using Zruky',
        body: [
          'By creating an account you confirm you are at least 16 years old and that the information you provide is accurate. You are responsible for activity on your account.',
        ],
      },
      {
        heading: '2. Your content',
        body: [
          'You keep ownership of the listings and photos you publish and grant Zruky permission to display them on the platform. Do not post content you do not have rights to.',
        ],
      },
      {
        heading: '3. Deals between users',
        body: [
          'Zruky is a meeting place. Contracts are made directly between buyers and sellers, who are responsible for the items, payment and delivery.',
        ],
      },
      {
        heading: '4. Removing content',
        body: ['We may remove listings or suspend accounts that break these terms or the posting rules.'],
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    lead: 'We collect as little as possible and never sell your data.',
    sections: [
      {
        heading: 'What we store',
        body: [
          'Your name, email, optional phone number and city; the listings you publish; your favorites; and your conversations with other users.',
          'In this version, all of this is stored locally in your browser and is never sent to a server.',
        ],
      },
      {
        heading: 'Who can see it',
        body: [
          'Your name, city, rating and listings are public. Your phone number is shown only when a buyer taps “Show phone number”. Your email is never shown to other users.',
        ],
      },
      {
        heading: 'Your choices',
        body: ['You can edit your profile at any time in Settings, and clearing your browser storage removes all local data.'],
      },
    ],
  },
};
