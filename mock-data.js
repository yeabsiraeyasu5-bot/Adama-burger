/* =========================================================
   data/mock-data.js  —  ALL demo content lives here.

   The UI never reads this file directly. It only reaches the
   app through the service layer (`Api` in index.html), so the
   day you have a real database you can:

     1. set CONFIG.api.mode = 'remote' in index.html, and
     2. make each endpoint below return the same JSON shape.

   You can then delete this file. Nothing in the UI changes.

   ---------------------------------------------------------
   Data  ->  endpoint  ->  suggested Supabase / SQL table
   ---------------------------------------------------------
   restaurant         GET  /restaurant           restaurants (1 row)
   heroSlides         GET  /hero-slides          hero_slides
   categories         GET  /categories           categories
   products           GET  /products             products
                      GET  /products/:id
   reviews            GET  /reviews              reviews
                      POST /reviews              (+ summary = avg/count)
   delivery           GET  /delivery-settings    delivery_settings (1 row; fee, fastSurcharge, ETAs, areas)
   payment            GET  /payment-settings     payment_settings (1 row; Telebirr account, on/off)
   paymentProofs      POST /uploads/payment-proof Supabase Storage bucket 'payment-proofs' (private).
                                                 Save the returned path on the order, never the file itself.
   aboutPage          GET  /pages/about          about_page (1 row) + team_members, milestones
   contactPage        GET  /pages/contact       contact_page (1 row) + contact_departments, faqs
   contactMessages    POST /contact-messages     contact_messages (staff read them in the admin portal)
   branches           GET  /branches             branches (1 row per location, weekly hours inside)
   orders             GET  /orders               orders + order_items
                      POST /orders               (server re-prices items AND recalculates the delivery fee)
                      PATCH /admin/orders/:id    status (received | preparing | on_the_way | delivered)
                      PATCH /admin/orders/:id/payment   payment.status (admin approves/rejects Telebirr)
     Suggested orders columns: customer_name, customer_phone, address, notes, lat, lng,
     delivery_option ('normal'|'fast'), delivery_fee, subtotal, total, payment_method ('cod'|'telebirr'),
     payment_status, payment_proof_path, payment_reviewed_at. Enforce admin-only writes with RLS.
   profile            GET  /me                   profiles
   auth               /auth/login, /register,    Supabase Auth
                      /logout, /session

   Conventions
   - Text that needs translating is an object: { en, am, om }.
     Store it in a jsonb column (or a translations table).
   - Prices are whole numbers in the restaurant currency (ETB).
   - Images are plain URLs (`imageUrl`). In production, upload
     photos to Supabase Storage and save the public URL here.
     Every product carries its own `imageUrl`. The UI reads only
     that field (cards, product detail, cart), so changing it in
     the data/admin changes it everywhere. Empty or broken URLs
     fall back to the category icon.

   ---------------------------------------------------------
   ADDING A PRODUCT (no frontend changes needed)
   ---------------------------------------------------------
   Append one object to `products`. Required: id (unique),
   categoryId (matches a category id), name, price.
   Optional: imageUrl, description, tag, rating, reviewCount,
   prepMinutes, featured, isAvailable.
     { id: 'p-cola', categoryId: 'drinks', price: 45,
       imageUrl: 'https://.../cola.jpg',
       name: { en: 'Cola' }, description: { en: 'Ice cold.' } }
   ADDING A CATEGORY: append to `categories`; products with that
   categoryId then get their own tab. `icon` is optional
   (unknown or missing icons show the utensils icon).
   - Dates are ISO 8601 strings.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     Photos. One place to swap any picture on the site.
     Demo photos come from Unsplash (free to use). Replace a value
     with your own photo URL, or a local file such as
     'images/classic-burger.jpg'. A `null` shows a clean icon
     placeholder until a real photo is added.
     --------------------------------------------------------- */
  const U = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

  const IMAGES = {
    burgerClassic: U('photo-1568901346375-23c9450c58cd'),
    burgerDouble:  U('photo-1571091718767-18b5b1457add'),
    burgerChicken: U('photo-1606755962773-d324e0a13086'),
    burgerSpicy:   U('photo-1551782450-a2132b4ba21d'),
    pizzaMargherita: U('photo-1574071318508-1cdbab80d002'),
    pizzaPepperoni:  U('photo-1604382354936-07c5d9983bd3'),
    pizzaBbq:        U('photo-1513104890138-7c749659a591'),
    pizzaVeggie:     U('photo-1565299624946-b28f40a0ae38'),
    fries:         U('photo-1573080496219-bb080dd4f877'),
    burgerAndFries: U('photo-1550547660-d9450f859349'),

    // Drinks and sides. Every product now has a real photo.
    // Stand-ins (swap by editing the product's `imageUrl`, nothing else):
    //   mangoJuice  = orange-yellow juice photo   (no free mango-juice photo found)
    //   softDrink   = cola-style glass photo
    //   onionRings  = fried sides photo           (no free onion-rings photo found)
    onionRings: U('photo-1550547660-d9450f859349'),
    mangoJuice: U('photo-1605127933867-a9a96b2b4782'),
    lemonade:   U('photo-1602539843931-35fe0f4d7051'),
    softDrink:  U('photo-1560831503-c9217b8e0e43'),

    // About page. Stand-ins until you have your own photos of the kitchen, dining room and team.
    // If one of these ever fails to load, the page shows a clean icon placeholder instead.
    diningRoom: U('photo-1517248135467-4c7edcad34c4'),
    kitchen:    U('photo-1556910103-1c02745aae4d'),
    tableSpread: U('photo-1414235077428-338989a2e8c0'),
  };

  window.ADAMA_MOCK = {

    /* ---------- restaurant (single record) ---------- */
    restaurant: {
      name: 'Adama Burger & Pizza',
      tagline: { en: 'Fresh. Fast. Fired up.' },
      currency: 'ETB',
      phone: '+251 911 000 000',
      email: 'hello@adamaburgerpizza.example',
      address: { en: 'Franco Road, Adama, Oromia, Ethiopia' },
      coordinates: { lat: 8.5414, lng: 39.2689 },
      hours: {
        open: '08:00',
        close: '22:00',
        label: { en: 'Every day, 08:00 to 22:00' }
      },
      ctaImageUrl: IMAGES.pizzaPepperoni,
      social: [],
      highlights: [
        {
          icon: 'flame',
          title: { en: 'Grilled to order' },
          text: {
            en: 'Every burger hits the grill when you order, so it reaches you juicy and hot.'
          }
        },
        {
          icon: 'leaf',
          title: { en: 'Fresh ingredients' },
          text: {
            en: 'Vegetables and bread come in daily. Our dough is made in house each morning.'
          }
        },
        {
          icon: 'clock',
          title: { en: 'Quick delivery' },
          text: {
            en: 'Riders cover all of Adama, and most orders arrive in under 40 minutes.'
          }
        },
      ],
    },

    /* ---------- home page carousel ----------
       theme: 'orange' | 'cream' | 'light'
       images: [main photo, small photo, small photo]            */
    heroSlides: [
      {
        id: 's1',
        theme: 'orange',
        images: [
          IMAGES.burgerClassic,
          IMAGES.fries,
          IMAGES.burgerSpicy
        ],
        badge: { en: 'Bestseller' },
        title: { en: 'Big flavour, delivered hot.' },
        text: {
          en: 'Juicy beef burgers with all the toppings, straight to your door in Adama.'
        },
        cta: { label: { en: 'Order now' }, href: '#/menu' }
      },

      {
        id: 's2',
        theme: 'cream',
        images: [
          IMAGES.pizzaBbq,
          IMAGES.pizzaPepperoni,
          IMAGES.pizzaVeggie
        ],
        badge: { en: 'Stone-baked' },
        title: { en: 'Pizza night, every night.' },
        text: {
          en: 'Thin, crisp crusts and generous toppings. Pepperoni, BBQ chicken and more.'
        },
        cta: { label: { en: 'Explore pizzas' }, href: '#/menu' }
      },

      {
        id: 's3',
        theme: 'light',
        images: [
          IMAGES.burgerAndFries,
          IMAGES.fries,
          IMAGES.burgerDouble
        ],
        badge: { en: 'Combo deal' },
        title: { en: 'Burger, fries and a drink for ETB 299.' },
        text: {
          en: 'The easiest lunch in town. Available every day until 4 pm.'
        },
        cta: { label: { en: 'Get the combo' }, href: '#/menu' }
      },
    ],

    /* ---------- categories ----------
       icon: burger | pizza | fries | cup | utensils (see ICONS in index.html) */
    categories: [
      {
        id: 'burgers',
        icon: 'burger',
        name: {
          en: 'Burgers',
          am: 'በርገሮች',
          om: 'Bargarii'
        }
      },
      {
        id: 'pizza',
        icon: 'pizza',
        name: {
          en: 'Pizza',
          am: 'ፒዛ',
          om: 'Piizaa'
        }
      },
      {
        id: 'sides',
        icon: 'fries',
        name: {
          en: 'Sides',
          am: 'የጎን ምግቦች',
          om: 'Nyaata Dabalataa'
        }
      },
      {
        id: 'drinks',
        icon: 'cup',
        name: {
          en: 'Drinks',
          am: 'መጠጦች',
          om: 'Dhugaatii'
        }
      },
    ],

    /* ---------- products ----------
       isAvailable defaults to true when omitted.
       prepMinutesMax is optional (defaults to prepMinutes + 5). */
    products: [
      {
        id: 'p-classic',
        categoryId: 'burgers',
        imageUrl: IMAGES.burgerClassic,
        price: 220,
        rating: 4.8,
        reviewCount: 214,
        prepMinutes: 12,
        featured: true,
        tag: { en: 'Bestseller' },
        name: {
          en: 'Classic Beef Burger',
          am: 'ክላሲክ የበሬ በርገር'
        },
        description: {
          en: 'Grilled beef patty, cheddar, lettuce, tomato, pickles and house sauce in a toasted bun.'
        }
      },

      {
        id: 'p-double',
        categoryId: 'burgers',
        imageUrl: IMAGES.burgerDouble,
        price: 290,
        rating: 4.7,
        reviewCount: 168,
        prepMinutes: 14,
        featured: true,
        name: { en: 'Double Cheese Burger' },
        description: {
          en: 'Two beef patties, double cheddar and caramelised onions for a serious appetite.'
        }
      },

      {
        id: 'p-chicken',
        categoryId: 'burgers',
        imageUrl: IMAGES.burgerChicken,
        price: 250,
        rating: 4.6,
        reviewCount: 121,
        prepMinutes: 12,
        featured: false,
        name: { en: 'Crispy Chicken Burger' },
        description: {
          en: 'Buttermilk-fried chicken, slaw and garlic mayo on a soft brioche bun.'
        }
      },

      {
        id: 'p-berbere',
        categoryId: 'burgers',
        imageUrl: IMAGES.burgerSpicy,
        price: 270,
        rating: 4.9,
        reviewCount: 97,
        prepMinutes: 13,
        featured: true,
        tag: { en: 'Local favourite' },
        name: { en: 'Berbere Spice Burger' },
        description: {
          en: 'Beef patty rubbed with berbere, topped with spiced onion relish and cool yoghurt sauce.'
        }
      },

      {
        id: 'p-margherita',
        categoryId: 'pizza',
        imageUrl: IMAGES.pizzaMargherita,
        price: 320,
        rating: 4.6,
        reviewCount: 143,
        prepMinutes: 18,
        featured: true,
        name: {
          en: 'Margherita',
          am: 'ማርጋሪታ ፒዛ'
        },
        description: {
          en: 'Tomato sauce, fresh mozzarella and basil on our hand-stretched dough.'
        }
      },

      {
        id: 'p-pepperoni',
        categoryId: 'pizza',
        imageUrl: IMAGES.pizzaPepperoni,
        price: 390,
        rating: 4.8,
        reviewCount: 189,
        prepMinutes: 18,
        featured: true,
        tag: { en: 'Popular' },
        name: { en: 'Pepperoni Feast' },
        description: {
          en: 'Generous pepperoni, mozzarella and a touch of chilli oil.'
        }
      },

      {
        id: 'p-bbq',
        categoryId: 'pizza',
        imageUrl: IMAGES.pizzaBbq,
        price: 410,
        rating: 4.7,
        reviewCount: 102,
        prepMinutes: 20,
        featured: false,
        name: { en: 'BBQ Chicken Pizza' },
        description: {
          en: 'Smoky BBQ sauce, grilled chicken, red onion and mozzarella.'
        }
      },

      {
        id: 'p-veggie',
        categoryId: 'pizza',
        imageUrl: IMAGES.pizzaVeggie,
        price: 340,
        rating: 4.5,
        reviewCount: 76,
        prepMinutes: 18,
        featured: false,
        tag: { en: 'Vegetarian' },
        name: { en: 'Veggie Garden' },
        description: {
          en: 'Peppers, mushrooms, olives, sweetcorn and tomato on a mozzarella base.'
        }
      },

      {
        id: 'p-fries',
        categoryId: 'sides',
        imageUrl: IMAGES.fries,
        price: 90,
        rating: 4.7,
        reviewCount: 251,
        prepMinutes: 8,
        featured: true,
        name: { en: 'Crispy Fries' },
        description: {
          en: 'Skin-on fries, salted and fried until golden.'
        }
      },

      {
        id: 'p-rings',
        categoryId: 'sides',
        imageUrl: IMAGES.onionRings,
        price: 110,
        rating: 4.4,
        reviewCount: 64,
        prepMinutes: 9,
        featured: false,
        isAvailable: false,
        name: { en: 'Onion Rings' },
        description: {
          en: 'Thick-cut onion rings in a light crunchy batter.'
        }
      },

      {
        id: 'p-mango',
        categoryId: 'drinks',
        imageUrl: IMAGES.mangoJuice,
        price: 80,
        rating: 4.8,
        reviewCount: 133,
        prepMinutes: 4,
        featured: false,
        name: { en: 'Fresh Mango Juice' },
        description: {
          en: 'Blended to order from ripe mangoes. No added sugar.'
        }
      },

      {
        id: 'p-lemonade',
        categoryId: 'drinks',
        imageUrl: IMAGES.lemonade,
        price: 60,
        rating: 4.5,
        reviewCount: 88,
        prepMinutes: 3,
        featured: false,
        name: { en: 'Iced Lemonade' },
        description: {
          en: 'Fresh lemon, mint and plenty of ice.'
        }
      },

      {
        id: 'p-soda',
        categoryId: 'drinks',
        imageUrl: IMAGES.softDrink,
        price: 40,
        rating: 4.3,
        reviewCount: 52,
        prepMinutes: 1,
        featured: false,
        name: { en: 'Soft Drink' },
        description: {
          en: 'Chilled 350 ml bottle. Ask for your favourite flavour in the notes.'
        }
      },
    ],

    /* ---------- reviews ----------
       summary is computed by the backend (average + total count). */
    reviews: {
      summary: {
        average: 4.8,
        count: 320
      },
      items: [
        {
          id: 'r1',
          author: 'Hana T.',
          rating: 5,
          date: '2026-09-14',
          verified: true,
          text: 'The Berbere burger is unreal. Arrived hot in about 30 minutes and the fries were still crispy.'
        },
        {
          id: 'r2',
          author: 'Abdi K.',
          rating: 5,
          date: '2026-09-09',
          verified: true,
          text: 'Best pizza in Adama. The crust is thin and crunchy, and the pepperoni is generous.'
        },
        {
          id: 'r3',
          author: 'Selam M.',
          rating: 4,
          date: '2026-09-02',
          verified: true,
          text: 'Great food and friendly riders. I would love a few more vegetarian options on the menu.'
        },
        {
          id: 'r4',
          author: 'Dawit G.',
          rating: 5,
          date: '2026-08-26',
          verified: false,
          text: 'We ordered for a family lunch and everything was on time. The kids finished the mango juice first.'
        },
        {
          id: 'r5',
          author: 'Chaltu B.',
          rating: 5,
          date: '2026-08-19',
          verified: true,
          text: 'Clean, quick and tasty. The double cheese burger is worth every birr.'
        },
      ],
    },

    /* ---------- About Us page (single record) ----------
       Basics such as name, phone and address are NOT repeated here; the page reads them
       from `restaurant`. Everything below is editable content for the admin portal.
       Text = { en, am, om }. Icons: any key of ICONS in index.html.
       Suggested tables: about_page (hero, story, cta), about_stats, about_values,
       about_milestones, team_members (photoUrl -> Supabase Storage). */
    aboutPage: {
      hero: {
        badge: { en: 'Since 2019' },
        title: { en: 'A family kitchen with a fire in it.' },
        text: {
          en: 'We started with one grill and a simple promise: honest food, cooked to order, delivered while it is still hot. Today we are proud to feed thousands of families across Adama.'
        },
        images: [
          IMAGES.burgerAndFries,
          IMAGES.pizzaMargherita,
          IMAGES.burgerSpicy
        ],
      },

      story: {
        title: { en: 'Our story' },
        image: IMAGES.kitchen,
        paragraphs: [
          {
            en: 'Adama Burger & Pizza began in 2019 as a small grill on Franco Road. Our founder, Bekele Tadesse, had spent years cooking in Addis Ababa and wanted to bring proper, made-to-order burgers and stone-baked pizza to his home town.'
          },
          {
            en: 'From day one the rules were simple: grind the beef in house, stretch the dough by hand every morning, and never let a burger sit under a heat lamp. Those rules have not changed, even though the queue at lunchtime has.'
          },
          {
            en: 'Along the way we added a Berbere spice burger that locals now ask for by name, opened our delivery service, and grew from three people to a team of thirty-five neighbours.'
          },
        ],
      },

      stats: [
        {
          id: 'st1',
          value: '35,000+',
          label: { en: 'Orders delivered' }
        },
        {
          id: 'st2',
          value: '4.8',
          label: { en: 'Average rating' }
        },
        {
          id: 'st3',
          value: '35',
          label: { en: 'Team members' }
        },
        {
          id: 'st4',
          value: '30 min',
          label: { en: 'Typical delivery time' }
        },
      ],

      values: [
        {
          id: 'v1',
          icon: 'flame',
          title: { en: 'Cooked to order' },
          text: {
            en: 'Nothing waits under a heat lamp. Your burger hits the grill when you order it.'
          }
        },
        {
          id: 'v2',
          icon: 'leaf',
          title: { en: 'Fresh, local, daily' },
          text: {
            en: 'Vegetables from Adama growers, bread and dough made in house every morning.'
          }
        },
        {
          id: 'v3',
          icon: 'scooter',
          title: { en: 'Fast and careful' },
          text: {
            en: 'Insulated bags and riders who know every street, so food arrives hot and in one piece.'
          }
        },
        {
          id: 'v4',
          icon: 'home',
          title: { en: 'Rooted in Adama' },
          text: {
            en: 'We hire locally, buy locally and support the school lunch programme in Kebele 14.'
          }
        },
      ],

      milestones: [
        {
          id: 'm1',
          year: '2019',
          title: { en: 'The first grill' },
          text: { en: 'We open a 12-seat kitchen on Franco Road.' }
        },
        {
          id: 'm2',
          year: '2020',
          title: { en: 'Stone-baked pizza' },
          text: { en: 'A wood-fired oven joins the kitchen and pizza night is born.' }
        },
        {
          id: 'm3',
          year: '2022',
          title: { en: 'Delivery across Adama' },
          text: { en: 'Our own riders begin delivering to the whole city.' }
        },
        {
          id: 'm4',
          year: '2024',
          title: { en: 'Second branch' },
          text: { en: 'We open near Boku to serve the growing east side.' }
        },
        {
          id: 'm5',
          year: '2026',
          title: { en: 'Ordering online' },
          text: { en: 'Our new website and app make ordering a few taps.' }
        },
      ],

      team: [
        {
          id: 't1',
          name: 'Bekele Tadesse',
          role: { en: 'Founder and head chef' },
          photoUrl: null,
          bio: {
            en: 'Twenty years behind a grill and still the first one in every morning.'
          }
        },
        {
          id: 't2',
          name: 'Meron Alemu',
          role: { en: 'Operations manager' },
          photoUrl: null,
          bio: {
            en: 'Keeps the kitchen, riders and customers all moving in the same direction.'
          }
        },
        {
          id: 't3',
          name: 'Yonas Girma',
          role: { en: 'Pizza master' },
          photoUrl: null,
          bio: {
            en: 'Stretches every pizza base by hand and guards the dough recipe.'
          }
        },
        {
          id: 't4',
          name: 'Tigist Hailu',
          role: { en: 'Customer care lead' },
          photoUrl: null,
          bio: {
            en: 'The friendly voice on the phone. She remembers regular orders.'
          }
        },
      ],

      gallery: [
        IMAGES.diningRoom,
        IMAGES.tableSpread,
        IMAGES.pizzaPepperoni,
        IMAGES.burgerDouble
      ],

      cta: {
        title: { en: 'Come hungry. Leave happy.' },
        text: {
          en: 'Order for delivery or drop in and say hello. We would love to feed you.'
        }
      },
    },

    /* ---------- Contact page (single record) ----------
       Phone, email, address and hours come from `restaurant`. This record holds the rest.
       Suggested tables: contact_page (intro, replyTime, whatsapp, telegram), contact_departments,
       contact_topics, faqs. */
    contactPage: {
      intro: {
        en: 'Questions about an order, a party booking or just want to say hi? Pick the fastest way to reach us below, or send a message and we will get back to you.'
      },

      replyTime: {
        en: 'We usually reply within 2 hours during opening hours.'
      },

      whatsapp: '+251911000000',
      telegram: 'adamaburgerpizza',

      departments: [
        {
          id: 'd1',
          icon: 'scooter',
          label: { en: 'Orders and delivery' },
          text: {
            en: 'Track an order or fix a problem with one.'
          },
          phone: '+251 911 000 001',
          email: 'orders@adamaburgerpizza.example'
        },
        {
          id: 'd2',
          icon: 'bag',
          label: { en: 'Catering and events' },
          text: {
            en: 'Birthdays, weddings and office lunches.'
          },
          phone: '+251 911 000 002',
          email: 'events@adamaburgerpizza.example'
        },
        {
          id: 'd3',
          icon: 'message',
          label: { en: 'Feedback and partnerships' },
          text: {
            en: 'Suggestions, suppliers and press.'
          },
          phone: '+251 911 000 003',
          email: 'hello@adamaburgerpizza.example'
        },
      ],

      topics: [
        {
          id: 'order',
          label: { en: 'An order' }
        },
        {
          id: 'catering',
          label: { en: 'Catering or an event' }
        },
        {
          id: 'feedback',
          label: { en: 'Feedback' }
        },
        {
          id: 'jobs',
          label: { en: 'Working with us' }
        },
        {
          id: 'other',
          label: { en: 'Something else' }
        },
      ],

      faqs: [
        {
          id: 'f1',
          q: { en: 'How long does delivery take?' },
          a: {
            en: 'Most orders arrive in 25 to 40 minutes anywhere in our delivery area. Pizza can take a few minutes longer because it is baked to order.'
          }
        },
        {
          id: 'f2',
          q: { en: 'Which areas do you deliver to?' },
          a: {
            en: 'Adama city centre, Franco, Boku and Kebele 14. See the Location page for the full list.'
          }
        },
        {
          id: 'f3',
          q: { en: 'Can I book a table or order for a party?' },
          a: {
            en: 'Yes. For groups of eight or more, or catering orders, call or message us at least one day ahead.'
          }
        },
        {
          id: 'f4',
          q: { en: 'Do you have vegetarian options?' },
          a: {
            en: 'Yes. Our Veggie Garden pizza, Margherita, fries and fresh juices are all vegetarian. More dishes are coming.'
          }
        },
        {
          id: 'f5',
          q: { en: 'What if my order is wrong or late?' },
          a: {
            en: 'Call us straight away on the orders line. We will fix it or refund you, no arguments.'
          }
        },
      ],
    },

    /* ---------- branches / locations ----------
       One record per restaurant location. `isMain` marks the head office branch.
       shortName is the tab label on the Location page.
       weeklyHours day keys: mon tue wed thu fri sat sun (closed: true for a day off).
       features icons map to labels in index.html (delivery, dineIn, takeaway, parking, wifi, family). */
    branches: [
      {
        id: 'b-franco',
        isMain: true,
        name: { en: 'Franco Road (main branch)' },
        shortName: { en: 'Franco Road' },
        address: {
          en: 'Franco Road, next to the Adama Cultural Centre, Adama'
        },
        landmark: {
          en: 'Look for the orange awning, opposite the Commercial Bank branch.'
        },
        coordinates: {
          lat: 8.5414,
          lng: 39.2689
        },
        phone: '+251 911 000 000',
        email: 'hello@adamaburgerpizza.example',
        imageUrl: IMAGES.diningRoom,
        features: [
          'delivery',
          'dineIn',
          'takeaway',
          'parking',
          'wifi',
          'family'
        ],
        parking: {
          en: 'Free parking for about 12 cars behind the building.'
        },
        weeklyHours: [
          { day: 'mon', open: '08:00', close: '22:00' },
          { day: 'tue', open: '08:00', close: '22:00' },
          { day: 'wed', open: '08:00', close: '22:00' },
          { day: 'thu', open: '08:00', close: '22:00' },
          { day: 'fri', open: '08:00', close: '23:00' },
          { day: 'sat', open: '08:00', close: '23:00' },
          { day: 'sun', open: '09:00', close: '21:00' }
        ],
        directions: [
          {
            en: 'From Adama bus station, head north on the main road for about 1.5 km.'
          },
          {
            en: 'Turn right onto Franco Road at the roundabout.'
          },
          {
            en: 'We are 300 m on the left, next to the Cultural Centre.'
          }
        ]
      },

      {
        id: 'b-boku',
        isMain: false,
        name: { en: 'Boku (delivery and takeaway)' },
        shortName: { en: 'Boku' },
        address: {
          en: 'Boku main road, near the Boku market junction, Adama'
        },
        landmark: {
          en: 'Small takeaway counter beside the pharmacy.'
        },
        coordinates: {
          lat: 8.5602,
          lng: 39.2845
        },
        phone: '+251 911 000 004',
        email: 'boku@adamaburgerpizza.example',
        imageUrl: IMAGES.tableSpread,
        features: [
          'delivery',
          'takeaway'
        ],
        parking: {
          en: 'Street parking available in front.'
        },
        weeklyHours: [
          { day: 'mon', open: '10:00', close: '21:00' },
          { day: 'tue', open: '10:00', close: '21:00' },
          { day: 'wed', open: '10:00', close: '21:00' },
          { day: 'thu', open: '10:00', close: '21:00' },
          { day: 'fri', open: '10:00', close: '22:00' },
          { day: 'sat', open: '10:00', close: '22:00' },
          { day: 'sun', closed: true }
        ],
        directions: [
          {
            en: 'From the Boku market junction, walk 100 m towards the town centre.'
          },
          {
            en: 'The counter is beside the pharmacy, on the right.'
          }
        ]
      },
    ],

    /* ---------- contact messages (written by POST /contact-messages) ----------
       status: new | read | replied. Staff read these in the admin portal. */
    contactMessages: [],

    /* ---------- delivery settings (single record) ---------- */
    delivery: {
      enabled: true,
      fee: 40,
      freeDeliveryThreshold: 600,
      minOrder: 150,
      estimatedMinutes: {
        min: 25,
        max: 40
      },
      fastSurcharge: 30,
      fastEstimatedMinutes: {
        min: 15,
        max: 25
      },
      areas: [
        'Adama city centre',
        'Franco',
        'Boku',
        'Kebele 14'
      ],
    },

    /* ---------- payment settings (single record) ----------
       Telebirr is optional. The admin can turn it off or change the account in the admin settings. */
    payment: {
      cod: {
        enabled: true
      },
      telebirr: {
        enabled: true,
        accountNumber: '0911 222 333',
        accountName: 'Adama Burger & Pizza',
        instructions: [
          {
            en: 'Open the Telebirr app and choose Send Money.'
          },
          {
            en: 'Enter the account number above and the exact amount shown.'
          },
          {
            en: 'Confirm with your PIN.'
          },
          {
            en: 'Take a screenshot of the confirmation and upload it here.'
          },
        ],
      },
    },

    /* ---------- orders (belong to the signed-in customer) ----------
       status: received | preparing | on_the_way | delivered
       payment.status: pay_on_delivery (cash) | awaiting_review | approved | rejected (Telebirr, set by admin)
       payment.proof: { name, url, uploadedAt } — `url` is a Storage path/URL in production. */
    orders: [
      {
        id: 'AD-1051',
        status: 'preparing',
        createdAt: '2026-09-28T09:40:00Z',
        total: 660,
        subtotal: 660,
        fee: 0,
        customer: {
          name: 'Demo Customer',
          phone: '+251 911 111 111'
        },
        delivery: {
          option: 'normal',
          address: 'Franco Road, near the pharmacy',
          notes: '',
          fee: 0
        },
        payment: {
          method: 'cod',
          status: 'pay_on_delivery',
          proof: null
        },
        items: [
          {
            productId: 'p-pepperoni',
            name: 'Pepperoni Feast',
            qty: 1,
            price: 390
          },
          {
            productId: 'p-double',
            name: 'Double Cheese Burger',
            qty: 1,
            price: 290
          }
        ]
      },

      {
        id: 'AD-1042',
        status: 'delivered',
        createdAt: '2026-09-12T13:05:00Z',
        total: 350,
        subtotal: 310,
        fee: 40,
        customer: {
          name: 'Demo Customer',
          phone: '+251 911 111 111'
        },
        delivery: {
          option: 'normal',
          address: 'Boku, Kebele 03',
          notes: 'Call at the gate',
          fee: 40
        },
        payment: {
          method: 'cod',
          status: 'pay_on_delivery',
          proof: null
        },
        items: [
          {
            productId: 'p-classic',
            name: 'Classic Beef Burger',
            qty: 1,
            price: 220
          },
          {
            productId: 'p-fries',
            name: 'Crispy Fries',
            qty: 1,
            price: 90
          }
        ]
      },
    ],

    /* ---------- signed-in customer profile ---------- */
    profile: {
      id: 'u-1',
      name: 'Demo Customer',
      email: 'demo@example.com',
      phone: '+251 911 111 111',
      addresses: []
    },
  };
})();