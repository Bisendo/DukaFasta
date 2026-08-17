require("dotenv").config({
    path: "./.env",
    override: true
});

console.log("========================================");
console.log("EMAIL ENVIRONMENT TEST");
console.log("========================================");

console.log(
    "EMAIL_USER:",
    process.env.EMAIL_USER
);

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

console.log(
    "EMAIL_HOST:",
    process.env.EMAIL_HOST
);

console.log(
    "EMAIL_PORT:",
    process.env.EMAIL_PORT
);

console.log(
    "EMAIL_SECURE:",
    process.env.EMAIL_SECURE
);

console.log("========================================");