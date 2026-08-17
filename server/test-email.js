"use strict";

const EmailService = require("./Services/emailService");

(async () => {
    console.log("");
    console.log("========================================");
    console.log("DUKAFASTA GMAIL SMTP TEST");
    console.log("========================================");

    console.log(
        "Configuration:",
        EmailService.getConfiguration()
    );

    console.log("");
    console.log("Testing Gmail SMTP...");
    console.log("");

    const result =
        await EmailService.verifySMTP();

    console.log("");
    console.log("========================================");
    console.log("RESULT");
    console.log("========================================");

    console.log(result);

    console.log("========================================");
})();