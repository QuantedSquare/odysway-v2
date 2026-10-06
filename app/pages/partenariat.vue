<template>
  <div
    v-if="page"
    class="partenariat-page"
  >
    <!-- ================= HERO ================= -->
    <header class="hero on-photo">
      <div class="photo">
        <PartenariatPhoto
          :image="page.hero?.image"
          sizes="100vw"
          eager
        />
      </div>
      <svg
        class="contours"
        viewBox="0 0 1400 760"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs><path
          id="pp-ridge"
          d="M-160,600 C 120,430 300,556 470,392 S 790,206 1010,306 S 1290,470 1580,338"
        /></defs>
        <g
          fill="none"
          stroke="currentColor"
          stroke-width="1.15"
          stroke-linecap="round"
        >
          <use
            v-for="(l, i) in ridges"
            :key="i"
            href="#pp-ridge"
            :y="l.y"
            :opacity="l.o"
          />
        </g>
      </svg>

      <div class="wrap hero-in">
        <h1>{{ page.hero?.title }}</h1>
        <p
          v-for="(lead, i) in page.hero?.leads"
          :key="i"
          class="hero-lead"
        >
          {{ lead }}
        </p>
        <p
          v-if="page.hero?.punch"
          class="hero-punch"
        >
          {{ page.hero.punch }}
        </p>
        <div
          v-if="page.hero?.ctaText"
          class="hero-cta"
        >
          <a
            class="btn btn-primary"
            href="#contact"
            @click.prevent="goTo('contact', 'partenariat-hero')"
          >{{ page.hero.ctaText }}</a>
        </div>
      </div>

      <div
        v-if="page.hero?.trustItems?.length"
        class="wrap trustbar"
      >
        <ul class="trust-in">
          <li
            v-for="(item, i) in page.hero.trustItems"
            :key="i"
          >
            <b>{{ item.value }}</b><span>{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </header>

    <!-- ================= SOUS-NAV ================= -->
    <nav
      ref="subnavEl"
      class="subnav"
      :style="{ top: `${subnavTop}px` }"
      aria-label="Sections de la page"
    >
      <div class="wrap subnav-in">
        <span
          v-if="page.subnav?.label"
          class="subnav-label"
        >{{ page.subnav.label }}</span>
        <ul>
          <li
            v-for="link in subnavLinks"
            :key="link.id"
          >
            <a
              :href="`#${link.id}`"
              :aria-current="activeSection === link.id ? 'true' : undefined"
              @click.prevent="goTo(link.id)"
            >{{ link.label }}</a>
          </li>
        </ul>
        <a
          v-if="page.subnav?.ctaText"
          class="btn btn-primary btn-sm"
          href="#contact"
          @click.prevent="goTo('contact', 'partenariat-subnav')"
        >{{ page.subnav.ctaText }}</a>
      </div>
    </nav>

    <!-- ================= NOS PARTENAIRES ================= -->
    <section
      id="partenaires"
      class="sec-white"
    >
      <div class="wrap">
        <div class="proj">
          <div>
            <p
              v-if="page.partenaires?.eyebrow"
              class="eyebrow"
            >
              {{ page.partenaires.eyebrow }}
            </p>
            <h2>{{ page.partenaires?.title }}</h2>
            <div class="stack-lead">
              <PartenariatRichText
                :value="page.partenaires?.text"
                paragraph-class="lead"
              />
            </div>
            <ul
              v-if="page.partenaires?.profiles?.length"
              class="profiles"
            >
              <li
                v-for="p in page.partenaires.profiles"
                :key="p"
              >
                {{ p }}
              </li>
            </ul>
          </div>
          <div
            v-if="page.partenaires?.momentItems?.length"
            class="moment"
          >
            <h3>{{ page.partenaires.momentTitle }}</h3>
            <ul>
              <li
                v-for="m in page.partenaires.momentItems"
                :key="m"
              >
                {{ m }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= L'AGENCE ODYSWAY ================= -->
    <section
      id="cadre"
      class="on-photo"
    >
      <div class="photo">
        <PartenariatPhoto
          :image="page.cadre?.image"
          sizes="100vw"
        />
      </div>
      <div class="wrap">
        <div class="sec-head">
          <p
            v-if="page.cadre?.eyebrow"
            class="eyebrow"
          >
            {{ page.cadre.eyebrow }}
          </p>
          <h2>{{ page.cadre?.title }}</h2>
          <div class="stack-lead">
            <PartenariatRichText
              :value="page.cadre?.text"
              paragraph-class="lead"
            />
          </div>
        </div>

        <div class="offre">
          <div class="offre-cols">
            <div>
              <p class="offre-sub">
                {{ page.cadre?.includedTitle }}
              </p>
              <ul class="checks">
                <li
                  v-for="item in page.cadre?.includedItems"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
            <div>
              <p class="offre-sub">
                {{ page.cadre?.scopeTitle }}
              </p>
              <ul class="checks">
                <li
                  v-for="item in page.cadre?.scopeItems"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          v-if="page.cadre?.priceRate"
          class="tarif"
        >
          <div class="tarif-head">
            <p class="price-label">
              {{ page.cadre.priceLabel }}
            </p>
            <p class="offre-taux">
              {{ page.cadre.priceRate }}
            </p>
          </div>
          <PartenariatRichText
            :value="page.cadre.priceNote"
            paragraph-class="offre-note"
          />
        </div>
        <p
          v-if="page.cadre?.footnote"
          class="offers2-foot"
        >
          {{ page.cadre.footnote }}
        </p>

        <div
          v-if="page.cadre?.ctaText"
          class="cadre-cta"
        >
          <a
            class="btn btn-primary"
            href="#contact"
            @click.prevent="goTo('contact', 'partenariat-cadre')"
          >{{ page.cadre.ctaText }}</a>
          <p v-if="page.cadre.ctaNote">
            {{ page.cadre.ctaNote }}
          </p>
        </div>
      </div>
    </section>

    <!-- ================= EXEMPLES ================= -->
    <section
      v-if="hasPreuves"
      id="preuves"
      class="band-cream"
    >
      <div class="wrap">
        <div class="carou-head">
          <div>
            <p
              v-if="page.preuves?.eyebrow"
              class="eyebrow"
            >
              {{ page.preuves.eyebrow }}
            </p>
            <h2>{{ page.preuves?.title }}</h2>
          </div>
          <div
            v-if="cases.length > 2"
            class="carou-nav"
          >
            <button
              class="carou-btn"
              type="button"
              aria-label="Cas précédents"
              :disabled="!canPrev"
              @click="scrollCarou(-1)"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              ><path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                stroke-width="2.1"
                stroke-linecap="round"
                stroke-linejoin="round"
              /></svg>
            </button>
            <button
              class="carou-btn"
              type="button"
              aria-label="Cas suivants"
              :disabled="!canNext"
              @click="scrollCarou(1)"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              ><path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                stroke-width="2.1"
                stroke-linecap="round"
                stroke-linejoin="round"
              /></svg>
            </button>
          </div>
        </div>

        <div
          v-if="cases.length"
          ref="carouEl"
          class="carou"
          @scroll.passive="syncCarou"
        >
          <article
            v-for="(c, i) in cases"
            :key="c._key || i"
            class="case"
          >
            <div class="case-img">
              <PartenariatPhoto
                :image="c.image"
                :ratio="16 / 10"
                :widths="[400, 728]"
                sizes="(max-width: 700px) 82vw, 364px"
              />
            </div>
            <div class="case-body">
              <p class="case-who">
                {{ c.who }}
              </p>
              <h3>{{ c.title }}</h3>
              <ul class="case-split">
                <li v-if="c.inPlace">
                  <b>{{ c.inPlaceLabel || 'Déjà en place' }}</b>{{ c.inPlace }}
                </li>
                <li v-if="c.odysway">
                  <b>{{ c.odyswayLabel || 'Part Odysway' }}</b>{{ c.odysway }}
                </li>
              </ul>
              <div
                v-if="c.stats?.length"
                class="case-stats"
              >
                <div
                  v-for="(s, j) in c.stats"
                  :key="j"
                >
                  <b>{{ s.value }}</b><span>{{ s.label }}</span>
                </div>
              </div>
              <p
                v-if="c.quote"
                class="case-quote"
              >
                « {{ c.quote }} »
                <cite v-if="c.author">{{ c.author }}</cite>
              </p>
            </div>
          </article>
        </div>

        <div
          v-if="reviews.length"
          class="tp-block"
        >
          <h3>{{ page.preuves?.reviewsTitle }}</h3>
          <div
            v-if="page.preuves?.reviewsScore"
            class="tp-head"
          >
            <span class="tp-score">{{ page.preuves.reviewsScore }}</span>
            <span
              class="stars"
              :aria-label="`${page.preuves.reviewsScore} sur 5`"
            >★★★★★</span>
            <p>{{ page.preuves.reviewsScoreLabel }}</p>
          </div>
          <div class="tp tp-light">
            <article
              v-for="r in reviews"
              :key="r._id"
              class="tp-card"
            >
              <p
                class="stars"
                :aria-label="`${r.rating} sur 5`"
              >
                {{ stars(r.rating) }}
              </p>
              <p>« {{ r.text }} »</p>
              <cite><b>{{ r.author }}</b>{{ reviewMeta(r) }}</cite>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= COMMENT ÇA MARCHE ================= -->
    <section
      id="modeles"
      class="sec-white"
    >
      <div class="wrap">
        <div class="sec-head">
          <p
            v-if="page.modeles?.eyebrow"
            class="eyebrow"
          >
            {{ page.modeles.eyebrow }}
          </p>
          <h2>{{ page.modeles?.title }}</h2>
          <p
            v-if="page.modeles?.lead"
            class="lead"
          >
            {{ page.modeles.lead }}
          </p>
        </div>

        <ol
          v-if="page.modeles?.steps?.length"
          class="steps"
        >
          <li
            v-for="(step, i) in page.modeles.steps"
            :key="i"
            class="step"
          >
            <span class="step-n">{{ step.label }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
            <span
              v-if="step.when"
              class="step-when"
            >{{ step.when }}</span>
          </li>
        </ol>

        <div
          v-if="page.modeles?.ctaText"
          class="duo-cta"
        >
          <a
            class="btn btn-primary"
            href="#contact"
            @click.prevent="goTo('contact', 'partenariat-etapes')"
          >{{ page.modeles.ctaText }}</a>
        </div>
      </div>
    </section>

    <!-- ================= FAQ ================= -->
    <section
      id="faq"
      class="band-grey"
    >
      <div class="wrap">
        <div class="sec-head sec-head-center">
          <p
            v-if="page.faq?.eyebrow"
            class="eyebrow"
          >
            {{ page.faq.eyebrow }}
          </p>
          <h2>{{ page.faq?.title }}</h2>
        </div>

        <div class="faq">
          <details
            v-for="(q, i) in page.faq?.questions"
            :key="i"
            :open="i === 0"
            @toggle="onFaqToggle($event, q.question)"
          >
            <summary>{{ q.question }}</summary>
            <div class="faq-a">
              <p>{{ q.answer }}</p>
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- ================= FORMULAIRE ================= -->
    <section
      id="contact"
      class="on-photo"
    >
      <div class="photo">
        <PartenariatPhoto
          :image="page.contact?.image"
          sizes="100vw"
        />
      </div>
      <div class="wrap final-in">
        <div class="final-copy">
          <p
            v-if="page.contact?.eyebrow"
            class="eyebrow"
          >
            {{ page.contact.eyebrow }}
          </p>
          <h2>{{ page.contact?.title }}</h2>
          <p
            v-if="page.contact?.lead"
            class="lead final-lead"
          >
            {{ page.contact.lead }}
          </p>
          <ul
            v-if="page.contact?.bullets?.length"
            class="final-bullets"
          >
            <li
              v-for="b in page.contact.bullets"
              :key="b"
            >
              {{ b }}
            </li>
          </ul>
        </div>

        <PartenariatForm :content="page.contact || {}" />
      </div>
    </section>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

definePageMeta({
  layout: 'landing',
})

const query = groq`*[_type == "page_partenariat"][0]{
  ...,
  preuves{
    ...,
    reviews[]->{ _id, author, date, rating, text, "voyageTitle": coalesce(voyage->title, voyageTitle) }
  }
}`

const { data: page } = await useSanityQuery(query)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page introuvable', fatal: true })
}

useSeo({
  seoData: page.value.seo,
  content: {
    title: 'Devenir partenaire Odysway',
    description: 'Vous accompagnez un groupe et vous avez un séjour en tête. Odysway devient l\'agence qui le contractualise, l\'encadre et le fait partir.',
    image: page.value.hero?.image,
  },
  pageType: 'website',
  slug: 'partenariat',
  baseUrl: '/partenariat',
})

const { trackCtaClick, trackFaqClick } = useGtmTracking()

const ridges = [
  { y: -252, o: 0.07 }, { y: -156, o: 0.09 }, { y: -60, o: 0.11 }, { y: 36, o: 0.09 }, { y: 132, o: 0.06 },
]

const cases = computed(() => page.value?.preuves?.cases || [])
const reviews = computed(() => (page.value?.preuves?.reviews || []).filter(Boolean))
// Sans cas ni avis publiés, la section et son lien disparaissent.
const hasPreuves = computed(() => cases.value.length > 0 || reviews.value.length > 0)

const stars = (rating) => {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 5)))
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}
const reviewMeta = (r) => {
  const date = r.date ? dayjs(r.date).locale('fr').format('MMMM YYYY') : ''
  return [r.voyageTitle, date].filter(Boolean).join(', ')
}

