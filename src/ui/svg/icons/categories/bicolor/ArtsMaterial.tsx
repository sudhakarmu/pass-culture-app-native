import * as React from 'react'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'

import { IconInterface } from 'ui/svg/icons/types'
import { svgIdentifier } from 'ui/svg/utils'
import { ColorsEnum } from 'ui/theme'

export const ArtsMaterial: React.FunctionComponent<IconInterface> = ({
  size = 32,
  color = ColorsEnum.PRIMARY,
  color2,
  testID,
}) => {
  const { id: gradientId, fill: gradientFill } = svgIdentifier()

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" testID={testID}>
      <Defs>
        <LinearGradient id={gradientId} x1="20.085%" x2="79.915%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor={color ?? ColorsEnum.PRIMARY} />
          <Stop offset="100%" stopColor={color2 ?? color ?? ColorsEnum.SECONDARY} />
        </LinearGradient>
      </Defs>
      <Path
        fill={gradientFill}
        clipRule={'evenodd'}
        fillRule={'evenodd'}
        d="M8.78923 46H39.2008C40.7404 46 41.99 44.7908 42 43.3018V19.2682C42 18.7186 41.5501 18.2689 41.0003 18.2689C40.4504 18.2689 40.0006 18.7186 40.0006 19.2682V43.2918C40.0006 43.6716 39.6407 43.9914 39.2108 43.9914H39.0891C39.021 42.9726 38.6515 38.2716 37.7711 36.0668C36.5627 33.0526 34.6905 31.3996 33.2444 30.5214L33.5723 30.3507C33.9022 30.1708 34.1121 29.831 34.1121 29.4613V18.7186C34.0721 15.1311 32.8925 12.253 30.7131 10.4043C28.5537 8.57553 25.4345 7.77608 22.3354 8.24576C17.5267 8.98525 14.4276 12.7727 14.4276 17.8892V20.9071C14.4276 21.4567 14.8775 21.9064 15.4273 21.9064C15.9772 21.9064 16.427 21.4567 16.427 20.9071V17.8792C16.427 12.9326 19.6361 10.6741 22.6353 10.2144C23.585 10.0745 26.8741 9.76472 29.4134 11.9232C31.1629 13.4122 32.0727 15.7007 32.1027 18.7186V28.8517L30.5917 29.639C30.5147 29.6677 30.4417 29.7058 30.3743 29.7522L27.6339 31.1801V21.8707C27.6401 21.7768 27.6435 21.682 27.6439 21.5866V17.3795C27.6439 14.9012 25.6244 12.8826 23.1451 12.8826H22.6353C20.156 12.8826 18.1365 14.9012 18.1365 17.3795V21.5866C18.1365 22.8737 18.6812 24.0369 19.5521 24.8576C19.5078 25.6231 19.1253 26.3574 18.4119 27.051C18.288 27.1217 18.1793 27.2189 18.0952 27.3379C17.7746 27.6095 17.4017 27.8745 16.9769 28.1322L16.427 28.352V25.8037C16.427 25.2541 15.9772 24.8044 15.4273 24.8044C14.8775 24.8044 14.4276 25.2541 14.4276 25.8037V29.7857C13.6608 30.6193 13.1802 31.5406 12.9044 32.4675C12.8676 32.4952 12.8323 32.5258 12.7989 32.5592C9.39531 35.9366 9.15922 41.8524 9.19115 43.9914H8.78923C8.34935 43.9914 7.99944 43.6816 7.99944 43.2918V4.69816C7.99944 4.31842 8.34935 3.99864 8.78923 3.99864H39.2008C39.6407 3.99864 39.9906 4.31842 39.9906 4.69816V12.333C39.9906 12.8826 40.4404 13.3323 40.9903 13.3323C41.5401 13.3323 41.99 12.8826 41.99 12.333V4.69816C41.99 3.20918 40.7404 2 39.2108 2H8.78923C7.24965 2 6 3.20918 6 4.69816V43.3018C6 44.7908 7.24965 46 8.78923 46ZM31.0518 31.663L27.1041 33.7184C26.9541 33.7883 26.7942 33.8183 26.6342 33.8183C26.4543 33.8183 26.2743 33.7684 26.1143 33.6684C26.0182 33.6108 25.9345 33.5378 25.865 33.4539C24.8854 34.4258 23.4296 35.6071 21.4456 35.6071C20.9957 35.6071 20.5259 35.5471 20.026 35.4072C19.1463 35.1674 18.4565 34.6177 18.0166 33.8183C17.415 32.7241 17.3631 31.2994 17.4793 30.0883L16.763 30.3711C13.3133 32.8524 15.0179 36.997 15.0374 37.0361C15.5373 38.2153 16.737 40.2039 19.2463 40.4837C22.0702 40.7983 23.3164 42.6283 23.7234 43.9914H27.8953L27.8939 43.8514C27.8639 40.6137 27.8339 37.2559 30.903 34.8076C31.3329 34.4579 31.9627 34.5378 32.3126 34.9675C32.6525 35.3972 32.5826 36.0268 32.1527 36.3765C29.8433 38.2253 29.8633 40.7036 29.8933 43.8415L29.8948 43.9914H37.0901C36.9686 42.2877 36.5758 38.4714 35.9116 36.8163C34.4728 33.2166 31.9724 32.0028 31.0518 31.663ZM11.1896 43.9914C11.1712 42.5482 11.2818 38.9442 12.7123 36.092C12.8257 36.7734 13.0084 37.3755 13.2079 37.8455C13.7036 39.0119 14.3899 39.9917 15.2211 40.7485C14.4339 41.8951 14.1742 43.1562 14.0936 43.9914H11.1896ZM19.7818 28.5171C20.6168 27.7181 21.1588 26.849 21.4041 25.9122C21.7956 26.0238 22.2086 26.0836 22.6353 26.0836H23.1451C24.0658 26.0836 24.9217 25.8052 25.6345 25.3283V30.8658C25.4319 31.0315 25.2261 31.2464 24.9827 31.5006L24.9546 31.5299C23.695 32.849 22.4154 33.9882 20.5559 33.4785C20.196 33.3886 19.946 33.1887 19.7661 32.8589C19.1358 31.7249 19.5111 29.5693 19.7818 28.5171ZM19.0263 42.4824C20.4992 42.644 21.2179 43.3661 21.566 43.9914H16.1118C16.1878 43.4043 16.3841 42.5904 16.8813 41.8705C17.5478 42.1891 18.2674 42.3968 19.0263 42.4824ZM25.6444 17.3895V18.6878C25.6379 18.7338 25.6345 18.7808 25.6345 18.8285V21.821C25.5209 23.0951 24.4491 24.0949 23.1451 24.0949H22.6353C21.2557 24.0949 20.136 22.9757 20.136 21.5966V17.3895C20.136 16.0104 21.2557 14.8912 22.6353 14.8912H23.1451C24.5247 14.8912 25.6444 16.0104 25.6444 17.3895Z"
      />
    </Svg>
  )
}
