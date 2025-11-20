import { randomUUID } from 'crypto'
import { IDriver, DocumentStorageData, NewDocumentStorageData } from './driver'

/** An `IDriver` implementation only in memory; especially useful for unit tests */
export class InMemoryDriver implements IDriver {

    public readonly docData = new Map<string, DocumentStorageData>()

    async create(partialData: NewDocumentStorageData): Promise<DocumentStorageData> {
        const data: DocumentStorageData = {
            ...partialData,
            uniqueId: randomUUID()
        }
        this.docData.set(data.uniqueId, data)
        return Object.assign({}, data)
    }

    async save(data: DocumentStorageData): Promise<void> {
        this.docData.set(data.uniqueId, Object.assign({}, data))
    }

    async loadById(uniqueId: string): Promise<DocumentStorageData | undefined> {
        const result = this.docData.get(uniqueId)
        return result ? Object.assign({}, result) : undefined
    }

    async loadByName(ns: string, name: string): Promise<DocumentStorageData | undefined> {
        for (const doc of this.docData.values()) {
            if (doc.ns == ns && doc.name == name) {
                return Object.assign({}, doc)
            }
        }
        return undefined
    }
}