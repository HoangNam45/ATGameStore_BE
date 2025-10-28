const ngrok = require("ngrok");

const startNgrok = async () => {
  try {
    const url = await ngrok.connect({
      addr: 5000, // port backend
    });

    console.log("🌐 Ngrok tunnel started!");
    console.log("📍 Public URL:", url);
    console.log("🔗 Webhook URL:", `${url}/api/payment/webhook`);

    return url;
  } catch (error) {
    console.error("❌ Failed to start ngrok tunnel:", error);
    throw error;
  }
};

const stopNgrok = async () => {
  try {
    await ngrok.disconnect();
    console.log("🔌 Ngrok tunnel stopped");
  } catch (error) {
    console.error("❌ Failed to stop ngrok tunnel:", error);
  }
};

module.exports = { startNgrok, stopNgrok };
