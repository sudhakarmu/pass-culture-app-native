import { useQuery } from 'react-query'

import { api } from 'api/api'
import { CulturalSurveyQuestionsResponse } from 'api/gen'
import { useAuthContext } from 'features/auth/context/AuthContext'
import { useSettingsContext } from 'features/auth/context/SettingsContext'
import { useNetInfoContext } from 'libs/network/NetInfoWrapper'
import { QueryKeys } from 'libs/queryKeys'
import { shouldShowCulturalSurvey } from 'shared/culturalSurvey/shouldShowCulturalSurvey'

const STALE_TIME_CULTURAL_SURVEY_QUESTIONS = 5 * 60 * 1000

export function useCulturalSurveyQuestions() {
  const { user } = useAuthContext()
  const { data: settings } = useSettingsContext()
  const netInfo = useNetInfoContext()
  const shouldRequestCulturalSurveyQuestions =
    shouldShowCulturalSurvey(user) && settings?.enableNativeCulturalSurvey

  return useQuery<CulturalSurveyQuestionsResponse>(
    QueryKeys.CULTURAL_SURVEY_QUESTIONS,
    () => api.getnativev1culturalSurveyquestions(),
    {
      staleTime: STALE_TIME_CULTURAL_SURVEY_QUESTIONS,
      enabled: !!netInfo.isConnected && shouldRequestCulturalSurveyQuestions,
    }
  )
}
