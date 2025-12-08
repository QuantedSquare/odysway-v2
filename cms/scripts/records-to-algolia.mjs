/* eslint-env node */
import { algoliasearch } from 'algoliasearch';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config();

// Algolia client
const algoliaClient = algoliasearch('1EKY7SKCRG', '85ffb35915229b835cee85dcc1a59508');

// Sanity client
const projectId = process.env.SANITY_PROJECT_ID || 'nu6yntji';
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_READ_TOKEN || process.env.SANITY_WRITE_TOKEN;

const sanityClient = createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    token,
    useCdn: false,
});

/**
 * Fetch all regions from Sanity
 */
async function fetchRegions() {
    const query = `*[_type == "region"] {
    _id,
    nom,
    slug,
    meta_description,
    interjection,
    "image": image.asset->url,
    "voyageCount": count(*[_type == "voyage" && references(*[_type == "destination" && references(^._id)]._id) && (
      !('custom' in availabilityTypes) ||
      (count(availabilityTypes) > 1)
    )])
  }`;

    return await sanityClient.fetch(query);
}

/**
 * Fetch all destinations with their regions from Sanity
 */
async function fetchDestinations() {
    const query = `*[_type == "destination"] {
    _id,
    title,
    slug,
    metaDescription,
    interjection,
    "image": image.asset->url,
    "regions": regions[]-> {
      _id,
      nom,
      slug
    },
    "voyageCount": count(*[_type == "voyage" && references(^._id) && (
      !('custom' in availabilityTypes) ||
      (count(availabilityTypes) > 1)
    )])
  }`;

    return await sanityClient.fetch(query);
}

/**
 * Fetch all voyages with their destinations and regions from Sanity
 */
async function fetchVoyages() {
    const query = `*[_type == "voyage" && (
      !('custom' in availabilityTypes) ||
      (count(availabilityTypes) > 1)
    )] {
    _id,
    title,
    slug,
    description,
    availabilityTypes,
    "difficulty": difficultyLevel->title,
    "image": image.asset->url,
    "destinations": destinations[]-> {
      _id,
      title,
      slug,
      "regions": regions[]-> {
        _id,
        nom,
        slug
      }
    }
  }`;

    return await sanityClient.fetch(query);
}

/**
 * Transform data into Algolia records
 */
function transformToAlgoliaRecords(regions, destinations, voyages) {
    const records = [];

    // Add region records
    regions.forEach(region => {
        records.push({
            objectID: `region_${region._id}`,
            type: 'region',
            name: region.nom,
            slug: region.slug?.current,
            title: region.nom,
            description: region.meta_description,
            interjection: region.interjection,
            image: region.image,
            voyageCount: region.voyageCount || 0,
            searchableText: `${region.nom} ${region.meta_description || ''} ${region.interjection || ''}`,
        });
    });

    // Add destination records
    destinations.forEach(destination => {
        const regionNames = destination.regions?.map(r => r.nom).filter(Boolean) || [];
        const regionSlugs = destination.regions?.map(r => r.slug?.current).filter(Boolean) || [];

        records.push({
            objectID: `destination_${destination._id}`,
            type: 'destination',
            name: destination.title,
            slug: destination.slug?.current,
            title: destination.title,
            description: destination.metaDescription,
            interjection: destination.interjection,
            image: destination.image,
            voyageCount: destination.voyageCount || 0,
            regions: regionNames,
            regionSlugs: regionSlugs,
            searchableText: `${destination.title} ${destination.metaDescription || ''} ${destination.interjection || ''} ${regionNames.join(' ')}`,
        });
    });

    // Add voyage records
    voyages.forEach(voyage => {
        const destinationNames = voyage.destinations?.map(d => d.title).filter(Boolean) || [];
        const destinationSlugs = voyage.destinations?.map(d => d.slug?.current).filter(Boolean) || [];

        // Collect all regions from destinations
        const allRegions = new Set();
        const allRegionSlugs = new Set();

        voyage.destinations?.forEach(dest => {
            dest.regions?.forEach(region => {
                if (region.nom) allRegions.add(region.nom);
                if (region.slug?.current) allRegionSlugs.add(region.slug.current);
            });
        });

        const regionNames = Array.from(allRegions);
        const regionSlugs = Array.from(allRegionSlugs);

        records.push({
            objectID: `voyage_${voyage._id}`,
            type: 'voyage',
            name: voyage.title,
            slug: voyage.slug?.current,
            title: voyage.title,
            description: voyage.description,
            image: voyage.image,
            availabilityTypes: voyage.availabilityTypes || [],
            difficulty: voyage.difficulty,
            destinations: destinationNames,
            destinationSlugs: destinationSlugs,
            regions: regionNames,
            regionSlugs: regionSlugs,
            searchableText: `${voyage.title} ${voyage.description || ''} ${destinationNames.join(' ')} ${regionNames.join(' ')} ${voyage.difficulty || ''}`,
        });
    });

    return records;
}

/**
 * Main function to fetch from Sanity and index to Algolia
 */
async function processRecords() {
    try {
        console.log('🔍 Fetching data from Sanity...');

        // Fetch all data in parallel
        const [regions, destinations, voyages] = await Promise.all([
            fetchRegions(),
            fetchDestinations(),
            fetchVoyages(),
        ]);

        console.log(`✅ Fetched ${regions.length} regions`);
        console.log(`✅ Fetched ${destinations.length} destinations`);
        console.log(`✅ Fetched ${voyages.length} voyages`);

        // Transform data into Algolia records
        console.log('🔄 Transforming data into Algolia records...');
        const records = transformToAlgoliaRecords(regions, destinations, voyages);
        console.log(`✅ Created ${records.length} records`);

        // Index to Algolia
        console.log('📤 Indexing to Algolia...');
        await algoliaClient.saveObjects({
            indexName: 'odysway',
            objects: records
        });

        console.log('✅ Successfully indexed all records to Algolia!');
        console.log(`📊 Summary: ${regions.length} regions, ${destinations.length} destinations, ${voyages.length} voyages`);

    } catch (error) {
        console.error('❌ Error processing records:', error);
        throw error;
    }
}

// Run the script
processRecords()
    .then(() => {
        console.log('✨ Script completed successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('💥 Script failed:', err);
        process.exit(1);
    });