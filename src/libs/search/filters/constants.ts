import { ResultFields } from '@elastic/app-search-javascript'

// List of fields stored in AppSearch
export enum AppSearchFields {
  author = 'author',
  category = 'category',
  ranking_weight = 'ranking_weight',
  date_created = 'date_created',
  dates = 'dates',
  description = 'description',
  id = 'id',
  isbn = 'isbn',
  is_digital = 'is_digital',
  is_duo = 'is_duo',
  is_event = 'is_event',
  is_thing = 'is_thing',
  label = 'label',
  music_type = 'music_type',
  name = 'name',
  performer = 'performer',
  prices = 'prices',
  price_min = 'price_min',
  price_max = 'price_max',
  show_type = 'show_type',
  speaker = 'speaker',
  stage_director = 'stage_director',
  stocks_date_created = 'stocks_date_created',
  tags = 'tags',
  times = 'times',
  thumb_url = 'thumb_url',
  type = 'type',
  offerer_name = 'offerer_name',
  city = 'city',
  venue_departement_code = 'venue_departement_code',
  venue_name = 'venue_name',
  venue_public_name = 'venue_public_name',
  geoloc = 'geoloc',
  object_id = 'object_id',
}

// We don't use all the fields indexed. Simply retrieve the one we use.
export const result_fields: ResultFields<AppSearchFields> = {
  [AppSearchFields.category]: { raw: {} },
  [AppSearchFields.dates]: { raw: {} },
  [AppSearchFields.description]: { raw: {} },
  [AppSearchFields.is_digital]: { raw: {} },
  [AppSearchFields.is_duo]: { raw: {} },
  [AppSearchFields.name]: { raw: {} },
  [AppSearchFields.prices]: { raw: {} },
  [AppSearchFields.thumb_url]: { raw: {} },
  [AppSearchFields.object_id]: { raw: {} },
  [AppSearchFields.geoloc]: { raw: {} },
}
