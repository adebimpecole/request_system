export const getDate = () => {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric", // e.g., "2024"
    month: "long", // e.g., "August"
    day: "numeric", // e.g., "10"
  });

  return formattedDate;
};

export const getFormattedDate = (dateInput) => {
  const date = new Date(dateInput);
  if (!dateInput || Number.isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (January is 0) and pad with leading zero
  const year = date.getFullYear(); // Get the full year

  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
};

export const generateRandomCode = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};

// // Encode an ID to Base64
// function encodeId(id) {
//   const sqids = new Sqids({
//     alphabet: 'k3G7QAe51FCsPW92uEOyq4Bg6Sp8YzVTmnU0liwDdHXLajZrfxNhobJIRcMvKt',
//   })
//   const id = sqids.encode(id) // "XRKUdQ"
//   const numbers = sqids.decode(id) // [1, 2, 3]
//   return btoa(id);
// }

// // Decode an ID from Base64
// function decodeId(encodedId) {
//   return atob(encodedId);
// }
