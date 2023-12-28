import { Pool } from 'mariadb'
import { STATUS } from './enums'
import type { User } from './types'

export const getCurrentDateTime = (ts: number = 0): string => {
  const T = ts !== 0 ? new Date(ts) : new Date()
  const M = T.getMonth() + 1 < 10 ? `0${T.getMonth() + 1}` : T.getMonth() + 1
  const D = T.getDate() < 10 ? `0${T.getDate()}` : T.getDate()
  const h = T.getHours() < 10 ? `0${T.getHours()}` : T.getHours()
  const m = T.getMinutes() < 10 ? `0${T.getMinutes()}` : T.getMinutes()
  const s = T.getSeconds() < 10 ? `0${T.getSeconds()}` : T.getSeconds()

  return `${T.getFullYear()}-${M}-${D} ${h}:${m}:${s}`
}

export type ResponseTemplate<T> = {
  ts: number,
  message: string,
  data: T
}
export const responseTemplate = <T = void>(message: string, data?: T): ResponseTemplate<T | void> => {
  return {
    ts: Date.now(),
    message: message,
    data 
  }
}

const querySQL = async (pool: Pool, sql: string): Promise<any> => {
  let conn, res
  try {
    conn = await pool.getConnection()
    res = await conn.query(sql)
  }
  catch(error) {
    console.log(error)
  }
  finally {
    if (conn) conn.release()
    return res
  }
}

export const verifyLogin = async (email: string, pwd: string, pool: Pool): Promise<string | User> => {
  const res = await querySQL(pool, `SELECT * FROM user WHERE email = '${email}'`) as User[]
  if (res.length !== 1 || res[0].password !== pwd) return STATUS.LoginFailed
  // record login successful count
  await querySQL(pool, `UPDATE user SET login_count = login_count + 1 WHERE email = '${email}'`)
  return res[0]
}

export const verifyExists = async (email: string, pool: Pool): Promise<string> => {
  const res = await querySQL(pool, `SELECT * FROM user WHERE email = '${email}'`) as User[]
  if (res.length !== 0) return STATUS.UserAlreadyExists
  return STATUS.OK
}

export const queryUserInfo = async (id: string, pool: Pool): Promise<null | User> => {
  const res = await querySQL(pool, `SELECT * FROM user WHERE id = ${id}`) as User[]
  return res.length === 0 ? null : res[0]
}
