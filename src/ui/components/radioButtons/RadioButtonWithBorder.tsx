import React, { useRef } from 'react'
import styled from 'styled-components/native'

import { AccessibilityRole } from 'libs/accessibilityRole/accessibilityRole'
import { TouchableOpacity } from 'ui/components/TouchableOpacity'
import { useArrowNavigationForRadioButton } from 'ui/hooks/useArrowNavigationForRadioButton'
import { Validate as DefaultValidate } from 'ui/svg/icons/Validate'
import { getSpacing, Typo } from 'ui/theme'
interface Props {
  selected: boolean
  description?: string | null
  label: string
  onPress: (name: string) => void
}

export const RadioButtonWithBorder = ({ label, description, selected, onPress }: Props) => {
  const containerRef = useRef(null)
  useArrowNavigationForRadioButton(containerRef)

  return (
    <Label
      accessibilityRole={AccessibilityRole.RADIO}
      accessibilityState={{ checked: selected }}
      selected={selected}
      onPress={() => onPress(label)}>
      <TextContainer ref={containerRef}>
        <ButtonText selected={selected}>{label}</ButtonText>
        {description ? <Caption>{description}</Caption> : null}
      </TextContainer>
      {selected ? (
        <IconContainer>
          <Validate />
        </IconContainer>
      ) : null}
    </Label>
  )
}

const Validate = styled(DefaultValidate).attrs(({ theme }) => ({
  color: theme.colors.primary,
  size: theme.icons.sizes.small,
}))``

const Label = styled(TouchableOpacity)<{ selected: boolean }>(({ theme, selected }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  borderColor: selected ? theme.colors.primary : theme.colors.greyDark,
  borderRadius: theme.borderRadius.button,
  borderWidth: 1,
  marginBottom: getSpacing(4),
  width: '100%',
  height: getSpacing(12),
}))

const TextContainer = styled.View({
  flex: 1,
  alignItems: 'center',
})

const IconContainer = styled.View({
  position: 'absolute',
  right: getSpacing(3),
})

const ButtonText = styled(Typo.ButtonText)<{ selected: boolean }>(({ selected, theme }) => ({
  color: selected ? theme.colors.primary : theme.colors.black,
}))

const Caption = styled(Typo.Caption)(({ theme }) => ({
  color: theme.colors.greyDark,
}))
