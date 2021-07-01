const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

module.exports = {
  async sendVerificationCode(phoneNumber) {
    return await client.verify
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel: "sms" }); //what is channel
  },

  async verificationCode(phoneNumber, code) {
    return await client.verify
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ code, to: phoneNumber });
  },
};
