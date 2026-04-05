"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const deleteWorkflow = async (id: string) => {
  const { userId } = auth()

  if (!userId) throw new Error("unauthenticated")
  if (!id) throw new Error("workflow id is empty")

  // Optional safety check
  const workflow = await prisma.workflow.findUnique({
    where: { id }
  })

  if (!workflow || workflow.userId !== userId) {
    throw new Error("not authorized")
  }

  await prisma.workflow.delete({
    where: { id }
  })

  revalidatePath("/workflows")
}

export default deleteWorkflow
