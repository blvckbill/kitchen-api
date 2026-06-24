export const seed = async (knex) => {
  // Clear in correct order (child first)
  await knex('menu_items').del();
  await knex('vendors').del();

  // Insert vendors and get back their IDs
  const vendors = await knex('vendors').insert([
    { name: 'Mama Put Kitchen', description: 'Authentic Nigerian home cooking', address: 'Lagos Island, Lagos', phone: '+2348012345678', email: 'mamapat@kitchen.com' },
    { name: 'Grill Republic', description: 'Premium suya and grilled meats', address: 'Victoria Island, Lagos', phone: '+2348023456789', email: 'grillrepublic@kitchen.com' },
    { name: 'The Wrap Spot', description: 'Fresh shawarma and wraps made to order', address: 'Lekki Phase 1, Lagos', phone: '+2348034567890', email: 'wrapspot@kitchen.com' },
  ]).returning(['id', 'name']);

  const mamaPut = vendors.find(v => v.name === 'Mama Put Kitchen');
  const grillRepublic = vendors.find(v => v.name === 'Grill Republic');
  const wrapSpot = vendors.find(v => v.name === 'The Wrap Spot');

  await knex('menu_items').insert([
    // Mama Put Kitchen
    { vendor_id: mamaPut.id, name: 'Jollof Rice', description: 'Party-style jollof rice with smoky base', price: 150000, category: 'Rice', is_available: true },
    { vendor_id: mamaPut.id, name: 'Egusi Soup', description: 'Rich melon seed soup with assorted meat', price: 200000, category: 'Soup', is_available: true },
    { vendor_id: mamaPut.id, name: 'Fried Plantain', description: 'Sweet ripe plantain fried to perfection', price: 50000, category: 'Sides', is_available: true },

    // Grill Republic
    { vendor_id: grillRepublic.id, name: 'Beef Suya', description: 'Spiced grilled beef skewers with yaji', price: 250000, category: 'Grill', is_available: true },
    { vendor_id: grillRepublic.id, name: 'Grilled Chicken', description: 'Half chicken marinated and charcoal grilled', price: 350000, category: 'Grill', is_available: true },
    { vendor_id: grillRepublic.id, name: 'Peppered Gizzard', description: 'Tender gizzard in spicy pepper sauce', price: 180000, category: 'Sides', is_available: true },

    // The Wrap Spot
    { vendor_id: wrapSpot.id, name: 'Chicken Shawarma', description: 'Grilled chicken wrap with garlic sauce', price: 220000, category: 'Wraps', is_available: true },
    { vendor_id: wrapSpot.id, name: 'Beef Shawarma', description: 'Seasoned beef wrap with coleslaw', price: 250000, category: 'Wraps', is_available: true },
    { vendor_id: wrapSpot.id, name: 'Veggie Wrap', description: 'Fresh vegetables with hummus in a soft tortilla', price: 150000, category: 'Wraps', is_available: true },
  ]);
};