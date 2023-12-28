import { Pool } from 'mariadb'
import { Router } from 'express'
import SvgCaptcha from 'svg-captcha'

import { responseTemplate, verifyExists, verifyLogin, queryUserInfo } from '../utils'
import { STATUS } from '../enums'

export const Routes = (pool: Pool): Router => {
  const router = Router()

  // login
  router.post('/login', async (req, res) => {
    if (!req.body?.email || !req.body?.password) {
      res.json(responseTemplate(STATUS.PrarmeterError))
      return
    }

    const vfres = await verifyLogin(req.body.email, req.body.password, pool)
    if (typeof vfres === 'string') {
      res.json(responseTemplate(vfres))
      return
    }

    req.session.authorized = true
    req.session.uid = vfres.id
    res.json(responseTemplate(STATUS.OK))
  })

  // logout
  router.get('/logout', (req, res) => {
    if (!req.session?.authorized || !req.session?.uid) {
      res.json(responseTemplate(STATUS.OK))
      return 
    }

    delete req.session.authorized
    delete req.session.uid
    delete req.session.captcha
    res.json(responseTemplate(STATUS.OK))
  })

  // register
  router.post('/register', async (req, res) => {
    console.log(req.body)
    console.log(req.session)
    if (!req.body?.captcha || !req.session?.captcha || !req.body?.email || !req.body?.password) {
      res.json(responseTemplate(STATUS.PrarmeterError))
      return
    }

    if (req.body.captcha !== req.session.captcha) {
      res.json(responseTemplate(STATUS.CaptchaFailed))
      return
    }

    const vfres = await verifyExists(req.body.email, pool)
    if (vfres !== STATUS.OK) {
      res.json(responseTemplate(vfres))
      return
    }
    res.json(responseTemplate(STATUS.OK))
  })

  // generate captcha
  router.get('/captcha/generate', (req, res) => {
    console.log(req.session)
    const captcha = SvgCaptcha.create({ ignoreChars: 'il1oO0' })
    req.session.captcha = captcha.text.toLowerCase()
    
    console.log(req.session)
    res.type('svg').status(200).end(captcha.data)
  })

  // get user information
  router.post('/info', async (req, res) => {
    if (!req.session?.authorized || !req.session?.uid) {
      res.json(responseTemplate(STATUS.PrarmeterError))
      return
    }

    const info = await queryUserInfo(req.session.uid, pool)
    if (info === null) {
      res.json(responseTemplate(STATUS.NotLoggedIn))
      return
    }
    res.json(responseTemplate(STATUS.OK, info))
  })

  return router
}
