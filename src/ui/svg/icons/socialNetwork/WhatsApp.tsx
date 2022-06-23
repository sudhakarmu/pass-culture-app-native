import React from 'react'
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg'
import styled from 'styled-components/native'

import { svgIdentifier } from 'ui/svg/utils'

import { IconInterface } from '../types'

const WhatsAppSvg: React.FunctionComponent<IconInterface> = ({ size, testID }) => {
  const { id: gradientId, fill: gradientFill } = svgIdentifier()

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" testID={testID} aria-hidden>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58172 0 0 3.58172 0 8V40C0 44.4183 3.58172 48 8 48H40C44.4183 48 48 44.4183 48 40V8C48 3.58172 44.4183 0 40 0H8ZM24.5732 6.62302C29.1202 6.62498 33.388 8.39517 36.5972 11.6081C39.8065 14.821 41.5731 19.0916 41.5714 23.6332C41.5675 33.0054 33.9415 40.6312 24.5734 40.6312H24.5663C21.7215 40.6302 18.9262 39.9164 16.4435 38.5622L7.43256 40.9259L9.844 32.1178C8.35641 29.5399 7.57386 26.6157 7.575 23.6199C7.57876 14.2479 15.2041 6.62302 24.5732 6.62302ZM24.5676 37.7606H24.5734C32.3603 37.7606 38.6981 31.4226 38.7012 23.6324C38.7027 19.8573 37.2347 16.3077 34.5673 13.6372C31.9 10.9666 28.3525 9.49517 24.5791 9.49386C16.7859 9.49386 10.4481 15.8312 10.445 23.6207C10.4439 26.2904 11.1909 28.8903 12.6051 31.1395L12.941 31.6743L11.5138 36.8877L16.861 35.4852L17.377 35.7912C19.5461 37.0784 22.0326 37.7596 24.5676 37.7606ZM29.4208 25.7973C29.8102 25.9391 31.8982 26.9667 32.3229 27.1791C32.406 27.2208 32.4836 27.2583 32.5556 27.2931C32.8516 27.4362 33.0515 27.5328 33.1368 27.6752C33.243 27.8523 33.243 28.7027 32.8891 29.6949C32.5352 30.687 30.8384 31.5925 30.0223 31.7145C29.2906 31.8238 28.3648 31.8695 27.3472 31.5462C26.7303 31.3503 25.9391 31.0891 24.926 30.6515C20.9447 28.9322 18.2538 25.0734 17.7451 24.3438C17.7094 24.2926 17.6844 24.2569 17.6705 24.2383L17.6669 24.2335C17.4415 23.9327 15.9363 21.9239 15.9363 19.8447C15.9363 17.8883 16.8972 16.8628 17.3396 16.3908C17.3699 16.3584 17.3978 16.3286 17.4228 16.3014C17.8122 15.8761 18.2722 15.7698 18.5553 15.7698C18.8386 15.7698 19.122 15.7726 19.3694 15.7849C19.3999 15.7864 19.4317 15.7862 19.4645 15.786C19.712 15.7846 20.0206 15.7828 20.325 16.514C20.4422 16.7955 20.6137 17.213 20.7945 17.6532C21.1599 18.5428 21.5635 19.5254 21.6345 19.6677C21.7408 19.8802 21.8116 20.1283 21.67 20.4117C21.6487 20.4544 21.6289 20.4947 21.6101 20.5331C21.5039 20.7501 21.4257 20.9097 21.2453 21.1203C21.1741 21.2034 21.1005 21.293 21.0269 21.3826C20.881 21.5603 20.7351 21.7379 20.6081 21.8645C20.3953 22.0762 20.1741 22.306 20.4218 22.7312C20.6696 23.1566 21.522 24.5474 22.7845 25.6735C24.1425 26.8847 25.3224 27.3964 25.9202 27.6556C26.0366 27.7061 26.1309 27.747 26.2001 27.7816C26.6247 27.9944 26.8725 27.9587 27.1202 27.6755C27.368 27.3919 28.1821 26.4353 28.4652 26.0101C28.7483 25.5849 29.0316 25.6559 29.4208 25.7973Z"
        fill={gradientFill}
      />
      <Defs>
        <LinearGradient
          id={gradientId}
          x1="24"
          y1="0"
          x2="24"
          y2="48"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#61FD7D" />
          <Stop offset="100%" stopColor="#25CF43" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}

export const WhatsApp = styled(WhatsAppSvg).attrs(({ size, theme }) => ({
  size: size ?? theme.icons.sizes.standard,
}))``
