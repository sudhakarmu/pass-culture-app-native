import { flatten } from 'lodash'

import { SearchParameters } from 'features/search/types'
import { useTransformAlgoliaHits } from 'libs/algolia/fetchAlgolia'
import { SearchHit } from 'libs/search'
import { client } from 'libs/search/client'
import { buildQueryOptions, AppSearchFields } from 'libs/search/filters'
import { buildAlgoliaHit } from 'libs/search/utils/buildAlgoliaHit'

const fetchMultipleHits = (parametersList: SearchParameters[]): Promise<{ hits: SearchHit[] }> => {
  const queries = parametersList.map((params) => ({
    query: '',
    options: buildQueryOptions(params),
  }))

  return client.multiSearch<AppSearchFields>(queries).then((allResults) => {
    const searchHits = allResults.map((results) => results.results)
    const hits = searchHits.flatMap((results) => results.map(buildAlgoliaHit))

    return { hits: flatten(hits) }
  })
}

// We don't want to display offers without image
const filterHits = (hit: SearchHit): boolean => hit && hit.offer && !!hit.offer.thumbUrl

export const useSearchMultipleHits = () => {
  const transformHits = useTransformAlgoliaHits()

  return {
    fetchMultipleHits,
    filterHits,
    transformHits,
  }
}
