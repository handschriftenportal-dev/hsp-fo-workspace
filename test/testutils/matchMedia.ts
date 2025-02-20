import mediaQuery from 'css-mediaquery'

// see https://material-ui.com/components/use-media-query/#testing
export function createMatchMedia(width: number) {
  return (query: string) => {
    return {
      matches: mediaQuery.match(query, { width }),
      addListener: () => {},
      removeListener: () => {},
    }
  }
}
