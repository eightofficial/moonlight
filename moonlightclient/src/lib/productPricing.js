export function getProductPrice(pricing) {
  const totalPrice = Number(pricing?.totalPrice);
  if (Number.isFinite(totalPrice) && totalPrice > 0) {
    return totalPrice;
  }

  return (
    (Number(pricing?.basePrice) || 0) +
    (Number(pricing?.otherExpenses) || 0)
  );
}
