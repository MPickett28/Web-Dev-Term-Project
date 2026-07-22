// ==================== PRODUCT DATA ==================== 
// Array of all products available in the Terraria Arsenal store
// Each product contains: id, name, category, price, stock, featured status, image, and description

export const products = [
  // ==================== FEATURED MELEE WEAPONS ====================
  {
    id: 1,
    name: "Zenith",
    category: "Melee Weapons",
    price: 999.99,
    stock: 1,
    featured: true,
    image: "/images/zenith.png",
    description: "The ultimate sword forged with the power of a true hero."
  },

  {
    id: 2,
    name: "TerraBlade",
    category: "Melee Weapons",
    price: 499.99,
    stock: 5,
    featured: true,
    image: "/images/terrablade.png",
    description: "A blade that harnesses the power of Good and Evil." 
  },

  // ==================== FEATURED MAGIC WEAPONS ====================
  {
    id: 3,
    name: "Last Prism",
    category: "Magic Weapons",
    price: 799.99,
    stock: 2,
    featured: true,
    image: "/images/last-prism.png",
    description: "Harness the power of light itself and annihilate your foes."
  },

  // ==================== ADDITIONAL MELEE WEAPONS ====================
  {
    id: 4,
    name: "Influx Waver",
    category: "Melee Weapons",
    price: 350.00,
    stock: 8,
    featured: false,
    image: "/images/influx-waver.png",
    description: "A powerful melee weapon with light-based properties."
  },

  {
    id: 5,
    name: "The Horseman's Blade",
    category: "Melee Weapons",
    price: 280.00,
    stock: 6,
    featured: false,
    image: "/images/horsemans-blade.png",
    description: "A deadly blade from the depths of the Underworld."
  },

  // ==================== ADDITIONAL MAGIC WEAPONS ====================
  {
    id: 6,
    name: "Luminite Bolt",
    category: "Magic Weapons",
    price: 600.00,
    stock: 4,
    featured: false,
    image: "/images/luminite-bolt.png",
    description: "Channel the power of lunar celestial bodies."
  },

  {
    id: 7,
    name: "Shadowflame Hex Doll",
    category: "Magic Weapons",
    price: 320.00,
    stock: 7,
    featured: false,
    image: "/images/shadowflame.png",
    description: "Cast powerful dark magic with this ancient artifact."
  },

  // ==================== RANGED WEAPONS ====================
  {
    id: 8,
    name: "Phantasm",
    category: "Ranged Weapons",
    price: 850.00,
    stock: 3,
    featured: false,
    image: "/images/phantasm.png",
    description: "A ghostly bow that fires spectral arrows with precision."
  },

  {
    id: 9,
    name: "Tsunami",
    category: "Ranged Weapons",
    price: 420.00,
    stock: 5,
    featured: false,
    image: "/images/tsunami.png",
    description: "A powerful shotgun that unleashes waves of destruction."
  },

  // ==================== SUMMONER WEAPONS ====================
  {
    id: 10,
    name: "Tempest Staff",
    category: "Summoner Weapons",
    price: 750.00,
    stock: 3,
    featured: false,
    image: "/images/tempest-staff.png",
    description: "Summon lightning elementals to strike down your enemies."
  },

  {
    id: 11,
    name: "Stardust Dragon Staff",
    category: "Summoner Weapons",
    price: 880.00,
    stock: 2,
    featured: false,
    image: "/images/stardust-dragon.png",
    description: "Summon a cosmic dragon from the stars to fight by your side."
  },

  // ==================== ACCESSORIES ====================
  {
    id: 12,
    name: "Ankh Shield",
    category: "Accessories",
    price: 649.99,
    stock: 4,
    featured: false,
    image: "/images/ankh-shield.png",
    description: "A legendary defensive accessory that grants immunity to many debuffs."
  },
  {
    id: 13,
    name: "Celestial Shell",
    category: "Accessories",
    price: 729.99,
    stock: 3,
    featured: false,
    image: "/images/celestial-shell.png",
    description: "Harness the powers of the sun, moon, and sea in one celestial accessory."
  },
  {
    id: 14,
    name: "Terraspark Boots",
    category: "Accessories",
    price: 549.99,
    stock: 6,
    featured: true,
    image: "/images/terraspark-boots.png",
    description: "Run, fly, and walk safely across fire, water, honey, and lava."
  },
  {
    id: 15,
    name: "Master Ninja Gear",
    category: "Accessories",
    price: 459.99,
    stock: 5,
    featured: false,
    image: "/images/master-ninja-gear.png",
    description: "Dash, cling to walls, and occasionally dodge incoming attacks."
  },
  {
    id: 16,
    name: "Worm Scarf",
    category: "Accessories",
    price: 299.99,
    stock: 8,
    featured: false,
    image: "/images/worm-scarf.png",
    description: "A rugged scarf that reduces damage taken from every enemy attack."
  }
];
