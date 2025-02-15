import { rest } from 'msw'
import React from 'react'
import { mocked } from 'ts-jest/utils'

import { navigate, useRoute } from '__mocks__/@react-navigation/native'
import { OfferStockResponse } from 'api/gen'
import { BookingState, initialBookingState, Step } from 'features/bookOffer/context/reducer'
import { mockDigitalOffer, mockOffer } from 'features/bookOffer/fixtures/offer'
import { useBookingOffer } from 'features/bookOffer/helpers/useBookingOffer'
import { useBookingStock } from 'features/bookOffer/helpers/useBookingStock'
import { IBookingContext } from 'features/bookOffer/types'
import { offerStockResponseSnap } from 'features/offer/fixtures/offerStockResponse'
import { useIsUserUnderage } from 'features/profile/helpers/useIsUserUnderage'
import * as logOfferConversionAPI from 'libs/algolia/analytics/logOfferConversion'
import { campaignTracker, CampaignEvents } from 'libs/campaign'
import { env } from 'libs/environment'
import { analytics } from 'libs/firebase/analytics'
import { reactQueryProviderHOC } from 'tests/reactQueryProviderHOC'
import { server } from 'tests/server'
import { fireEvent, render, waitFor } from 'tests/utils'
import { SnackBarHelperSettings } from 'ui/components/snackBar/types'

import { BookingDetails } from './BookingDetails'

const mockDismissModal = jest.fn()
const mockDispatch = jest.fn()

const mockInitialBookingState = initialBookingState

let mockBookingStock = {
  price: 2000,
  id: 148409,
  beginningDatetime: '2021-03-02T20:00:00',
} as ReturnType<typeof useBookingStock>

const mockOfferId = 1337
const mockUseBookingContext: jest.Mock<IBookingContext> = jest.fn()
mockUseBookingContext.mockReturnValue({
  bookingState: { quantity: 1, offerId: mockOfferId } as BookingState,
  dismissModal: mockDismissModal,
  dispatch: mockDispatch,
})
jest.mock('features/bookOffer/context/useBookingContext', () => ({
  useBookingContext: () => mockUseBookingContext(),
}))

jest.mock('features/bookOffer/helpers/useBookingStock', () => ({
  useBookingStock: jest.fn(() => mockBookingStock),
}))
jest.mock('features/bookOffer/helpers/useBookingOffer', () => ({
  useBookingOffer: jest.fn(),
}))
const mockUseBookingOffer = mocked(useBookingOffer)
mockUseBookingOffer.mockReturnValue({ ...mockOffer, isDuo: false })

const mockShowErrorSnackBar = jest.fn()
jest.mock('ui/components/snackBar/SnackBarContext', () => ({
  useSnackBarContext: () => ({
    showErrorSnackBar: jest.fn((props: SnackBarHelperSettings) => mockShowErrorSnackBar(props)),
  }),
  SNACK_BAR_TIME_OUT: 5000,
}))

const mockStocks = mockOffer.stocks
const mockDigitalStocks = mockDigitalOffer.stocks

jest.mock('features/profile/helpers/useIsUserUnderage')
const mockedUseIsUserUnderage = mocked(useIsUserUnderage)

const mockUseSubcategoriesMapping = jest.fn()
jest.mock('libs/subcategories', () => ({
  useSubcategoriesMapping: jest.fn(() => mockUseSubcategoriesMapping()),
}))
mockUseSubcategoriesMapping.mockReturnValue({
  EVENEMENT_PATRIMOINE: { isEvent: true },
})

const spyLogOfferConversion = jest.fn()
jest
  .spyOn(logOfferConversionAPI, 'useLogOfferConversion')
  .mockReturnValue({ logOfferConversion: spyLogOfferConversion })

