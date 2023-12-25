import { Pool } from 'mariadb'
import { Router } from 'express'
import SvgCaptcha from 'svg-captcha'

import { responseTemplate, verifyExists, verifyLogin, queryUserInfo } from '../utils'
import { STATUS } from '../enums'

export const Routes = (pool: Pool): Router => {
  const router = Router()

  // login
  router.post('/login', async (req, res) => {
    if (!req.body?.id || !req.body?.password) {
      res.json(responseTemplate(STATUS.PrarmeterError))
      return
    }

    const vfres = await verifyLogin(req.body.id, req.body.password, pool)
    if (typeof vfres === 'string') {
      res.json(responseTemplate(vfres))
      return
    }

    req.session.authorized = true
    req.session.uid = vfres.id
    res.json(responseTemplate(STATUS.OK))
  })

  // register
  router.post('/register', async (req, res) => {
    if (!req.body?.id || !req.body?.password) {
      res.json(responseTemplate(STATUS.PrarmeterError))
      return
    }

    const vfres = await verifyExists(req.body.id, pool)
    if (vfres !== STATUS.OK) {
      res.json(responseTemplate(vfres))
      return
    }
    res.json(responseTemplate(STATUS.OK))
  })

  // generate captcha
  router.post('/captcha/generate', (req, res) => {
    const captcha = SvgCaptcha.create({ ignoreChars: 'il1oO0' })
    req.session.captcha = captcha.text
    res.type('svg').status(200).end(captcha.data)
  })

  // verify captcha
  router.post('/captcha/verify', (req, res) => {
    if (!req.session?.captcha || !req.body?.captcha) {
      res.json(responseTemplate(STATUS.PrarmeterError))
      return
    }

    res.json(
      responseTemplate(
        req.body.captcha === req.session.captcha ? STATUS.OK : STATUS.CaptchaFailed
      )
    )
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
