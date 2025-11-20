import * as ST from '@asmartbear/smarttype'

/**
 * The components of document data that the underlying database loads and saves.
 */
export type DocumentStorageData = {
    frontMatter: ST.JSONType,
    text: string,
}

/** A document with YAML-compliant meta-data and arbitrary body content. */
export class Document<ST extends ST.SmartType> {

    private originalFrontMatterHash: string
    private originalText: string

    private constructor(
        public readonly frontMatterType: ST,
        public readonly uniqueId: string,
        public frontMatter: ST.NativeFor<ST>,
        public text: string,
    ) {
        this.originalFrontMatterHash = frontMatterType.toHash(frontMatter)
        this.originalText = text
    }

    /** Creates a document given data loaded from a database */
    static fromStorageData<ST extends ST.SmartType>(frontMatterType: ST, uniqueId: string, data: DocumentStorageData) {
        const frontMatter = frontMatterType.fromJSON(data.frontMatter)
        return new Document(frontMatterType, uniqueId, frontMatter, data.text)
    }

    /** True if the current data values differ from what was originally constructed. */
    get isDirty(): boolean {
        return (this.originalText != this.text) || (this.frontMatterType.toHash(this.frontMatter) != this.originalFrontMatterHash)
    }

    /** Retrieves the document data for storage in an external database. */
    getDocumentStorageData(): DocumentStorageData {
        return {
            frontMatter: this.frontMatterType.toJSON(this.frontMatter),
            text: this.text,
        }
    }
}
