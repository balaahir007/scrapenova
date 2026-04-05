"use server"
import {prisma} from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';


export async function GetWorkFLowsForUser(){
    const {userId} = auth();
    if(!userId){
        throw new Error('unaunthenticated');
    }

    return  prisma.workflow.findMany({
        where : {
            userId
        },
        orderBy : {
            createdAt  : 'asc'
        }
    })
}