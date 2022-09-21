export interface SecurityTaxonomy {
  taxonomyUuid: string
  rootTaxonomyUuid: string
  weight: string
}

export interface EditSecurityTaxonomy {
  taxonomyUuid: string | null
  weight: string
}
