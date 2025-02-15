import React from 'react'

import { render, fireEvent } from 'tests/utils/web'
import { Close } from 'ui/svg/icons/Close'
import { Logo as InitialLoadingIndicator } from 'ui/svg/icons/Logo'
import { Typo } from 'ui/theme'

import { AppButton } from './AppButton'

const baseProps = {
  title: Typo.ButtonText,
  loadingIndicator: InitialLoadingIndicator,
  wording: 'Testing Disabled',
  icon: Close,
}

describe('AppButton Component', () => {
  describe('* Icon property', () => {
    it('should display icon when provided', () => {
      const { queryByTestId } = render(<AppButton {...baseProps} />)
      expect(queryByTestId('button-icon')).toBeTruthy()
    })
    it('should not display icon when not provided', () => {
      const { queryByTestId } = render(<AppButton {...baseProps} icon={undefined} />)
      expect(queryByTestId('button-icon')).toBeFalsy()
    })
  })
  describe('* isLoading property', () => {
    it('should display right elements when isLoading equals true', () => {
      const { queryByTestId } = render(<AppButton {...baseProps} isLoading />)
      expect(queryByTestId('Chargement en cours')).toBeTruthy()
      expect(queryByTestId('button-icon')).toBeFalsy()
    })
    it('should display right elements when isLoading equals false', () => {
      const { queryByTestId } = render(<AppButton {...baseProps} isLoading={false} />)
      expect(queryByTestId('button-icon')).toBeTruthy()
      expect(queryByTestId('Chargement en cours')).toBeFalsy()
    })
  })
  describe('* Disabled property', () => {
    it('should disable handlers when disabled equals true', () => {
      const onPress = jest.fn()
      const onLongPress = jest.fn()
      const { getByText, rerender } = render(
        <AppButton {...baseProps} disabled onPress={onPress} onLongPress={onLongPress} />
      )

      const button = getByText('Testing Disabled')
      fireEvent.click(button)
      fireEvent.doubleClick(button)

      expect(onPress).not.toHaveBeenCalled()
      expect(onLongPress).not.toHaveBeenCalled()

      rerender(<AppButton {...baseProps} onPress={onPress} onLongPress={onLongPress} />)

      fireEvent.click(button)
      fireEvent.doubleClick(button)

      expect(onPress).toHaveBeenCalledTimes(1)
      expect(onLongPress).toHaveBeenCalledTimes(1)
    })
  })
  describe('* inline property', () => {
    it('should use inline css style when true', () => {
      const renderAPI = render(<AppButton {...baseProps} wording="Testing inline" inline />)
      expect(renderAPI).toMatchSnapshot()
    })
  })
  describe('* html tag and type attribute', () => {
    it('should render button tag of type button by default', () => {
      const { getByTestId } = render(<AppButton {...baseProps} testID="button" />)
      const button = getByTestId('Testing Disabled')
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.getAttribute('type')).toBe('button')
    })
    it('should render anchor tag without type if component is an anchor', () => {
      const href = 'https://example.link/'
      const { getByTestId } = render(<AppButton {...baseProps} testID="link" href={href} />)
      const link = getByTestId('Testing Disabled')
      expect(link.tagName.toLowerCase()).toBe('a')
      expect(link.getAttribute('href')).toBe(href)
      expect(link.getAttribute('type')).toBeNull()
    })
  })
})
