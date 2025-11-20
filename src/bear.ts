import { IDriver, DocumentStorageData, NewDocumentStorageData } from './driver'
import { BearSqlDatabase, BearSqlNote } from '@asmartbear/sqlight'

/** An `IDriver` implementation using Bear */
export class BearDriver implements IDriver<BearSqlNote> {

    private bear: BearSqlDatabase

    constructor() {
        this.bear = new BearSqlDatabase()
    }

    /** Convert our document data to the full string we set in Bear */
    private bearContent(data: NewDocumentStorageData): string {
        return BearSqlNote.createStructuredContent(
            data.name,          // title
            data.text,          // body
            [data.ns],          // tags
            data.frontMatter as any    // front matter
        )
    }

    private async bearNoteToDocumentData(note: BearSqlNote): Promise<DocumentStorageData<BearSqlNote>> {
        // the longest tag
        const longestTag = Array.from(await note.getTags()).sort((a, b) => b.length - a.length)[0]
        return {
            uniqueId: note.uniqueId,
            ns: longestTag ?? "na",
            name: note.title,
            text: note.body,
            frontMatter: note.frontMatter as any,
            driverData: note,
        }
    }

    async create(partialData: NewDocumentStorageData): Promise<DocumentStorageData<BearSqlNote>> {
        const note = await this.bear.createAndReturnNote(this.bearContent(partialData))
        return {
            ...partialData,
            uniqueId: note.uniqueId,
            driverData: note,
        }
    }

    async save(data: DocumentStorageData<BearSqlNote>): Promise<void> {
        const note = data.driverData
        note.h1 = data.name
        note.body = data.text
        note.frontMatter = data.frontMatter as any
        await note.save()
    }

    async loadById(uniqueId: string): Promise<DocumentStorageData<BearSqlNote> | undefined> {
        const note = await this.bear.getNoteByUniqueId(uniqueId)
        if (!note) return undefined;
        return await this.bearNoteToDocumentData(note)
    }

    async loadByName(ns: string, name: string): Promise<DocumentStorageData<BearSqlNote> | undefined> {
        const notes = await this.bear.getNotes({
            limit: 1,
            titleExact: name,
            tagsInclude: [ns],
            orderBy: 'newest',
        })
        if (notes.length == 0) return undefined;
        return await this.bearNoteToDocumentData(notes[0])
    }
}
