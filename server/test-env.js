require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
    "EMAIL_PASS configured:",
    Boolean(process.env.EMAIL_PASS)
);
console.log(
    "EMAIL_PASS length:",
    process.env.EMAIL_PASS
        ? process.env.EMAIL_PASS.length
        : 0
);