// ---------- sous-navigation ----------
const subnavLinks = computed(() => [
  { id: 'partenaires', label: page.value?.subnav?.partenaires },
  { id: 'cadre', label: page.value?.subnav?.cadre },
  { id: 'preuves', label: hasPreuves.value && page.value?.subnav?.preuves },
  { id: 'modeles', label: page.value?.subnav?.modeles },
  { id: 'faq', label: page.value?.subnav?.faq },
].filter(l => l.label))

const subnavEl = ref(null)
const subnavTop = ref(0)
const activeSection = ref('')

// Le header du site est fixe et se masque au défilement vers le bas (desktop) :
// la sous-nav se cale sous ce qui en reste visible.
const visibleHeaderBottom = () => {
  let bottom = 0
  for (const el of document.querySelectorAll('.d-header-desktop, .mobile-header')) {
    const r = el.getBoundingClientRect()
    if (r.height > 0 && getComputedStyle(el).display !== 'none') bottom = Math.max(bottom, r.bottom)
  }
  return Math.max(0, Math.round(bottom))
}

let raf = 0
const syncSubnav = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    subnavTop.value = visibleHeaderBottom()
  })
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function goTo(id, ctaId = null) {
  const el = document.getElementById(id)
  if (!el) return
  if (ctaId) trackCtaClick({ ctaId, ctaLabel: id, ctaUrl: `#${id}` })

  const targetY = el.getBoundingClientRect().top + window.scrollY
  const subnavH = subnavEl.value?.offsetHeight || 0
  // En descendant, le header desktop se masque ; en remontant, il réapparaît.
  // Le header mobile reste toujours affiché.
  const mobile = window.matchMedia('(max-width: 599px)').matches
  const goingDown = targetY > window.scrollY
  const headerH = mobile || !goingDown ? (document.querySelector(mobile ? '.mobile-header' : '.d-header-desktop')?.getBoundingClientRect().height || 0) + (mobile ? 18 : 0) : 0
  window.scrollTo({ top: Math.max(0, targetY - subnavH - headerH + 1), behavior: reducedMotion() ? 'auto' : 'smooth' })
  history.replaceState(history.state, '', `#${id}`)
  activeSection.value = id
}

