import {avisVoyageursType} from './avisVoyageursType'
import {blockContent} from './blockContent'
import {entrepriseType} from './entrepriseType'
import {homePageType} from './homePageType'
import {checkoutType} from './checkoutType'
import {ctasType} from './ctasType'
import {devisType} from './devisType'
import {categoryType} from './categoryType'
import {blogType} from './blogType'
import {destinationType} from './destinationType'
import {experienceType} from './experienceType'
import {faqType} from './faqType'
import {footerType} from './footerType'
import {headerType} from './headerType'
import {pageBlogType} from './pageBlogType'
import {pageContactType} from './pageContactType'
import {pageExperiencesType} from './pageExperiencesType'
import {pageThematiquesType} from './pageThematiquesType'
import {pageVoyageType} from './pageVoyageType'
import {newsletterType} from './newsletterType'
import {partnerType} from './partnerType'
import {privacyPolicyType} from './privacyPolicyType'
import {recruitmentType} from './recruitmentType'
import {legalMentionsType} from './legalMentionsType'
import {chequesVacancesType} from './chequesVacancesType'
import {conditionsGeneralesVenteType} from './conditionsGeneralesVenteType'
import {confirmationType} from './confirmationType'
import {offreCadeauType} from './offreCadeauType'
import {surMesureType} from './surMesureType'
import {visionVoyageOdyswayType} from './visionVoyageOdyswayType'
import {regionType} from './regionType'
import {reviewType} from './reviewType'
import {searchPageType} from './searchPageType'
import {teamMemberType} from './teamMemberType'
import {topsType} from './topsType'
import {voyageCardType} from './voyageCardType'
import {voyageType} from './voyageType'

// Reusable objects
import {seoFields} from './objects/seoFields'

export const schemaTypes = [
  // Reusable objects must be registered first
  seoFields,
  
  // Document types
  avisVoyageursType,
  blockContent,
  blogType,
  categoryType,
  checkoutType,
  chequesVacancesType,
  conditionsGeneralesVenteType,
  confirmationType,
  ctasType,
  devisType,
  destinationType,
  entrepriseType,
  experienceType,
  faqType,
  footerType,
  headerType,
  homePageType,
  legalMentionsType,
  newsletterType,
  offreCadeauType,
  pageBlogType,
  pageContactType,
  pageExperiencesType,
  pageThematiquesType,
  pageVoyageType,
  partnerType,
  privacyPolicyType,
  recruitmentType,
  regionType,
  reviewType,
  searchPageType,
  surMesureType,
  teamMemberType,
  topsType,
  visionVoyageOdyswayType,
  voyageCardType,
  voyageType,
]