import mockdate from 'mockdate'
import React from 'react'

import {
  NextSubscriptionStepResponse,
  SubscriptionStatus,
  UserProfileResponse,
  YoungStatusType,
} from 'api/gen'
import * as Auth from 'features/auth/context/AuthContext'
import { useBeneficiaryValidationNavigation } from 'features/auth/helpers/useBeneficiaryValidationNavigation'
import { nextSubscriptionStepFixture as mockStep } from 'features/identityCheck/fixtures/nextSubscriptionStepFixture'
import { nonBeneficiaryUser } from 'fixtures/user'
import { env } from 'libs/environment'
import { GeolocPermissionState, useGeolocation } from 'libs/geolocation'
import { Credit, useAvailableCredit } from 'shared/user/useAvailableCredit'
import { reactQueryProviderHOC } from 'tests/reactQueryProviderHOC'
import { render } from 'tests/utils'

import { HomeHeader } from './HomeHeader'

const mockUseAuthContext = jest.spyOn(Auth, 'useAuthContext')

jest.mock('features/auth/helpers/useBeneficiaryValidationNavigation')
const mockedUseBeneficiaryValidationNavigation =
  useBeneficiaryValidationNavigation as jest.MockedFunction<
    typeof useBeneficiaryValidationNavigation
  >

jest.mock('shared/user/useAvailableCredit')
const mockUseAvailableCredit = useAvailableCredit as jest.MockedFunction<typeof useAvailableCredit>

jest.mock('libs/geolocation')
const mockUseGeolocation = useGeolocation as jest.Mock
mockdate.set(new Date('2022-12-01T00:00:00Z'))

const mockedUser = {
  ...nonBeneficiaryUser,
  status: {
    statusType: YoungStatusType.eligible,
    subscriptionStatus: SubscriptionStatus.has_to_complete_subscription,
  },
}

const mockNextSubscriptionStep: NextSubscriptionStepResponse = mockStep
jest.mock('features/auth/api/useNextSubscriptionStep', () => ({
  useNextSubscriptionStep: jest.fn(() => ({
    data: mockNextSubscriptionStep,
  })),
}))

const mockLoggedInUser = () => {
  mockUseAuthContext.mockReturnValueOnce({
    isLoggedIn: true,
    isUserLoading: false,
    setIsLoggedIn: jest.fn(),
    refetchUser: jest.fn(),
  })
}

