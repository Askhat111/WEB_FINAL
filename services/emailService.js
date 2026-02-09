const emailService = {
  sendWelcomeEmail: async (email, username) => {
    console.log(`📧 MOCK: Welcome email to ${email} for ${username}`);
    console.log('Subject: Welcome to Asphalt Coffee!');
    console.log('Status: Mock delivery successful');
    console.log('---');
    return { success: true, mock: true };
  },
  
  sendOrderConfirmation: async (email, orderId, totalAmount) => {
    console.log(`📧 MOCK: Order confirmation to ${email}`);
    console.log(`Order #${orderId}, Total: ${totalAmount} ₸`);
    console.log('Status: Mock delivery successful');
    console.log('---');
    return { success: true, mock: true };
  }
};

module.exports = emailService;