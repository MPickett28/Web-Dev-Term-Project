USE terraria_arsenal;

INSERT INTO categories (
    category_id,
    category_name,
    description,
    image_url
)
VALUES
(
    1,
    'Melee Weapons',
    'Swords, spears, and close-range power.',
    '/images/categories/melee.png'
),
(
    2,
    'Magic Weapons',
    'Channel powerful magic to destroy enemies.',
    '/images/categories/magic.png'
),
(
    3,
    'Ranged Weapons',
    'Bows, guns, and explosive mayhem.',
    '/images/categories/ranged.png'
),
(
    4,
    'Summoner Weapons',
    'Summon minions to fight by your side.',
    '/images/categories/summoner.png'
),
(
    5,
    'Accessories',
    'Powerful equipment that improves movement, defense, and combat ability.',
    '/images/categories/accessories.png'
);

INSERT INTO products (
    product_id,
    category_id,
    product_name,
    description,
    price,
    inventory_quantity,
    image_url,
    is_featured,
    is_active
)
VALUES
(
    1,
    1,
    'Zenith',
    'The ultimate sword forged with the power of a true hero.',
    999.99,
    1,
    '/images/zenith.png',
    TRUE,
    TRUE
),
(
    2,
    1,
    'TerraBlade',
    'A blade that harnesses the power of Good and Evil.',
    499.99,
    5,
    '/images/terrablade.png',
    TRUE,
    TRUE
),
(
    3,
    2,
    'Last Prism',
    'Harness the power of light itself and annihilate your foes.',
    799.99,
    2,
    '/images/last-prism.png',
    TRUE,
    TRUE
),
(
    4,
    1,
    'Influx Waver',
    'A powerful melee weapon with light-based properties.',
    350.00,
    8,
    '/images/influx-waver.png',
    FALSE,
    TRUE
),
(
    5,
    1,
    'The Horseman''s Blade',
    'A deadly blade from the depths of the Underworld.',
    280.00,
    6,
    '/images/horsemans-blade.png',
    FALSE,
    TRUE
),
(
    6,
    2,
    'Luminite Bolt',
    'Channel the power of lunar celestial bodies.',
    600.00,
    4,
    '/images/luminite-bolt.png',
    FALSE,
    TRUE
),
(
    7,
    2,
    'Shadowflame Hex Doll',
    'Cast powerful dark magic with this ancient artifact.',
    320.00,
    7,
    '/images/shadowflame.png',
    FALSE,
    TRUE
),
(
    8,
    3,
    'Phantasm',
    'A ghostly bow that fires spectral arrows with precision.',
    850.00,
    3,
    '/images/phantasm.png',
    FALSE,
    TRUE
),
(
    9,
    3,
    'Tsunami',
    'A powerful shotgun that unleashes waves of destruction.',
    420.00,
    5,
    '/images/tsunami.png',
    FALSE,
    TRUE
),
(
    10,
    4,
    'Tempest Staff',
    'Summon lightning elementals to strike down your enemies.',
    750.00,
    3,
    '/images/tempest-staff.png',
    FALSE,
    TRUE
),
(
    11,
    4,
    'Stardust Dragon Staff',
    'Summon a cosmic dragon from the stars to fight by your side.',
    880.00,
    2,
    '/images/stardust-dragon.png',
    FALSE,
    TRUE
),
(
    12,
    5,
    'Ankh Shield',
    'A legendary defensive accessory that grants immunity to many debuffs.',
    649.99,
    4,
    '/images/ankh-shield.png',
    FALSE,
    TRUE
),
(
    13,
    5,
    'Celestial Shell',
    'Harness the powers of the sun, moon, and sea in one celestial accessory.',
    729.99,
    3,
    '/images/celestial-shell.png',
    FALSE,
    TRUE
),
(
    14,
    5,
    'Terraspark Boots',
    'Run, fly, and walk safely across fire, water, honey, and lava.',
    549.99,
    6,
    '/images/terraspark-boots.png',
    TRUE,
    TRUE
),
(
    15,
    5,
    'Master Ninja Gear',
    'Dash, cling to walls, and occasionally dodge incoming attacks.',
    459.99,
    5,
    '/images/master-ninja-gear.png',
    FALSE,
    TRUE
),
(
    16,
    5,
    'Worm Scarf',
    'A rugged scarf that reduces damage taken from every enemy attack.',
    299.99,
    8,
    '/images/worm-scarf.png',
    FALSE,
    TRUE
);