describe('HomeHeader', () => {
  it.each`
    usertype                     | user                                                                              | isLoggedIn | credit                                | subtitle
    ${'ex beneficiary'}          | ${{ ...mockedUser, isBeneficiary: true, isEligibleForBeneficiaryUpgrade: false }} | ${true}    | ${{ amount: 0, isExpired: true }}     | ${'Ton crédit est expiré'}
    ${'beneficiary'}             | ${{ ...mockedUser, isBeneficiary: true, isEligibleForBeneficiaryUpgrade: false }} | ${true}    | ${{ amount: 5600, isExpired: false }} | ${'Tu as 56 € sur ton pass'}
    ${'eligible ex beneficiary'} | ${{ ...mockedUser, isBeneficiary: true, isEligibleForBeneficiaryUpgrade: true }}  | ${true}    | ${{ amount: 5, isExpired: true }}     | ${'Toute la culture à portée de main'}
    ${'general'}                 | ${{ ...mockedUser, isBeneficiary: false }}                                        | ${true}    | ${{ amount: 0, isExpired: false }}    | ${'Toute la culture à portée de main'}
    ${'not logged in'}           | ${undefined}                                                                      | ${false}   | ${{ amount: 0, isExpired: false }}    | ${'Toute la culture à portée de main'}
  `(
    '$usertype users should see subtitle: $subtitle',
    ({
      user,
      isLoggedIn,
      credit,
      subtitle,
    }: {
      user: UserProfileResponse
      isLoggedIn: boolean
      credit: Credit
      subtitle: string
    }) => {
      mockUseAuthContext.mockReturnValueOnce({
        isLoggedIn: isLoggedIn,
        user,
        isUserLoading: false,
        setIsLoggedIn: jest.fn(),
        refetchUser: jest.fn(),
      })
      mockUseAvailableCredit.mockReturnValueOnce(credit)

      const { getByText } = renderHomeHeader()
      expect(getByText(subtitle)).toBeTruthy()
    }
  )

  it('should not display geolocation banner when geolocation is granted', () => {
    const { queryByText } = renderHomeHeader()

    expect(queryByText('Géolocalise-toi')).toBeFalsy()
  })

  it('should display geolocation banner when geolocation is denied', () => {
    mockLoggedInUser()
    mockUseGeolocation.mockReturnValueOnce({ permissionState: GeolocPermissionState.DENIED })
    mockedUseBeneficiaryValidationNavigation.mockReturnValueOnce({
      nextBeneficiaryValidationStepNavConfig: undefined,
      navigateToNextBeneficiaryValidationStep: jest.fn(),
    })
    const { queryByText } = renderHomeHeader()

    expect(queryByText('Géolocalise-toi')).toBeTruthy()
  })

  it('should display geolocation banner when geolocation is never ask again', () => {
    mockLoggedInUser()
    mockUseGeolocation.mockReturnValueOnce({
      permissionState: GeolocPermissionState.NEVER_ASK_AGAIN,
    })
    mockedUseBeneficiaryValidationNavigation.mockReturnValueOnce({
      nextBeneficiaryValidationStepNavConfig: undefined,
      navigateToNextBeneficiaryValidationStep: jest.fn(),
    })
    const { queryByText } = renderHomeHeader()

    expect(queryByText('Géolocalise-toi')).toBeTruthy()
  })

  it.each`
    birthdate       | credit   | age
    ${'2007-11-06'} | ${'20'}  | ${15}
    ${'2006-11-06'} | ${'30'}  | ${16}
    ${'2005-11-06'} | ${'30'}  | ${17}
    ${'2004-11-06'} | ${'300'} | ${18}
  `(
    "should display a banner if the user has not finished the identification flow yet (user's age: $age)",
    ({ birthdate, credit }: { birthdate: string; credit: string }) => {
      mockUseGeolocation.mockReturnValueOnce({ permissionState: GeolocPermissionState.DENIED })
      mockUseAuthContext.mockReturnValueOnce({
        user: {
          ...nonBeneficiaryUser,
          birthDate: birthdate,
          status: {
            statusType: YoungStatusType.eligible,
            subscriptionStatus: SubscriptionStatus.has_to_complete_subscription,
          },
        },
        isLoggedIn: true,
        isUserLoading: false,
        setIsLoggedIn: jest.fn(),
        refetchUser: jest.fn(),
      })

      const { queryByText } = renderHomeHeader()

      expect(queryByText('Débloque tes ' + credit + ' €')).toBeTruthy()
      expect(queryByText(' à dépenser sur l’application')).toBeTruthy()
    }
  )

  it('should have CheatMenu button when FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING=true', async () => {
    env.FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING = true
    const { getByText } = renderHomeHeader()
    expect(getByText('CheatMenu')).toBeTruthy()
  })

  it('should NOT have CheatMenu button when NOT FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING=false', async () => {
    env.FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING = false
    const { queryByText } = renderHomeHeader()
    expect(queryByText('CheatMenu')).toBeNull()
  })

  it('should display SignupBanner when user is not logged in', () => {
    mockUseAuthContext.mockReturnValueOnce({
      isLoggedIn: false,
      isUserLoading: false,
      setIsLoggedIn: jest.fn(),
      refetchUser: jest.fn(),
    })

    const { getByText } = renderHomeHeader()

    expect(getByText('Débloque ton crédit')).toBeTruthy()
  })
})

function renderHomeHeader() {
  return render(<HomeHeader />, {
    // eslint-disable-next-line local-rules/no-react-query-provider-hoc
    wrapper: ({ children }) => reactQueryProviderHOC(children),
  })
}
