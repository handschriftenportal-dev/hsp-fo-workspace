/**
 *  code copied from: mirador-annotations plugin
 * https://github.com/ProjectMirador/mirador-annotations/blob/master/src/LocalStorageAdapter.js
 */

export default class LocalStorageAdapter {
  annotationPageId: string
  /** */
  constructor(annotationPageId: any) {
    this.annotationPageId = annotationPageId
  }

  /** */
  async create(annotation: any) {
    const emptyAnnoPage = {
      id: this.annotationPageId,
      items: [],
      type: 'AnnotationPage',
    }
    const annotationPage = (await this.all()) || emptyAnnoPage
    annotationPage.items.push(annotation)
    localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage))
    return annotationPage
  }

  /** */
  async update(annotation: any) {
    const annotationPage = await this.all()
    if (annotationPage) {
      const currentIndex = annotationPage.items.findIndex(
        (item: any) => item.id === annotation.id,
      )
      annotationPage.items.splice(currentIndex, 1, annotation)
      localStorage.setItem(
        this.annotationPageId,
        JSON.stringify(annotationPage),
      )
      return annotationPage
    }
    return null
  }

  /** */
  async delete(annoId: any) {
    const annotationPage = await this.all()
    if (annotationPage) {
      annotationPage.items = annotationPage.items.filter(
        (item: any) => item.id !== annoId,
      )
    }
    localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage))
    return annotationPage
  }

  /** */
  async get(annoId: any) {
    const annotationPage = await this.all()
    if (annotationPage) {
      return annotationPage.items.find(
        (item: { id: any }) => item.id === annoId,
      )
    }
    return null
  }

  /** */
  async all() {
    return JSON.parse(localStorage.getItem(this.annotationPageId) as any)
  }
}
