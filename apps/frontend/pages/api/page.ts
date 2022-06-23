import  { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(_req: any, res: any) {
  const user = await prisma.user.findFirst();

  res.status(200).json(user)
}