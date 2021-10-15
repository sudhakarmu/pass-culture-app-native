import { t } from '@lingui/macro'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import styled from 'styled-components/native'

import { UseNavigationType } from 'features/navigation/RootNavigator'
import { homeNavConfig } from 'features/navigation/TabBar/helpers'
import { useGoBack } from 'features/navigation/useGoBack'
import { ModalHeader } from 'ui/components/modals/ModalHeader'
import { ArrowPrevious } from 'ui/svg/icons/ArrowPrevious'
import { ColorsEnum, getSpacing, Spacer, Typo } from 'ui/theme'

export const CheatMenu: React.FC = () => {
  const { navigate } = useNavigation<UseNavigationType>()
  const { goBack } = useGoBack(...homeNavConfig)
  return (
    <Container>
      <Spacer.TopScreen />
      <ModalHeader
        title="Cheater Zone"
        leftIconAccessibilityLabel="Revenir en arrière"
        leftIcon={ArrowPrevious}
        onLeftIconPress={goBack}
        rightIconAccessibilityLabel={undefined}
        rightIcon={undefined}
        onRightIconPress={undefined}
      />
      <Spacer.Flex />
      <React.Fragment>
        <Spacer.Column numberOfSpaces={8} />
        <CheatTouchableOpacity onPress={() => navigate('AppComponents')}>
          <Typo.Body>{t`Composants`}</Typo.Body>
        </CheatTouchableOpacity>
        <Spacer.Column numberOfSpaces={8} />
        <CheatTouchableOpacity onPress={() => navigate('Navigation')}>
          <Typo.Body>{t`Navigation`}</Typo.Body>
        </CheatTouchableOpacity>
      </React.Fragment>
      <Spacer.Flex />
    </Container>
  )
}

const Container = styled.View({ flex: 1, alignItems: 'center' })

const CheatTouchableOpacity = styled.TouchableOpacity({
  borderColor: ColorsEnum.BLACK,
  borderWidth: 2,
  padding: getSpacing(1),
})
