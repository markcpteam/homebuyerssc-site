// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.HEAD || "main";
var GUIDE_GROUPS = [
  { value: "process", label: "Process" },
  { value: "repairs", label: "Repairs and condition" },
  { value: "foreclosure", label: "Foreclosure" },
  { value: "inherited", label: "Inherited and probate" },
  { value: "legal", label: "Legal and title" },
  { value: "divorce", label: "Divorce" },
  { value: "tenants", label: "Tenants" },
  { value: "location", label: "Location" },
  { value: "vacant", label: "Vacant property" }
];
var titleField = {
  type: "string",
  name: "title",
  label: "Page title",
  isTitle: true,
  required: true,
  description: "Shows as the headline on the page and as the blue link in Google. Aim for under 60 characters."
};
var descriptionField = {
  type: "string",
  name: "description",
  label: "Search description",
  required: true,
  ui: { component: "textarea" },
  description: "The grey summary under the link in Google results. Aim for 120 to 155 characters."
};
var oldUrlField = {
  type: "string",
  name: "oldUrl",
  label: "Old Leadpages URL (do not change)",
  description: "A record of where this page lived on the old site. Changing it does nothing good and loses the history. Leave it alone."
};
var bodyField = {
  type: "rich-text",
  name: "body",
  label: "Page content",
  isBody: true
};
var config_default = defineConfig({
  branch,
  clientId: "509f5aad-938d-41aa-bfe9-c5f8ca3e441f",
  token: process.env.TINA_TOKEN,
  // Where the admin screen gets built to. This produces plain static files
  // under public/admin, which is why the site can stay a static build.
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "img",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "guides",
        label: "Guides",
        path: "src/content/guides",
        format: "md",
        ui: {
          // New guides are allowed. Deleting is not: every guide has a redirect
          // pointing at it from the old site, and deleting one creates a dead link.
          allowedActions: { create: true, delete: false },
          // The file name is the page's web address. Locking it prevents an
          // edit from silently changing a live URL.
          filename: {
            readonly: true,
            slugify: (values) => (values?.title || "new-guide").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
          }
        },
        fields: [
          titleField,
          descriptionField,
          {
            type: "datetime",
            name: "pubDate",
            label: "Publish date",
            required: true,
            ui: { dateFormat: "YYYY-MM-DD" }
          },
          {
            type: "string",
            name: "group",
            label: "Group",
            required: true,
            options: GUIDE_GROUPS,
            description: "Which bucket this guide appears under on the guides page."
          },
          oldUrlField,
          bodyField
        ]
      },
      {
        name: "cities",
        label: "City pages",
        path: "src/content/cities",
        format: "md",
        ui: {
          allowedActions: { create: true, delete: false },
          filename: {
            readonly: true,
            slugify: (values) => "cash-home-buyers-" + (values?.city || "new-city").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-sc"
          }
        },
        fields: [
          titleField,
          descriptionField,
          {
            type: "string",
            name: "city",
            label: "City name",
            required: true,
            description: "Just the city, spelled the way it should appear on the page. For example: Mount Pleasant."
          },
          oldUrlField,
          bodyField
        ]
      },
      {
        name: "pages",
        label: "Other pages",
        path: "src/content/pages",
        format: "md",
        ui: {
          // This is a fixed set tied to specific site routes. Adding or removing
          // one here would not create or remove a page, so both are switched off.
          allowedActions: { create: false, delete: false },
          filename: { readonly: true }
        },
        fields: [
          titleField,
          descriptionField,
          {
            type: "string",
            name: "kind",
            label: "Kind",
            required: true,
            options: [
              { value: "main", label: "Main page" },
              { value: "orphan", label: "Not in navigation" }
            ]
          },
          oldUrlField,
          bodyField
        ]
      }
    ]
  }
});
export {
  config_default as default
};
