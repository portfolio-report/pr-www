export interface Taxonomy {
  uuid: string
  parentUuid: string | null
  rootUuid: string | null
  name: string
  code: string | null
}
