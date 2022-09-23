import omit from 'lodash/omit'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { api } from 'api/api'
import { Consent, CookiesConsent } from 'features/cookies/types'
import { useUserProfileInfo } from 'features/profile/api'
import { storage } from 'libs/storage'

import Package from '../../../../package.json'

const COOKIES_CONSENT_KEY = 'cookies_consent'

export const getCookiesChoice = async () =>
  await storage.readObject<CookiesConsent>(COOKIES_CONSENT_KEY)

export const useCookies = () => {
  const [cookiesConsent, setCookiesConsentInternalState] = useState<Consent>()
  const { data: userProfileInfo } = useUserProfileInfo()

  useEffect(() => {
    getCookiesChoice().then((value) => {
      if (value) {
        setCookiesConsentInternalState(value.consent)
      }
    })
  }, [])

  const setCookiesConsent = async (cookiesConsent: Consent) => {
    setCookiesConsentInternalState(cookiesConsent)

    const oldCookiesChoice = await getCookiesChoice()

    const newCookiesChoice = {
      buildVersion: Package.build,
      userId: oldCookiesChoice?.userId ?? userProfileInfo?.id,
      deviceId: oldCookiesChoice?.deviceId ?? uuidv4(),
      choiceDatetime: new Date().toISOString(),
      consent: cookiesConsent,
    }

    await persist(newCookiesChoice)
  }

  const setUserId = async (userId: number): Promise<void> => {
    const oldCookiesChoice = await getCookiesChoice()

    if (!oldCookiesChoice) return

    const newCookiesChoice = {
      ...oldCookiesChoice,
      userId,
    }

    await persist(newCookiesChoice)
  }

  return {
    cookiesConsent,
    setCookiesConsent,
    setUserId,
  }
}

const persist = async (cookiesChoice: CookiesConsent) => {
  await storage.saveObject(COOKIES_CONSENT_KEY, cookiesChoice)

  await api.postnativev1cookiesConsent(omit(cookiesChoice, ['buildVersion']))
}
