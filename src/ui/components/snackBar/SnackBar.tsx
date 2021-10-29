import React, {
  FunctionComponent,
  useRef,
  useEffect,
  RefObject,
  useCallback,
  useState,
  memo,
} from 'react'
import { useWindowDimensions } from 'react-native'
import { TouchableOpacity, View, ViewProps, ViewStyle } from 'react-native'
import { AnimatableProperties, View as AnimatableView } from 'react-native-animatable'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import { ProgressBar } from 'ui/components/snackBar/ProgressBar'
import { Close } from 'ui/svg/icons/Close'
import { IconInterface } from 'ui/svg/icons/types'
import { getSpacing, Spacer, Typo } from 'ui/theme'
import { ColorsEnum } from 'ui/theme'
import { ACTIVE_OPACITY } from 'ui/theme/colors'
import { ZIndex } from 'ui/theme/layers'

type RefType = RefObject<
  React.Component<AnimatableProperties<ViewStyle> & ViewProps, never, never> & {
    fadeOutUp: (duration: number) => Promise<void>
    fadeInDown: (duration: number) => Promise<void>
  }
> | null

export type SnackBarProps = {
  visible: boolean
  message: string
  icon: FunctionComponent<IconInterface> | undefined
  onClose?: () => void
  timeout?: number
  backgroundColor: ColorsEnum
  progressBarColor: ColorsEnum
  color: ColorsEnum
  animationDuration?: number
  refresher: number
}

const _SnackBar = (props: SnackBarProps) => {
  const Icon = props.icon
  const animationDuration = props.animationDuration || 500

  const theme = useTheme()
  const windowWidth = useWindowDimensions().width

  const containerRef: RefType = useRef(null)
  const progressBarContainerRef: RefType = useRef(null)
  const [isVisible, setVisible] = useState(props.visible)

  async function triggerApparitionAnimation() {
    setVisible(true)
    progressBarContainerRef?.current?.fadeInDown(animationDuration)
    containerRef?.current?.fadeInDown(animationDuration)
  }
  async function triggerVanishAnimation() {
    progressBarContainerRef?.current?.fadeOutUp(animationDuration)
    containerRef?.current?.fadeOutUp(animationDuration).then(() => {
      setVisible(false)
    })
  }

  const onClose = useCallback(() => props.onClose?.(), [])

  // Visibility effect
  useEffect(() => {
    if (props.refresher <= 0) {
      return
    }
    const shouldDisplay = props.visible && !isVisible
    const shouldHide = !props.visible && isVisible
    if (shouldDisplay) {
      triggerApparitionAnimation()
    }
    if (shouldHide) {
      triggerVanishAnimation()
    }
    // Timeout section: We want to reset the timer when props are changed
    if (!props.timeout || !props.onClose || shouldHide) {
      return
    }
    const timeout = setTimeout(props.onClose, props.timeout)
    return () => clearTimeout(timeout)
  }, [props.refresher])

  const { top } = useSafeAreaInsets()

  function renderProgressBar() {
    return (
      <AnimatableView easing="ease" duration={animationDuration} ref={progressBarContainerRef}>
        {isVisible && props.timeout ? (
          <ProgressBar
            color={props.progressBarColor}
            timeout={props.timeout}
            refresher={props.refresher}
          />
        ) : null}
      </AnimatableView>
    )
  }

  return (
    <RootContainer>
      {theme.isDesktop && renderProgressBar()}
      <ColoredAnimatableView
        testID="snackbar-view"
        backgroundColor={props.backgroundColor}
        easing="ease"
        duration={animationDuration}
        ref={containerRef}>
        <SnackBarContainer isVisible={isVisible} marginTop={top} testID="snackbar-container">
          {!!Icon && <Icon testID="snackbar-icon" size={32} color={props.color} />}
          <Spacer.Flex flex={1}>
            <Text windowWidth={windowWidth} testID="snackbar-message" color={props.color}>
              {props.message}
            </Text>
          </Spacer.Flex>
          <TouchableOpacity
            testID="snackbar-close"
            onPress={onClose}
            activeOpacity={ACTIVE_OPACITY}>
            <Close size={28} color={props.color} />
          </TouchableOpacity>
        </SnackBarContainer>
      </ColoredAnimatableView>
      {!theme.isDesktop && renderProgressBar()}
    </RootContainer>
  )
}

export const SnackBar = memo(_SnackBar)

const RootContainer = styled(View)(({ theme }) => ({
  position: 'absolute',
  top: theme.isDesktop ? 'auto' : 0,
  bottom: theme.isDesktop ? 0 : 'auto',
  left: 0,
  right: 0,
  zIndex: ZIndex.SNACKBAR,
}))

// Troobleshoot Animated types issue with forwaded 'backgroundColor' prop
const ColoredAnimatableView = styled(AnimatableView)<{ backgroundColor: ColorsEnum }>((props) => ({
  backgroundColor: props.backgroundColor,
}))

const SnackBarContainer = styled.View<{ isVisible: boolean; marginTop: number }>(
  ({ isVisible, marginTop }) => ({
    marginTop,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: getSpacing(2) - marginTop,
    paddingBottom: getSpacing(2),
    paddingHorizontal: getSpacing(5),
    display: isVisible ? 'flex' : 'none',
  })
)

const Text = styled(Typo.Body)<{ color: string; windowWidth: number }>((props) => ({
  color: props.color,
  marginLeft: getSpacing(3),
  flexGrow: 0,
  maxWidth: props.windowWidth - getSpacing(20),
  flexWrap: 'wrap',
}))
