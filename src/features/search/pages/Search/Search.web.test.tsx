import React from 'react'

import { SearchGroupNameEnumv2 } from 'api/gen'
import { initialSearchState } from 'features/search/context/reducer'
import { LocationType } from 'features/search/enums'
import * as useFilterCountAPI from 'features/search/helpers/useFilterCount/useFilterCount'
import { Search } from 'features/search/pages/Search/Search'
import { SearchState } from 'features/search/types'
import { useNetInfoContext as useNetInfoContextDefault } from 'libs/network/NetInfoWrapper'
import { SuggestedVenue } from 'libs/venue'
import { mockedSuggestedVenues } from 'libs/venue/fixtures/mockedSuggestedVenues'
import { checkAccessibilityFor, render, waitFor } from 'tests/utils/web'

const venue: SuggestedVenue = mockedSuggestedVenues[0]

const mockSearchState: SearchState = {
  ...initialSearchState,
  offerCategories: [SearchGroupNameEnumv2.FILMS_SERIES_CINEMA],
  locationFilter: { locationType: LocationType.VENUE, venue },
  priceRange: [0, 20],
}

jest.mock('features/search/context/SearchWrapper', () => ({
  useSearch: () => ({ searchState: mockSearchState, dispatch: jest.fn() }),
}))

jest.mock('features/auth/context/AuthContext')

jest.mock('react-query')

jest.mock('features/search/api/useSearchResults/useSearchResults', () => ({
  useSearchResults: () => ({
    data: { pages: [{ nbHits: 0, hits: [], page: 0 }] },
    hits: [],
    nbHits: 0,
    isFetching: false,
    isLoading: false,
    hasNextPage: true,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
  }),
}))

jest.mock('libs/network/useNetInfo', () => jest.requireMock('@react-native-community/netinfo'))
const mockUseNetInfoContext = useNetInfoContextDefault as jest.Mock

const mockSettings = jest.fn().mockReturnValue({ data: {} })
jest.mock('features/auth/context/SettingsContext', () => ({
  useSettingsContext: jest.fn(() => mockSettings()),
}))

jest.mock('react-instantsearch-hooks', () => ({
  ...jest.requireActual('react-instantsearch-hooks'),
  useSearchBox: () => ({
    query: '',
    refine: jest.fn,
  }),
  useInfiniteHits: () => ({
    hits: [
      {
        objectID: '1',
        offer: { name: 'Test1', searchGroupName: 'MUSIQUE' },
        _geoloc: {},
      },
      {
        objectID: '2',
        offer: { name: 'Test2', searchGroupName: 'MUSIQUE' },
        _geoloc: {},
      },
    ],
  }),
}))

jest.spyOn(useFilterCountAPI, 'useFilterCount').mockReturnValue(3)
jest.mock('algoliasearch')
jest.mock('libs/algolia/analytics/InsightsMiddleware', () => ({
  InsightsMiddleware: () => null,
}))

const mockV4 = jest.fn()
jest.mock('uuid', () => ({
  v1: jest.fn(),
  v4: jest.fn(mockV4),
}))

describe('<Search/>', () => {
  mockUseNetInfoContext.mockReturnValue({ isConnected: true })

  describe('Accessibility', () => {
    it('should not have basic accessibility issues', async () => {
      mockV4
        .mockReturnValueOnce('searchInputID')
        .mockReturnValueOnce('searchInputAccessibilityDescribedByID')
      const { container } = render(<Search />)

      await waitFor(
        async () => {
          const results = await checkAccessibilityFor(container)
          expect(results).toHaveNoViolations()
        },
        { timeout: 10000 }
      )
    })
  })
})
