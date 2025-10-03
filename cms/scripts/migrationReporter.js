/* eslint-env node */
import {writeFileSync, mkdirSync, existsSync} from 'node:fs'
import {join} from 'node:path'
import {log} from 'node:console'

/**
 * Migration reporter to track success, failures, and issues
 */
export class MigrationReporter {
  constructor(migrationType) {
    this.migrationType = migrationType
    this.startTime = new Date()
    this.stats = {
      totalDocuments: 0,
      successful: 0,
      failed: 0,
      imagesReferenced: 0,
      imagesMissing: 0,
      warnings: 0,
    }
    this.missingImages = new Map() // path -> Set of document IDs
    this.failedDocuments = []
    this.warnings = []
    this.orphanedAssets = []
    this.duplicateImageUse = new Map() // path -> count
  }

  /**
   * Increment total documents counter
   */
  incrementTotal() {
    this.stats.totalDocuments++
  }

  /**
   * Mark a document as successfully migrated
   */
  recordSuccess() {
    this.stats.successful++
  }

  /**
   * Record a failed document
   * @param {string} documentId
   * @param {string} error
   */
  recordFailure(documentId, error) {
    this.stats.failed++
    this.failedDocuments.push({
      id: documentId,
      error: error.toString(),
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Record a missing image reference
   * @param {string} imagePath
   * @param {string} documentId
   */
  recordMissingImage(imagePath, documentId) {
    this.stats.imagesMissing++

    if (!this.missingImages.has(imagePath)) {
      this.missingImages.set(imagePath, new Set())
    }
    this.missingImages.get(imagePath).add(documentId)
  }

  /**
   * Record an image reference (for tracking usage)
   * @param {string} imagePath
   */
  recordImageReference(imagePath) {
    this.stats.imagesReferenced++

    const count = this.duplicateImageUse.get(imagePath) || 0
    this.duplicateImageUse.set(imagePath, count + 1)
  }

  /**
   * Record a warning
   * @param {string} documentId
   * @param {string} warning
   */
  recordWarning(documentId, warning) {
    this.stats.warnings++
    this.warnings.push({
      document: documentId,
      warning,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Set orphaned assets (images not referenced by any document)
   * @param {string[]} assetPaths
   */
  setOrphanedAssets(assetPaths) {
    this.orphanedAssets = assetPaths
  }

  /**
   * Generate the report object
   */
  generateReport() {
    const endTime = new Date()
    const duration = (endTime - this.startTime) / 1000 // seconds

    // Convert missingImages Map to array format
    const missingImagesArray = Array.from(this.missingImages.entries()).map(
      ([path, documentIds]) => ({
        path,
        referencedIn: Array.from(documentIds),
        count: documentIds.size,
      }),
    )

    // Find heavily used images (referenced 3+ times)
    const heavilyUsedImages = Array.from(this.duplicateImageUse.entries())
      .filter(([, count]) => count >= 3)
      .map(([path, count]) => ({path, count}))
      .sort((a, b) => b.count - a.count)

    return {
      migrationType: this.migrationType,
      timestamp: this.startTime.toISOString(),
      duration: `${duration.toFixed(2)}s`,
      summary: this.stats,
      missingImages: missingImagesArray,
      failedDocuments: this.failedDocuments,
      warnings: this.warnings,
      orphanedAssets: this.orphanedAssets.length > 0 ? this.orphanedAssets : undefined,
      heavilyUsedImages: heavilyUsedImages.length > 0 ? heavilyUsedImages : undefined,
    }
  }

  /**
   * Save the report to a file
   * @param {string} baseDir - Base directory for reports (default: cms/scripts)
   */
  saveReport(baseDir = process.cwd()) {
    const reportsDir = join(baseDir, 'migration-reports')

    // Create reports directory if it doesn't exist
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, {recursive: true})
    }

    const timestamp = this.startTime.toISOString().replace(/:/g, '-').split('.')[0]
    const filename = `${this.migrationType}-${timestamp}.json`
    const filepath = join(reportsDir, filename)

    const report = this.generateReport()

    writeFileSync(filepath, JSON.stringify(report, null, 2))

    return filepath
  }

  /**
   * Print a summary to console
   */
  printSummary() {
    log('\n📊 Migration Summary:')
    log(`   Total documents: ${this.stats.totalDocuments}`)
    log(`   ✅ Successful: ${this.stats.successful}`)
    log(`   ❌ Failed: ${this.stats.failed}`)
    log(`   🖼️  Images referenced: ${this.stats.imagesReferenced}`)
    log(`   ⚠️  Missing images: ${this.stats.imagesMissing}`)
    log(`   ⚡ Warnings: ${this.stats.warnings}`)

    if (this.missingImages.size > 0) {
      log(`\n⚠️  ${this.missingImages.size} unique missing images`)
    }

    if (this.failedDocuments.length > 0) {
      log(`\n❌ Failed documents:`)
      this.failedDocuments.slice(0, 5).forEach((fail) => {
        log(`   - ${fail.id}: ${fail.error}`)
      })
      if (this.failedDocuments.length > 5) {
        log(`   ... and ${this.failedDocuments.length - 5} more`)
      }
    }
  }

  /**
   * Save report and print summary
   */
  finish() {
    const filepath = this.saveReport()
    this.printSummary()
    log(`\n💾 Full report saved to: ${filepath}`)
    return filepath
  }
}