// ---------- carrousel ----------
const carouEl = ref(null)
const canPrev = ref(false)
const canNext = ref(false)

const syncCarou = () => {
  const c = carouEl.value
  if (!c) return
  canPrev.value = c.scrollLeft > 2
  canNext.value = c.scrollLeft < c.scrollWidth - c.clientWidth - 2
}
const scrollCarou = (dir) => {
  const c = carouEl.value
  const card = c?.firstElementChild
  if (!card) return
  c.scrollBy({ left: dir * (card.getBoundingClientRect().width + 22), behavior: reducedMotion() ? 'auto' : 'smooth' })
}

const onFaqToggle = (e, question) => {
  if (e.target.open) trackFaqClick(question)
}

let observer = null
onMounted(() => {
  syncSubnav()
  syncCarou()
  window.addEventListener('scroll', syncSubnav, { passive: true })
  window.addEventListener('resize', syncSubnav, { passive: true })
  window.addEventListener('resize', syncCarou, { passive: true })

  // Lien actif de la sous-nav : la section qui traverse le haut de l'écran.
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) activeSection.value = e.target.id
    }
  }, { rootMargin: '-30% 0px -65% 0px' })
  for (const l of subnavLinks.value) {
    const el = document.getElementById(l.id)
    if (el) observer.observe(el)
  }

  // Arrivée directe sur /partenariat#contact : on recale sous la sous-nav.
  const hash = window.location.hash.slice(1)
  if (hash && document.getElementById(hash)) nextTick(() => goTo(hash))
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('scroll', syncSubnav)
  window.removeEventListener('resize', syncSubnav)
  window.removeEventListener('resize', syncCarou)
  observer?.disconnect()
})
</script>

<style lang="scss">
@use '~/assets/scss/partenariat';
</style>
