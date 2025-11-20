import * as T from "./testutil"
import * as ST from '@asmartbear/smarttype'
import { Document } from '../src/doc'

const UnitTestFrontMatterType = ST.OBJ({
    foo: ST.ARRAY(ST.NUM().int().min(0)),
})

test('document is dirty if text changes', () => {
    let doc = Document.fromStorageData(UnitTestFrontMatterType, 'a', { frontMatter: { foo: [1, 2, 3] }, text: "hello" })
    T.eq(doc.frontMatter, { foo: [1, 2, 3] })
    T.eq(doc.text, "hello")
    T.eq(doc.isDirty, false)
    doc.text = "hello!"
    T.eq(doc.isDirty, true as any)
    T.eq(doc.getDocumentStorageData(), { frontMatter: { foo: [1, 2, 3] }, text: "hello!" })
})

test('document is dirty if front matter changes', () => {
    let doc = Document.fromStorageData(UnitTestFrontMatterType, 'a', { frontMatter: { foo: [1, 2, 3] }, text: "hello" })
    T.eq(doc.frontMatter, { foo: [1, 2, 3] })
    T.eq(doc.text, "hello")
    T.eq(doc.isDirty, false)
    doc.frontMatter.foo[1] = 10
    T.eq(doc.isDirty, true as any)
    T.eq(doc.getDocumentStorageData(), { frontMatter: { foo: [1, 10, 3] }, text: "hello" })
})