describe('<BookingDetails />', () => {
  describe('with initial state', () => {
    beforeEach(() => {
      mockUseBookingContext.mockReturnValueOnce({
        bookingState: mockInitialBookingState,
        dismissModal: mockDismissModal,
        dispatch: mockDispatch,
      })
    })

    it('should initialize correctly state when offer isDigital', async () => {
      mockBookingStock = undefined

      await renderBookingDetails(mockDigitalStocks)
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SELECT_STOCK', payload: 148401 })
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SELECT_QUANTITY', payload: 1 })
    })

    it('should initialize the state when offer isDigital only with first bookable stocks', async () => {
      mockBookingStock = undefined

      await renderBookingDetails([{ ...offerStockResponseSnap, isBookable: false, id: 123456 }])
      expect(mockDispatch).not.toHaveBeenCalled()

      await renderBookingDetails([
        { ...offerStockResponseSnap, isBookable: false, id: 123456 },
        { ...offerStockResponseSnap, isBookable: true, id: 1234567 },
        { ...offerStockResponseSnap, isBookable: true, id: 12345678 },
      ])
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SELECT_STOCK', payload: 1234567 })
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SELECT_QUANTITY', payload: 1 })
      expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'SELECT_STOCK', payload: 12345678 })
    })

    it('should not display the Duo selector when the offer is not duo', () => {
      const { queryByTestId } = renderBookingDetails(mockDigitalStocks)

      expect(queryByTestId('DuoChoiceSelector')).toBeNull()
    })
  })

  describe('when user has selected options', () => {
    beforeEach(() => {
      mockUseBookingContext.mockReturnValueOnce({
        bookingState: { quantity: 1, offerId: mockOfferId } as BookingState,
        dismissModal: mockDismissModal,
        dispatch: mockDispatch,
      })
    })

    it('should render correctly when offer is an event', async () => {
      mockBookingStock = {
        price: 2000,
        id: 148409,
        beginningDatetime: '2021-03-02T20:00:00',
      } as ReturnType<typeof useBookingStock>

      const page = await renderBookingDetails(mockStocks)
      expect(page).toMatchSnapshot()
    })
    it('should render disable CTA when user is underage and stock is forbidden to underage', async () => {
      mockBookingStock = {
        price: 2000,
        id: 148409,
        beginningDatetime: '2021-03-02T20:00:00',
        isForbiddenToUnderage: true,
      } as ReturnType<typeof useBookingStock>
      mockedUseIsUserUnderage.mockReturnValueOnce(true)
      const page = await renderBookingDetails(mockStocks)
      expect(page).toMatchSnapshot()
    })

    it('should dismiss modal on successfully booking an offer', async () => {
      server.use(
        rest.post(`${env.API_BASE_URL}/native/v1/bookings`, (req, res, ctx) => res(ctx.status(204)))
      )

      const { getByText } = renderBookingDetails(mockStocks)

      const ConfirmButton = getByText('Confirmer la réservation')
      fireEvent.press(ConfirmButton)

      await waitFor(() => {
        expect(mockDismissModal).toHaveBeenCalledTimes(1)
        expect(analytics.logBookingConfirmation).toHaveBeenCalledWith(
          mockOfferId,
          undefined,
          undefined
        )
        expect(campaignTracker.logEvent).toHaveBeenCalledWith(CampaignEvents.COMPLETE_BOOK_OFFER, {
          af_offer_id: mockOffer.id,
          af_booking_id: mockBookingStock?.id,
          af_price: mockBookingStock?.price,
          af_category: mockOffer.subcategoryId,
        })
        expect(navigate).toHaveBeenCalledWith('BookingConfirmation', { offerId: mockOfferId })
      })
    })

    it('should log the origin offer when booked an offer from similar offers', async () => {
      useRoute.mockReturnValueOnce({
        params: { fromOfferId: 1 },
      })
      server.use(
        rest.post(`${env.API_BASE_URL}/native/v1/bookings`, (req, res, ctx) => res(ctx.status(204)))
      )

      const page = render(
        // eslint-disable-next-line local-rules/no-react-query-provider-hoc
        reactQueryProviderHOC(<BookingDetails stocks={mockStocks} />)
      )

      fireEvent.press(page.getByText('Confirmer la réservation'))

      await waitFor(() => {
        expect(analytics.logBookingConfirmation).toHaveBeenCalledWith(mockOfferId, undefined, 1)
      })
    })

    it('should log to algolia conversion when successfully booking an offer and coming from search page', async () => {
      useRoute.mockReturnValueOnce({ params: { from: 'search' } })

      server.use(
        rest.post(`${env.API_BASE_URL}/native/v1/bookings`, (req, res, ctx) => res(ctx.status(204)))
      )

      const { getByText } = renderBookingDetails(mockStocks)

      const ConfirmButton = getByText('Confirmer la réservation')
      fireEvent.press(ConfirmButton)

      await waitFor(() => {
        expect(spyLogOfferConversion).toHaveBeenCalledWith('1337')
      })
    })

    it('should not log to algolia conversion when booking an offer but not coming from search page', async () => {
      server.use(
        rest.post(`${env.API_BASE_URL}/native/v1/bookings`, (req, res, ctx) => res(ctx.status(204)))
      )

      const { getByText } = renderBookingDetails(mockStocks)

      const ConfirmButton = getByText('Confirmer la réservation')
      fireEvent.press(ConfirmButton)

      await waitFor(() => {
        expect(spyLogOfferConversion).not.toHaveBeenCalled()
      })
    })

    it.each`
      code                     | message
      ${undefined}             | ${'En raison d’une erreur technique, l’offre n’a pas pu être réservée'}
      ${'INSUFFICIENT_CREDIT'} | ${'Attention, ton crédit est insuffisant pour pouvoir réserver cette offre\u00a0!'}
      ${'ALREADY_BOOKED'}      | ${'Attention, il est impossible de réserver plusieurs fois la même offre\u00a0!'}
      ${'STOCK_NOT_BOOKABLE'}  | ${'Oups, cette offre n’est plus disponible\u00a0!'}
    `(
      'should show the error snackbar with message="$message" for errorCode="$code" if booking an offer fails',
      async ({ code, message }: { code: string | undefined; message: string }) => {
        const response = code ? { code } : {}

        server.use(
          rest.post(`${env.API_BASE_URL}/native/v1/bookings`, (req, res, ctx) =>
            res(ctx.status(400), ctx.json(response))
          )
        )

        const { getByText } = renderBookingDetails(mockStocks)

        const ConfirmButton = getByText('Confirmer la réservation')
        fireEvent.press(ConfirmButton)

        await waitFor(() => {
          expect(mockShowErrorSnackBar).toHaveBeenCalledTimes(1)
          expect(mockShowErrorSnackBar).toHaveBeenCalledWith({ timeout: 5000, message })
        })
      }
    )

    it('should log booking error when error is known', async () => {
      const response = { code: 'INSUFFICIENT_CREDIT' }

      server.use(
        rest.post(`${env.API_BASE_URL}/native/v1/bookings`, (req, res, ctx) =>
          res(ctx.status(400), ctx.json(response))
        )
      )

      const { getByText } = renderBookingDetails(mockStocks)

      const ConfirmButton = getByText('Confirmer la réservation')
      fireEvent.press(ConfirmButton)

      await waitFor(() => {
        expect(analytics.logBookingError).toHaveBeenCalledTimes(1)
        expect(analytics.logBookingError).toHaveBeenCalledWith(mockOfferId, 'INSUFFICIENT_CREDIT')
      })
    })

    it('should log booking error when error is unknown', async () => {
      const response = {}

      server.use(
        rest.post(`${env.API_BASE_URL}/native/v1/bookings`, (req, res, ctx) =>
          res(ctx.status(400), ctx.json(response))
        )
      )

      const { getByText } = renderBookingDetails(mockStocks)

      const ConfirmButton = getByText('Confirmer la réservation')
      fireEvent.press(ConfirmButton)

      await waitFor(() => {
        expect(analytics.logBookingError).not.toHaveBeenCalled()
      })
    })
  })

  it('should change step to confirmation when step is date and offer is not an event', async () => {
    mockUseBookingContext.mockReturnValueOnce({
      bookingState: mockInitialBookingState,
      dismissModal: mockDismissModal,
      dispatch: mockDispatch,
    })
    mockUseBookingOffer.mockReturnValueOnce(mockDigitalOffer)
    await renderBookingDetails(mockDigitalStocks)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CHANGE_STEP', payload: Step.CONFIRMATION })
  })

  it('should not change step to confirmation when step is date and offer is an event', async () => {
    mockUseBookingContext.mockReturnValueOnce({
      bookingState: mockInitialBookingState,
      dismissModal: mockDismissModal,
      dispatch: mockDispatch,
    })
    mockUseBookingOffer.mockReturnValueOnce(mockOffer)
    await renderBookingDetails(mockStocks)
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: 'CHANGE_STEP',
      payload: Step.CONFIRMATION,
    })
  })

  describe('duo selector', () => {
    beforeEach(() => {
      const duoBookingState: BookingState = {
        ...mockInitialBookingState,
        quantity: 2,
      }
      mockUseBookingContext.mockReturnValueOnce({
        bookingState: duoBookingState,
        dismissModal: mockDismissModal,
        dispatch: mockDispatch,
      })
    })

    it('should not display the Duo selector when the offer is duo but is an event', () => {
      mockUseBookingOffer.mockReturnValueOnce({ ...mockOffer, isDuo: true })

      mockUseSubcategoriesMapping.mockReturnValueOnce({
        EVENEMENT_PATRIMOINE: { isEvent: true },
      })

      const { queryByTestId } = renderBookingDetails(mockDigitalStocks)

      expect(queryByTestId('DuoChoiceSelector')).toBeNull()
    })

    it('should display the Duo selector when the offer is duo and not an event', () => {
      mockUseBookingOffer.mockReturnValueOnce({ ...mockOffer, isDuo: true })

      mockUseSubcategoriesMapping.mockReturnValueOnce({
        EVENEMENT_PATRIMOINE: { isEvent: false },
      })

      const { queryByTestId } = renderBookingDetails(mockDigitalStocks)

      expect(queryByTestId('DuoChoiceSelector')).toBeTruthy()
    })
  })
})

const renderBookingDetails = (stocks: OfferStockResponse[]) =>
  render(
    // eslint-disable-next-line local-rules/no-react-query-provider-hoc
    reactQueryProviderHOC(<BookingDetails stocks={stocks} />)
  )
