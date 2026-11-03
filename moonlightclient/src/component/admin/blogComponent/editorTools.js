import Header from "@editorjs/header";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Checklist from "@editorjs/checklist";
import Code from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";
import Delimiter from "@editorjs/delimiter";
import Marker from "@editorjs/marker";
import Embed from "@editorjs/embed";

export const EDITOR_JS_TOOLS = {
  header: {
    class: Header,
    config: {
      placeholder: "Enter a heading...",
      levels: [1, 2, 3],
      defaultLevel: 2,
    },
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      endpoints: {
        byFile: "/api/admin/blogs/uploadImage",
      },
      field: "image",
      types: "image/*",
    },
  },
  code: Code,
  inlineCode: InlineCode,
  table: {
    class: Table,
    inlineToolbar: true,
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  delimiter: Delimiter,
  marker: Marker,
  embed: {
    class: Embed,
    config: {
      services: {
        youtube: true,
        twitter: true,
      },
    },
  },
};