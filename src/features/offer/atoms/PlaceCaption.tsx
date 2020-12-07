import React, { FunctionComponent } from 'react'
import styled from 'styled-components/native'

import { PlacePointer } from 'ui/svg/icons/PlacePointer'
import { getSpacing, Typo } from 'ui/theme'

type Props = {
  placeName?: string | null
  city?: string | null
}

export const PlaceCaption: FunctionComponent<Props> = ({ placeName, city }: Props) => {
  return (
    <PlaceContainer>
      <StyledView>
        <PlacePointer size={16} />
        {placeName && <StyledText numberOfLines={1}>{`${placeName}, `}</StyledText>}
      </StyledView>
      {city && <CityText numberOfLines={1}>{city}</CityText>}
    </PlaceContainer>
  )
}

const PlaceContainer = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  flexDirection: 'row',
  marginHorizontal: getSpacing(6),
})

const StyledText = styled(Typo.Caption)({
  flexShrink: 1,
  textTransform: 'capitalize',
})

const CityText = styled(Typo.Caption)({ textTransform: 'capitalize' })

const StyledView = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
})
