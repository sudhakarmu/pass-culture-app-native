import React from 'react'

import { FAQ_LINK_USER_DATA } from 'features/culturalSurvey/constants'
import { CulturalSurveyIntro } from 'features/culturalSurvey/pages/CulturalSurveyIntro'
import { openUrl } from 'features/navigation/helpers'
import { render, fireEvent } from 'tests/utils'

jest.mock('features/culturalSurvey/helpers/useGetNextQuestion')
jest.mock('features/navigation/helpers')
jest.mock('features/culturalSurvey/context/CulturalSurveyContextProvider')
describe('CulturalSurveyIntro page', () => {
  it('should render the page with correct layout', () => {
    const CulturalSurveyIntroPage = render(<CulturalSurveyIntro />)
    expect(CulturalSurveyIntroPage).toMatchSnapshot()
  })

  it('should open FAQ url when pressing En savoir plus', () => {
    const CulturalSurveyIntroPage = render(<CulturalSurveyIntro />)
    const FAQButton = CulturalSurveyIntroPage.getByText('En savoir plus')
    fireEvent.press(FAQButton)
    expect(openUrl).toHaveBeenCalledWith(FAQ_LINK_USER_DATA, undefined, true)
  })
})
