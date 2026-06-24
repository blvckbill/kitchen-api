// Transforms a database menu item object from kobo to Naira for API consumption
export const serializeMenuItem = (item) => {
  if (!item) return null;
  return {
    ...item,
    // Safely parse or preserve floats if numbers have fractional parts
    price: Number((item.price / 100).toFixed(2)),
  };
};

// Transforms an array of menu items from kobo to Naira
export const serializeMenuCollection = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(serializeMenuItem);
};

// Converts a customer/vendor input Naira decimal into a safe whole database integer (kobo)
export const parseToKobo = (nairaAmount) => {
  if (typeof nairaAmount !== 'number') return nairaAmount;
  return Math.round(nairaAmount * 100);
};