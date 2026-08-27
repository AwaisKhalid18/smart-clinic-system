const prisma = require('../prismaClient');

async function createNotification(userId, title, message, priority = 'NORMAL') {
  try {
    await prisma.notification.create({
      data: { userId, title, message, priority },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

module.exports = { createNotification };