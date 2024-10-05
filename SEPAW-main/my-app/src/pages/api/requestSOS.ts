import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

import { replyNotificationSOS } from '@/utils/apiLineReply'
type Data = {
	message: string;
	data?: any;
}
// C6330f4d4d19dbe2cb85fab258091b5c0
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
        if (req.headers['content-type'] !== 'application/json') {
            return res.status(400).json({ message: 'error', error: "Content-Type must be application/json" })
        }
        const body = req.body
        if (!body.uid) {
            return res.status(400).json({ message: 'error', data: 'ไม่พบพารามิเตอร์ uid' })
        }
        if (isNaN(Number(body.uid))) {
            return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ uid ไม่ใช่ตัวเลข' })
        }
        const user = await prisma.users.findFirst({
            where: {
                users_id: Number(body.uid)
            }
        })
        const takecareperson = await prisma.takecareperson.findFirst({
            where: {
                users_id: user?.users_id,
                takecare_status: 1
            }
        })

        if (user && takecareperson) {
            const message = `คุณ ${takecareperson.takecare_fname} ${takecareperson.takecare_sname}  \nขอความช่วยเหลือ ฉุกเฉิน`
            await replyNotificationSOS({ replyToken: user.users_line_id, message })
            
            return res.status(200).json({ message: 'success', data: user })
        } else {
            return res.status(400).json({ message: 'error', data: 'ไม่พบข้อมูล' })
        }
	} else {
		res.setHeader('Allow', ['POST'])
		res.status(405).json({ message: `วิธี ${req.method} ไม่อนุญาต` })
	}

}