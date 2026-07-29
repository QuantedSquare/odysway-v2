<template>
  <section
    v-if="displayItems.length"
    class="values-section"
  >
    <div class="values-head">
      <p
        v-if="eyebrow"
        class="eyebrow"
      >
        {{ eyebrow }}
      </p>
      <h2 v-if="title">
        {{ title }}
      </h2>
    </div>

    <div class="values">
      <article
        v-for="(value, i) in displayItems"
        :key="i"
        class="value-card"
      >
        <component
          :is="iconFor(value.icon)"
          class="value-card__icon"
          :size="28"
          :stroke="1.8"
        />
        <h3>{{ value.title }}</h3>
        <p>{{ value.text }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import {
  IconEye,
  IconShieldCheck,
  IconHeart,
  IconCompass,
  IconLeaf,
  IconUsers,
} from '@tabler/icons-vue'

const props = defineProps({
  eyebrow: {
    type: String,
    default: 'Notre boussole, au quotidien',
  },
  title: {
    type: String,
    default: 'Quatre valeurs simples et profondes',
  },
  items: {
    type: Array,
    default: () => [],
  },
})

// Fallback copy (CMS field empty) — the four values of the "boussole".
const defaultItems = [
  {
    icon: 'eye',
    title: 'Transparence',
    text: 'Nous partageons nos choix et nos engagements sans détour. Pas de zones d\'ombre, pas de promesses que nous ne pouvons pas tenir.',
  },
  {
    icon: 'shield',
    title: 'Confiance',
    text: 'Nos voyageurs nous confient leurs envies, parfois une part d\'eux-mêmes. Nous faisons les choses bien, simplement, avec honnêteté.',
  },
  {
    icon: 'heart',
    title: 'Chaleur',
    text: 'Ce qui ne se mesure pas, mais qui change tout. Dans notre façon d\'accueillir chaque voyageur et de choisir nos partenaires.',
  },
  {
    icon: 'compass',
    title: 'Justesse',
    text: 'Faire juste : concevoir un voyage, choisir un hébergement, rémunérer équitablement ceux qui accueillent. Dans le respect des personnes et des lieux.',
  },
]

const displayItems = computed(() => (props.items?.length ? props.items : defaultItems))

const icons = {
  eye: IconEye,
  shield: IconShieldCheck,
  heart: IconHeart,
  compass: IconCompass,
  leaf: IconLeaf,
  users: IconUsers,
}

const iconFor = key => icons[key] || IconCompass
</script>

<style scoped>
.values-section {
  margin-top: var(--gap-section, 4.5rem);
  /* Narrower container than the rest of the site: this page keeps wide side
     margins, like the prototype. */
  max-width: 1180px;
  margin-inline: auto;
  padding-inline: 32px;
}

.values-head {
  text-align: center;
  margin-bottom: 30px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}

.values-head h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.values {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.value-card {
  background: #fff;
  border: 1px solid rgba(43, 76, 82, 0.13);
  border-radius: 16px;
  padding: 26px 22px;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (hover: hover) {
  .value-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(12, 30, 30, 0.1);
  }
}

.value-card__icon {
  color: rgb(var(--v-theme-secondary));
}

.value-card h3 {
  margin: 14px 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.value-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #5d6566;
}

@media (max-width: 960px) {
  .values-section {
    padding-inline: 20px;
  }

  .values {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .values-head h2 {
    font-size: 25px;
  }

  .value-card {
    padding: 20px 16px;
  }

  .value-card h3 {
    font-size: 17px;
  }
}

@media (max-width: 420px) {
  .values {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .value-card {
    transition: none;
  }
}
</style>
