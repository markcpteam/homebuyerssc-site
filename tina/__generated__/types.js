export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const GuidesPartsFragmentDoc = gql`
    fragment GuidesParts on Guides {
  __typename
  title
  description
  pubDate
  group
  oldUrl
  body
}
    `;
export const CitiesPartsFragmentDoc = gql`
    fragment CitiesParts on Cities {
  __typename
  title
  description
  city
  oldUrl
  body
}
    `;
export const PagesPartsFragmentDoc = gql`
    fragment PagesParts on Pages {
  __typename
  title
  description
  kind
  oldUrl
  body
}
    `;
export const GuidesDocument = gql`
    query guides($relativePath: String!) {
  guides(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...GuidesParts
  }
}
    ${GuidesPartsFragmentDoc}`;
export const GuidesConnectionDocument = gql`
    query guidesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: GuidesFilter) {
  guidesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...GuidesParts
      }
    }
  }
}
    ${GuidesPartsFragmentDoc}`;
export const CitiesDocument = gql`
    query cities($relativePath: String!) {
  cities(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...CitiesParts
  }
}
    ${CitiesPartsFragmentDoc}`;
export const CitiesConnectionDocument = gql`
    query citiesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: CitiesFilter) {
  citiesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...CitiesParts
      }
    }
  }
}
    ${CitiesPartsFragmentDoc}`;
export const PagesDocument = gql`
    query pages($relativePath: String!) {
  pages(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PagesParts
  }
}
    ${PagesPartsFragmentDoc}`;
export const PagesConnectionDocument = gql`
    query pagesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PagesFilter) {
  pagesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PagesParts
      }
    }
  }
}
    ${PagesPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    guides(variables, options) {
      return requester(GuidesDocument, variables, options);
    },
    guidesConnection(variables, options) {
      return requester(GuidesConnectionDocument, variables, options);
    },
    cities(variables, options) {
      return requester(CitiesDocument, variables, options);
    },
    citiesConnection(variables, options) {
      return requester(CitiesConnectionDocument, variables, options);
    },
    pages(variables, options) {
      return requester(PagesDocument, variables, options);
    },
    pagesConnection(variables, options) {
      return requester(PagesConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "https://content.tinajs.io/3.0/content/509f5aad-938d-41aa-bfe9-c5f8ca3e441f/github/main",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
