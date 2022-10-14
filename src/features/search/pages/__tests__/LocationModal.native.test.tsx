import React from 'react'
import { ReactTestInstance } from 'react-test-renderer'

import { navigate } from '__mocks__/@react-navigation/native'
import { LocationType } from 'features/search/enums'
import { LocationModal, RadioButtonLocation } from 'features/search/pages/LocationModal'
import { initialSearchState } from 'features/search/pages/reducer'
import { MAX_RADIUS } from 'features/search/pages/reducer.helpers'
import { keyExtractor } from 'features/search/pages/SuggestedPlaces'
import { SectionTitle } from 'features/search/sections/titles'
import { LocationFilter, SearchView } from 'features/search/types'
import { analytics } from 'libs/firebase/analytics'
import { ChangeSearchLocationParam } from 'libs/firebase/analytics/analytics'
import {
  GeoCoordinates,
  GEOLOCATION_USER_ERROR_MESSAGE,
  GeolocationError,
  GeolocPermissionState,
  GeolocPositionError,
} from 'libs/geolocation'
import { SuggestedPlace } from 'libs/place'
import { SuggestedVenue } from 'libs/venue'
import { mockedSuggestedVenues } from 'libs/venue/fixtures/mockedSuggestedVenues'
import { act, fireEvent, render, superFlushWithAct } from 'tests/utils'

let mockSearchState = initialSearchState
jest.mock('features/search/pages/SearchWrapper', () => ({
  useSearch: () => ({
    searchState: mockSearchState,
  }),
}))

const DEFAULT_POSITION = { latitude: 2, longitude: 40 } as GeoCoordinates
let mockPosition: GeoCoordinates | null = DEFAULT_POSITION
let mockPermissionState = GeolocPermissionState.GRANTED
let mockPositionError: GeolocationError | null = null
const mockTriggerPositionUpdate = jest.fn()
const mockShowGeolocPermissionModal = jest.fn()

jest.mock('libs/geolocation/GeolocationWrapper', () => ({
  useGeolocation: () => ({
    permissionState: mockPermissionState,
    position: mockPosition,
    positionError: mockPositionError,
    triggerPositionUpdate: mockTriggerPositionUpdate,
    showGeolocPermissionModal: mockShowGeolocPermissionModal,
  }),
}))

const hideLocationModal = jest.fn()

const Kourou: SuggestedPlace = {
  label: 'Kourou',
  info: 'Guyane',
  geolocation: { longitude: -52.669736, latitude: 5.16186 },
}
const venue: SuggestedVenue = mockedSuggestedVenues[0]

const mockPlaces: SuggestedPlace[] = Array.from({ length: 10 }).map((_, index) => ({
  label: `place_${index}`,
  info: `info_place_${index}`,
  geolocation: {
    longitude: -52 - index,
    latitude: 15 - index,
  },
}))

const mockVenues: SuggestedVenue[] = Array.from({ length: 10 }).map((_, index) => ({
  label: `venue_${index}`,
  info: `info_venue_${index}`,
  venueId: index,
}))

const mockIsLoading = false
jest.mock('libs/place', () => ({
  usePlaces: () => ({ data: mockPlaces, isLoading: mockIsLoading }),
  useVenues: () => ({ data: mockVenues, isLoading: mockIsLoading }),
}))

