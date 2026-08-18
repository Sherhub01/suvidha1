/** Formats a rupee amount for display: 1234.5 -> "₹1,234.50". */
export const formatINR = (rupees) =>
  `₹${Number(rupees || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
