import { addDays, formatISO } from 'date-fns'
import mockdate from 'mockdate'
import React from 'react'

import { navigate } from '__mocks__/@react-navigation/native'
import { SubcategoryIdEnum, WithdrawalTypeEnum } from 'api/gen'
import { bookingsSnap } from 'features/bookings/fixtures/bookingsSnap'
import { Booking } from 'features/bookings/types'
import { fireEvent, render } from 'tests/utils'

import { OnGoingBookingItem } from './OnGoingBookingItem'

describe('OnGoingBookingItem', () => {
  const bookings = bookingsSnap.ongoing_bookings
  const initialBooking: Booking = bookingsSnap.ongoing_bookings[0]

  it('should navigate to the booking details page', () => {
    const { getByTestId } = renderOnGoingBookingItem(initialBooking)

    const item = getByTestId(/Réservation de l’offre/)
    fireEvent.press(item)

    expect(navigate).toHaveBeenCalledWith('BookingDetails', { id: 123 })
  })

  describe('should be on site withdrawal ticket event', () => {
    const booking = {
      ...initialBooking,
      stock: {
        ...initialBooking.stock,
        beginningDatetime: formatISO(addDays(new Date(), 1)).slice(0, -1),
        offer: {
          ...initialBooking.stock.offer,
          subcategoryId: SubcategoryIdEnum.CONCERT,
          withdrawalType: WithdrawalTypeEnum.on_site,
        },
      },
    }

    it('should display withdrawal reminder', () => {
      const { getByTestId } = renderOnGoingBookingItem(booking)

      expect(getByTestId('on-site-withdrawal-container')).toBeTruthy()
    })

    it('should not display event reminder', () => {
      const { queryByTestId } = renderOnGoingBookingItem(booking)
      expect(queryByTestId('withdraw-container')).toBeNull()
    })
  })

  describe('should not be on site withdrawal ticket event', () => {
    const booking = {
      ...initialBooking,
      stock: {
        ...initialBooking.stock,
        beginningDatetime: formatISO(addDays(new Date(), 1)).slice(0, -1),
        offer: {
          ...initialBooking.stock.offer,
          subcategoryId: SubcategoryIdEnum.CONCERT,
          withdrawalType: WithdrawalTypeEnum.no_ticket,
        },
      },
    }

    it('should not display withdrawal reminder', () => {
      const { queryByTestId } = renderOnGoingBookingItem(booking)
      expect(queryByTestId('on-site-withdrawal-container')).toBeNull()
    })

    it('should display event reminder', () => {
      const { getByTestId } = renderOnGoingBookingItem(booking)
      expect(getByTestId('withdraw-container')).toBeTruthy()
    })
  })

  describe('should display expiration messages', () => {
    afterAll(() => {
      mockdate.set(new Date())
    })
    it('should display expiration message : "Ta réservation s\'archivera dans XX jours"', () => {
      mockdate.set(new Date('2021-02-20T00:00:00Z'))
      const booking = {
        ...initialBooking,
        expirationDate: null,
        stock: {
          ...initialBooking.stock,
          offer: {
            ...initialBooking.stock.offer,
            isDigital: true,
          },
        },
      }
      const { getByText } = renderOnGoingBookingItem(booking, bookings)

      expect(getByText('Ta réservation s’archivera dans 25 jours')).toBeTruthy()
    })

    it('should display any expiration messages"', () => {
      mockdate.set(new Date('2021-03-18T00:00:00Z'))
      const booking = {
        ...initialBooking,
        expirationDate: null,
        stock: {
          ...initialBooking.stock,
          offer: {
            ...initialBooking.stock.offer,
            isDigital: false,
          },
        },
      }
      const { queryByTestId } = renderOnGoingBookingItem(booking, bookings)

      expect(queryByTestId('expiration-booking-container')).toBeNull()
    })
  })
})

function renderOnGoingBookingItem(
  booking: Booking,
  digitalBookingWithoutExpirationDate?: Booking[]
) {
  return render(
    <OnGoingBookingItem
      booking={booking}
      digitalBookingWithoutExpirationDate={digitalBookingWithoutExpirationDate}
    />
  )
}