describe('LocationModal component', () => {
  afterEach(() => {
    mockPermissionState = GeolocPermissionState.GRANTED
    mockPosition = DEFAULT_POSITION
    mockPositionError = null
  })

  it('should render modal correctly after animation and with enabled submit', async () => {
    jest.useFakeTimers()
    const renderAPI = renderLocationModal({ hideLocationModal })
    await superFlushWithAct()
    jest.advanceTimersByTime(2000)
    expect(renderAPI).toMatchSnapshot()
    jest.useRealTimers()
  })

  describe('should navigate on search results', () => {
    it('with actual state with no change when pressing search button', async () => {
      const { getByText } = renderLocationModal({ hideLocationModal })

      await superFlushWithAct()

      const searchButton = getByText('Rechercher')
      await act(async () => {
        fireEvent.press(searchButton)
      })

      expect(navigate).toHaveBeenCalledWith('TabNavigator', {
        params: {
          ...mockSearchState,
          view: SearchView.Results,
        },
        screen: 'Search',
      })
    })

    it('with a new radius when changing it with the slider and pressing search button', async () => {
      mockSearchState = {
        ...initialSearchState,
        locationFilter: { locationType: LocationType.AROUND_ME, aroundRadius: MAX_RADIUS },
      }
      const { getByTestId, getByText } = renderLocationModal({ hideLocationModal })

      await act(async () => {
        const slider = getByTestId('slider').children[0] as ReactTestInstance
        slider.props.onValuesChange([50])
      })

      const searchButton = getByText('Rechercher')
      await act(async () => {
        fireEvent.press(searchButton)
      })

      expect(navigate).toHaveBeenCalledWith('TabNavigator', {
        params: {
          ...mockSearchState,
          locationFilter: { locationType: LocationType.AROUND_ME, aroundRadius: 50 },
          view: SearchView.Results,
        },
        screen: 'Search',
      })
    })
  })

  it.each`
    locationFilter                                                                   | label                                        | locationType
    ${{ locationType: LocationType.EVERYWHERE }}                                     | ${RadioButtonLocation.EVERYWHERE}            | ${LocationType.EVERYWHERE}
    ${{ locationType: LocationType.AROUND_ME, aroundRadius: MAX_RADIUS }}            | ${RadioButtonLocation.AROUND_ME}             | ${LocationType.AROUND_ME}
    ${{ locationType: LocationType.PLACE, place: Kourou, aroundRadius: MAX_RADIUS }} | ${RadioButtonLocation.CHOOSE_PLACE_OR_VENUE} | ${LocationType.PLACE}
    ${{ locationType: LocationType.VENUE, venue }}                                   | ${RadioButtonLocation.CHOOSE_PLACE_OR_VENUE} | ${LocationType.VENUE}
  `(
    'should select $label radio button by default when location type search state is $locationType',
    async ({
      locationFilter,
      label,
    }: {
      locationFilter: LocationFilter
      label: RadioButtonLocation
    }) => {
      mockSearchState = { ...mockSearchState, locationFilter }
      const { getByTestId } = renderLocationModal({ hideLocationModal })

      await superFlushWithAct()

      const radioButton = getByTestId(label)

      expect(radioButton.props.accessibilityState).toEqual({ checked: true })
    }
  )

  it.each`
    locationFilter                                                        | label                             | locationType               | eventType
    ${{ locationType: LocationType.EVERYWHERE }}                          | ${RadioButtonLocation.EVERYWHERE} | ${LocationType.EVERYWHERE} | ${{ type: 'everywhere' }}
    ${{ locationType: LocationType.AROUND_ME, aroundRadius: MAX_RADIUS }} | ${RadioButtonLocation.AROUND_ME}  | ${LocationType.AROUND_ME}  | ${{ type: 'aroundMe' }}
  `(
    'should log ChangeSearchLocation event and navigate with $locationType location type when selecting $label radio button and pressing search button',
    async ({
      locationFilter,
      label,
      eventType,
    }: {
      locationFilter: LocationFilter
      label: RadioButtonLocation
      eventType: ChangeSearchLocationParam
    }) => {
      mockSearchState = { ...mockSearchState, locationFilter }
      const { getByTestId, getByText } = renderLocationModal({
        hideLocationModal,
      })

      const radioButton = getByTestId(label)
      await act(async () => {
        fireEvent.press(radioButton)
      })

      const searchButton = getByText('Rechercher')
      await act(async () => {
        fireEvent.press(searchButton)
      })

      expect(analytics.logChangeSearchLocation).toHaveBeenCalledWith(eventType)

      expect(navigate).toHaveBeenCalledWith('TabNavigator', {
        params: {
          ...mockSearchState,
          locationFilter,
          view: SearchView.Results,
        },
        screen: 'Search',
      })
    }
  )

  it.each`
    locationFilter                                                                          | label                                        | locationType          | eventType
    ${{ locationType: LocationType.VENUE, venue: mockVenues[0] }}                           | ${RadioButtonLocation.CHOOSE_PLACE_OR_VENUE} | ${LocationType.VENUE} | ${{ type: 'venue', venueId: mockVenues[0].venueId }}
    ${{ locationType: LocationType.PLACE, place: mockPlaces[0], aroundRadius: MAX_RADIUS }} | ${RadioButtonLocation.CHOOSE_PLACE_OR_VENUE} | ${LocationType.PLACE} | ${{ type: 'place' }}
  `(
    'should log ChangeSearchLocation event and navigate with $locationType location type when selecting $label radio button, location/venue and pressing search button',
    async ({
      locationFilter,
      label,
      eventType,
    }: {
      locationFilter: LocationFilter
      label: RadioButtonLocation
      eventType: ChangeSearchLocationParam
    }) => {
      mockSearchState = { ...mockSearchState, locationFilter }
      const { getByTestId, getByText, getByPlaceholderText } = renderLocationModal({
        hideLocationModal,
      })

      const radioButton = getByTestId(label)
      await act(async () => {
        fireEvent.press(radioButton)
      })

      const searchInput = getByPlaceholderText(`Saisis une adresse ou le nom d’un lieu`)
      await act(async () => {
        fireEvent(searchInput, 'onFocus')
        fireEvent.changeText(searchInput, 'Paris')
      })

      const venueOrPlace =
        locationFilter.locationType === LocationType.VENUE ? mockVenues[0] : mockPlaces[0]

      await act(async () => {
        fireEvent.press(getByTestId(keyExtractor(venueOrPlace)))
      })

      const searchButton = getByText('Rechercher')
      await act(async () => {
        fireEvent.press(searchButton)
      })

      expect(analytics.logChangeSearchLocation).toHaveBeenCalledWith(eventType)

      expect(navigate).toHaveBeenCalledWith('TabNavigator', {
        params: {
          ...mockSearchState,
          locationFilter,
          view: SearchView.Results,
        },
        screen: 'Search',
      })
    }
  )

  it('should display error message when select Autour de moi radio button when position is null', async () => {
    mockPosition = null
    mockPositionError = {
      type: GeolocPositionError.SETTINGS_NOT_SATISFIED,
      message: GEOLOCATION_USER_ERROR_MESSAGE[GeolocPositionError.SETTINGS_NOT_SATISFIED],
    }
    const { getByTestId, queryByText } = renderLocationModal({ hideLocationModal })

    const radioButton = getByTestId(RadioButtonLocation.AROUND_ME)
    await act(async () => {
      fireEvent.press(radioButton)
    })

    queryByText(mockPositionError.message)
  })

  it('should display the selected radius when select Autour de moi radio button', async () => {
    mockSearchState = initialSearchState
    const { getByTestId, queryByText } = renderLocationModal({ hideLocationModal })

    await act(async () => {
      expect(queryByText('Dans un rayon de\u00a0:')).toBeFalsy()
    })

    const radioButton = getByTestId(RadioButtonLocation.AROUND_ME)
    await act(async () => {
      fireEvent.press(radioButton)
    })
    expect(queryByText('Dans un rayon de\u00a0:')).toBeTruthy()
  })

  it('should display the slider when select Autour de moi radio button', async () => {
    const { queryByTestId, getByTestId } = renderLocationModal({ hideLocationModal })

    await act(async () => {
      expect(queryByTestId('slider')).toBeFalsy()
    })

    const radioButton = getByTestId(RadioButtonLocation.AROUND_ME)
    await act(async () => {
      fireEvent.press(radioButton)
    })
    expect(queryByTestId('slider')).toBeTruthy()
  })

  it('should not change location filter on Autour de moi radio button press when position is null', async () => {
    mockPosition = null
    const { getByTestId } = renderLocationModal({ hideLocationModal })

    const radioButton = getByTestId(RadioButtonLocation.AROUND_ME)
    await act(async () => {
      fireEvent.press(radioButton)
    })

    expect(radioButton.props.accessibilityState).toEqual({ checked: false })
  })

  it.each([
    [RadioButtonLocation.EVERYWHERE],
    [RadioButtonLocation.AROUND_ME],
    [RadioButtonLocation.CHOOSE_PLACE_OR_VENUE],
  ])(
    'should select %s radio button when pressing it and position is not null',
    async (locationRadioButton) => {
      const { getByTestId } = renderLocationModal({ hideLocationModal })

      const radioButton = getByTestId(locationRadioButton)
      await act(async () => {
        fireEvent.press(radioButton)
      })

      expect(radioButton.props.accessibilityState).toEqual({ checked: true })
    }
  )

  it('should log change radius when changing radius with the slider', async () => {
    mockSearchState = {
      ...initialSearchState,
      locationFilter: { locationType: LocationType.AROUND_ME, aroundRadius: MAX_RADIUS },
    }
    const { getByTestId } = renderLocationModal({ hideLocationModal })

    await act(async () => {
      const slider = getByTestId('slider').children[0] as ReactTestInstance
      slider.props.onValuesChange([50])
    })

    expect(analytics.logUseFilter).toHaveBeenCalledWith(SectionTitle.Radius)
  })

  describe('should reset', () => {
    it('the location radio group at "Partout" when pressing reset button and position is null', async () => {
      mockPosition = null
      mockSearchState = initialSearchState
      const { getByTestId, getByText } = renderLocationModal({ hideLocationModal })

      const defaultRadioButton = getByTestId(RadioButtonLocation.EVERYWHERE)
      const radioButton = getByTestId(RadioButtonLocation.CHOOSE_PLACE_OR_VENUE)
      expect(defaultRadioButton.props.accessibilityState).toEqual({ checked: true })
      expect(radioButton.props.accessibilityState).toEqual({ checked: false })

      await act(async () => {
        fireEvent.press(radioButton)
      })
      expect(defaultRadioButton.props.accessibilityState).toEqual({ checked: false })
      expect(radioButton.props.accessibilityState).toEqual({ checked: true })

      const resetButton = getByText('Réinitialiser')
      await act(async () => {
        fireEvent.press(resetButton)
      })
      expect(defaultRadioButton.props.accessibilityState).toEqual({ checked: true })
      expect(radioButton.props.accessibilityState).toEqual({ checked: false })
    })

    it('the location radio group at "Autour de moi" when pressing reset button and position is not null', async () => {
      mockSearchState = {
        ...initialSearchState,
        locationFilter: { locationType: LocationType.AROUND_ME, aroundRadius: 50 },
      }
      const { getByTestId, getByText } = renderLocationModal({ hideLocationModal })

      const defaultRadioButton = getByTestId(RadioButtonLocation.AROUND_ME)
      const radioButton = getByTestId(RadioButtonLocation.CHOOSE_PLACE_OR_VENUE)
      expect(defaultRadioButton.props.accessibilityState).toEqual({ checked: true })
      expect(radioButton.props.accessibilityState).toEqual({ checked: false })

      await act(async () => {
        fireEvent.press(radioButton)
      })
      expect(defaultRadioButton.props.accessibilityState).toEqual({ checked: false })
      expect(radioButton.props.accessibilityState).toEqual({ checked: true })

      const resetButton = getByText('Réinitialiser')
      await act(async () => {
        fireEvent.press(resetButton)
      })
      expect(radioButton.props.accessibilityState).toEqual({ checked: false })
      expect(defaultRadioButton.props.accessibilityState).toEqual({ checked: true })
    })

    // FIXME(kopax-polyconseil): aroundRadius value keep jumping from 50 to 100, if defaultValues is set to fixed value, it stop to jump,
    //  I assume there's a problem with the mock of mockSearchState.
    it.skip('the around me radius value when pressing reset button', async () => {
      mockSearchState = {
        ...initialSearchState,
        locationFilter: { locationType: LocationType.AROUND_ME, aroundRadius: 50 },
      }
      const { getByText, getByTestId, getAllByText } = renderLocationModal({ hideLocationModal })
      await act(async () => {
        expect(getByText('50\u00a0km')).toBeTruthy()
      })

      const resetButton = getByText('Réinitialiser')
      await act(async () => {
        fireEvent.press(resetButton)
      })

      const aroundMeRadioButton = getByTestId(RadioButtonLocation.AROUND_ME)
      await act(async () => {
        fireEvent.press(aroundMeRadioButton)
      })
      expect(getAllByText(`${MAX_RADIUS}\u00a0km`).length).toEqual(2)
    })

    it('should reset search input place or venue when pressing reset button', async () => {
      mockSearchState = {
        ...initialSearchState,
        locationFilter: { locationType: LocationType.PLACE, place: Kourou, aroundRadius: 10 },
      }
      const { getByPlaceholderText, getByText, getByTestId } = renderLocationModal({
        hideLocationModal,
      })

      const resetButton = getByText('Réinitialiser')
      await act(async () => {
        fireEvent.press(resetButton)
      })

      const choosePlaceOrVenueRadioButton = getByTestId(RadioButtonLocation.CHOOSE_PLACE_OR_VENUE)
      await act(async () => {
        fireEvent.press(choosePlaceOrVenueRadioButton)
      })

      await act(async () => {
        const searchInput = getByPlaceholderText(`Saisis une adresse ou le nom d’un lieu`)
        expect(searchInput.props.value).toEqual('')
      })
    })
  })

  describe('search reset', () => {
    it('should reset the location search input when pressing the reset icon', async () => {
      const locationFilter: LocationFilter = {
        locationType: LocationType.VENUE,
        venue: mockVenues[0],
      }
      mockSearchState = {
        ...mockSearchState,
        locationFilter,
      }
      const { getByTestId, getByPlaceholderText } = renderLocationModal({
        hideLocationModal,
      })

      const radioButton = getByTestId(RadioButtonLocation.CHOOSE_PLACE_OR_VENUE)
      await act(async () => {
        fireEvent.press(radioButton)
      })

      const searchInput = getByPlaceholderText(`Saisis une adresse ou le nom d’un lieu`)
      await act(async () => {
        fireEvent(searchInput, 'onFocus')
        fireEvent.changeText(searchInput, 'Paris')
      })

      expect(searchInput.props.value).toEqual('Paris')

      const venue = mockVenues[0]

      await act(async () => {
        fireEvent.press(getByTestId(keyExtractor(venue)))
      })

      await act(async () => {
        fireEvent.press(getByTestId('resetSearchInput'))
      })

      expect(searchInput.props.value).toEqual('')
    })
  })

  describe('should close the modal', () => {
    it('when pressing search button and not pristine', async () => {
      const { getByTestId } = renderLocationModal({ hideLocationModal })

      await superFlushWithAct()

      await act(async () => {
        fireEvent.press(getByTestId(RadioButtonLocation.AROUND_ME))
      })

      const searchButton = getByTestId('Rechercher')

      await act(async () => {
        fireEvent.press(searchButton)
      })

      expect(hideLocationModal).toHaveBeenCalled()
    })

    it('when pressing previous button', async () => {
      const { getByTestId } = renderLocationModal({ hideLocationModal })

      await superFlushWithAct()

      const previousButton = getByTestId('backButton')
      fireEvent.press(previousButton)

      expect(hideLocationModal).toHaveBeenCalled()
    })
  })
})

type Props = {
  hideLocationModal: () => void
}

function renderLocationModal({ hideLocationModal }: Props) {
  return render(
    <LocationModal
      title="Localisation"
      accessibilityLabel="Ne pas filtrer sur la localisation et retourner aux résultats"
      isVisible
      hideModal={hideLocationModal}
    />
  )
}
