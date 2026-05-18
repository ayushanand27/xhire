const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
module.exports.prisma = prisma;
module.exports.default = prisma;
