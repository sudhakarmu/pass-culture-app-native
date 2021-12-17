import { rest } from 'msw'
import React from 'react'
import { useMutation } from 'react-query'
import { mocked } from 'ts-jest/utils'
import waitForExpect from 'wait-for-expect'

import { navigate } from '__mocks__/@react-navigation/native'
import { UserProfileResponse } from 'api/gen'
import { IdentityCheckHonor } from 'features/identityCheck/pages/confirmation/IdentityCheckHonor'
import { env } from 'libs/environment'
import { server } from 'tests/server'
import { act, fireEvent, render, useMutationFactory } from 'tests/utils'

jest.mock('react-query')

const mockNavigateToNextScreen = jest.fn()
jest.mock('features/identityCheck/useIdentityCheckNavigation', () => ({
  useIdentityCheckNavigation: () => ({
    navigateToNextScreen: mockNavigateToNextScreen,
  }),
}))
const mockedUseMutation = mocked(useMutation)
const useMutationCallbacks: { onError: (error: unknown) => void; onSuccess: () => void } = {
  onSuccess: () => {},
  onError: () => {},
}

function mockUserProfile(response: UserProfileResponse) {
  server.use(
    rest.get<UserProfileResponse>(env.API_BASE_URL + '/native/v1/me', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(response))
    })
  )
}

describe('<IdentityCheckHonor/>', () => {
  beforeEach(() => {
    // @ts-expect-error ts(2345)
    return mockedUseMutation.mockImplementation(useMutationFactory(useMutationCallbacks))
  })

  it('should render correctly', () => {
    const renderAPI = render(<IdentityCheckHonor />)
    expect(renderAPI).toMatchSnapshot()
  })

  it('should navigate to next screen on postHonorStatement request success', async () => {
    mockUserProfile({
      domainsCredit: null,
    } as UserProfileResponse)

    const renderAPI = render(<IdentityCheckHonor />)

    const button = renderAPI.getByTestId('Valider et continuer')
    fireEvent.press(button)

    await act(async () => {
      useMutationCallbacks.onSuccess()
    })
    await waitForExpect(() => {
      expect(mockNavigateToNextScreen).toHaveBeenCalledTimes(1)
    })
  })

  it('should navigate to UnderageAccountCreated on postHonorStatement request success', async () => {
    mockUserProfile({
      domainsCredit: {
        all: {
          initial: 3000,
        },
      },
    } as UserProfileResponse)

    const renderAPI = render(<IdentityCheckHonor />)

    const button = renderAPI.getByTestId('Valider et continuer')
    fireEvent.press(button)

    await act(async () => {
      useMutationCallbacks.onSuccess()
    })
    await waitForExpect(() => {
      expect(navigate).toHaveBeenCalledTimes(1)
      expect(navigate).toHaveBeenCalledWith('UnderageAccountCreated')
    })
  })
})
