import React from 'react'

import { navigate } from '__mocks__/@react-navigation/native'
import { CulturalSurveyQuestionEnum } from 'api/gen'
import { CulturalSurveyIntro } from 'features/culturalSurvey/pages/CulturalSurveyIntro'
import { navigateToHome } from 'features/navigation/helpers'
import { analytics } from 'libs/firebase/analytics'
import { render, fireEvent } from 'tests/utils'

jest.mock('features/culturalSurvey/helpers/useGetNextQuestion')
jest.mock('features/navigation/helpers')
jest.mock('features/culturalSurvey/context/CulturalSurveyContextProvider')
describe('CulturalSurveyIntro page', () => {
  it('should render the page with correct layout', () => {
    const CulturalSurveyIntroPage = render(<CulturalSurveyIntro />)
    expect(CulturalSurveyIntroPage).toMatchSnapshot()
  })

  it('should navigate to first page when pressing Débuter le questionnaire', () => {
    const CulturalSurveyIntroPage = render(<CulturalSurveyIntro />)
    const StartButton = CulturalSurveyIntroPage.getByTestId('Débuter le questionnaire')
    fireEvent.press(StartButton)
    expect(navigate).toHaveBeenCalledWith('CulturalSurveyQuestions', {
      question: CulturalSurveyQuestionEnum.SORTIES,
    })
  })

  it('should log hasStartedCulturalSurvey event when pressing Débuter le questionnaire', () => {
    const CulturalSurveyIntroPage = render(<CulturalSurveyIntro />)
    const StartButton = CulturalSurveyIntroPage.getByTestId('Débuter le questionnaire')
    fireEvent.press(StartButton)
    expect(analytics.logHasStartedCulturalSurvey).toHaveBeenCalledTimes(1)
  })

  it('should navigate to home when pressing Plus tard', () => {
    const CulturalSurveyIntroPage = render(<CulturalSurveyIntro />)
    const LaterButton = CulturalSurveyIntroPage.getByTestId('Plus tard')
    fireEvent.press(LaterButton)
    expect(navigateToHome).toHaveBeenCalledTimes(1)
  })

  it('should log hasSkippedCulturalSurvey event when pressing Plus tard', () => {
    const CulturalSurveyIntroPage = render(<CulturalSurveyIntro />)
    const LaterButton = CulturalSurveyIntroPage.getByTestId('Plus tard')
    fireEvent.press(LaterButton)
    expect(analytics.logHasSkippedCulturalSurvey).toHaveBeenCalledTimes(1)
  })

  it('should navigate to FAQWebview when pressing En savoir plus', () => {
    const CulturalSurveyIntroPage = render(<CulturalSurveyIntro />)
    const FAQButton = CulturalSurveyIntroPage.getByText('En savoir plus')
    fireEvent.press(FAQButton)
    expect(navigate).toHaveBeenCalledWith('FAQWebview', undefined)
  })
})
